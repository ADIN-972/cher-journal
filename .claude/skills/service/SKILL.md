# Skill: Service

## Description
Création de services backend (business logic) pour Cher Journal suivant l'architecture module.

## Usage
```
@service [name] [module]
```

## Service Pattern

### Structure
```
apps/backend/src/modules/[module]/
  [module].service.ts      ← Business Logic
  [module].controller.ts   ← HTTP Handlers
  [module].routes.ts       ← Route Registration
  [module].schemas.ts      ← Validation
```

## Template Service

```typescript
// apps/backend/src/modules/feature/feature.service.ts
import { PrismaClient } from '@prisma/client';
import type { 
  CreateFeatureDto, 
  UpdateFeatureDto 
} from './feature.schemas';

export class FeatureService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Liste toutes les features
   */
  async list() {
    return this.prisma.feature.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Récupère une feature par ID
   * @throws {Error} FEATURE_NOT_FOUND si non trouvée
   */
  async getById(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id }
    });

    if (!feature) {
      throw new Error('FEATURE_NOT_FOUND');
    }

    return feature;
  }

  /**
   * Crée une nouvelle feature
   * @throws {Error} FEATURE_ALREADY_EXISTS si nom existe déjà
   */
  async create(data: CreateFeatureDto) {
    // Validation métier
    const existing = await this.prisma.feature.findFirst({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('FEATURE_ALREADY_EXISTS');
    }

    // Création
    return this.prisma.feature.create({ data });
  }

  /**
   * Met à jour une feature
   * @throws {Error} FEATURE_NOT_FOUND si non trouvée
   */
  async update(id: string, data: UpdateFeatureDto) {
    // Vérifier existence
    await this.getById(id);

    // Mise à jour
    return this.prisma.feature.update({
      where: { id },
      data
    });
  }

  /**
   * Supprime une feature
   * @throws {Error} FEATURE_NOT_FOUND si non trouvée
   */
  async delete(id: string) {
    // Vérifier existence
    await this.getById(id);

    // Suppression
    return this.prisma.feature.delete({
      where: { id }
    });
  }
}
```

## Services Cher Journal

### 1. Auth Service
```typescript
// apps/backend/src/modules/auth/auth.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { RegisterDto, LoginDto } from './auth.schemas';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(data: RegisterDto) {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        status: 'ACTIVE',
        role: 'USER'
      }
    });

    return user;
  }

  async login(data: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check password
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      throw new Error('ACCOUNT_SUSPENDED');
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return { user, token, expiresAt };
  }

  async logout(token: string) {
    await this.prisma.session.delete({
      where: { token }
    });
  }

  async getMe(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error('INVALID_SESSION');
    }

    return session.user;
  }
}
```

### 2. Wait Service (Wait-Until-Free)
```typescript
// apps/backend/src/modules/reader/wait/wait.service.ts
import { PrismaClient } from '@prisma/client';
import { config } from '@cher-journal/config';

export class WaitService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Démarre un timer wait-until-free pour un volume
   * @throws {Error} VOLUME_NOT_FOUND
   * @throws {Error} NO_ACCESS
   * @throws {Error} WAIT_ALREADY_ACTIVE
   */
  async startWait(
    userId: string,
    chapterId: string,
    volumeNumber: number
  ) {
    // 1. Vérifier que le volume existe
    const volume = await this.prisma.volume.findUnique({
      where: { chapterId_volumeNumber: { chapterId, volumeNumber } }
    });

    if (!volume) {
      throw new Error('VOLUME_NOT_FOUND');
    }

    // 2. Vérifier que l'utilisateur a un entitlement
    const entitlement = await this.prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
        volumeFrom: { lte: volumeNumber },
        volumeTo: { gte: volumeNumber }
      }
    });

    if (!entitlement) {
      throw new Error('NO_ACCESS');
    }

    // 3. Vérifier qu'il n'y a pas déjà un wait actif sur ce chapitre
    const activeWait = await this.prisma.unlock.findFirst({
      where: {
        userId,
        chapterId,
        triggeredBy: 'WAIT',
        unlocksAt: { gt: new Date() }
      }
    });

    if (activeWait) {
      throw new Error('WAIT_ALREADY_ACTIVE');
    }

    // 4. Créer le unlock
    const unlocksAt = new Date(Date.now() + config.WAIT_DURATION_MS);

    const unlock = await this.prisma.unlock.create({
      data: {
        userId,
        chapterId,
        volumeNumber,
        triggeredBy: 'WAIT',
        unlocksAt
      }
    });

    // 5. Créer/mettre à jour VolumeRead
    await this.prisma.volumeRead.upsert({
      where: {
        userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber }
      },
      create: {
        userId,
        chapterId,
        volumeNumber
      },
      update: {
        lastReadAt: new Date()
      }
    });

    return {
      unlocksAt,
      remainingMs: unlocksAt.getTime() - Date.now()
    };
  }

  /**
   * Récupère le statut d'un wait
   */
  async getStatus(
    userId: string,
    chapterId: string,
    volumeNumber: number
  ) {
    const unlock = await this.prisma.unlock.findUnique({
      where: {
        userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber }
      }
    });

    if (!unlock) {
      return null;
    }

    const now = Date.now();
    const unlocksAtMs = unlock.unlocksAt.getTime();

    return {
      isActive: unlocksAtMs > now,
      unlocksAt: unlock.unlocksAt,
      remainingMs: Math.max(0, unlocksAtMs - now)
    };
  }

  /**
   * Liste tous les waits actifs d'un utilisateur
   */
  async listActive(userId: string) {
    const unlocks = await this.prisma.unlock.findMany({
      where: {
        userId,
        triggeredBy: 'WAIT',
        unlocksAt: { gt: new Date() }
      },
      include: {
        volume: {
          include: {
            chapter: true
          }
        }
      }
    });

    return unlocks.map(unlock => ({
      chapterId: unlock.chapterId,
      chapterTitle: unlock.volume.chapter.title,
      volumeNumber: unlock.volumeNumber,
      unlocksAt: unlock.unlocksAt,
      remainingMs: unlock.unlocksAt.getTime() - Date.now()
    }));
  }
}
```

### 3. Library Service
```typescript
// apps/backend/src/modules/reader/library/library.service.ts
import { PrismaClient } from '@prisma/client';

export class LibraryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Récupère la bibliothèque d'un utilisateur
   */
  async getLibrary(userId: string) {
    // Récupérer tous les entitlements de l'utilisateur
    const entitlements = await this.prisma.entitlement.findMany({
      where: { userId },
      include: {
        chapter: {
          include: {
            coverAsset: true,
            _count: { select: { volumes: true } }
          }
        }
      }
    });

    // Pour chaque chapitre, récupérer le statut des waits et lectures
    const library = await Promise.all(
      entitlements.map(async (ent) => {
        // Volumes disponibles (range de l'entitlement)
        const availableVolumes = Array.from(
          { length: ent.volumeTo - ent.volumeFrom + 1 },
          (_, i) => ent.volumeFrom + i
        );

        // Dernier volume lu
        const lastRead = await this.prisma.volumeRead.findFirst({
          where: {
            userId,
            chapterId: ent.chapterId
          },
          orderBy: { lastReadAt: 'desc' }
        });

        // Wait actif
        const activeWait = await this.prisma.unlock.findFirst({
          where: {
            userId,
            chapterId: ent.chapterId,
            triggeredBy: 'WAIT',
            unlocksAt: { gt: new Date() }
          }
        });

        return {
          chapter: ent.chapter,
          availableVolumes,
          currentVolume: lastRead?.volumeNumber || 1,
          versionScope: ent.versionScope,
          waitStatus: activeWait ? {
            isActive: true,
            unlocksAt: activeWait.unlocksAt,
            remainingMs: activeWait.unlocksAt.getTime() - Date.now()
          } : null
        };
      })
    );

    return library;
  }
}
```

### 4. Stripe Service
```typescript
// apps/backend/src/modules/stripe/stripe.service.ts
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { config } from '@cher-journal/config';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export class StripeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crée une session Stripe Checkout
   */
  async createCheckoutSession(
    userId: string,
    chapterId: string,
    type: 'CHAPTER',
    versionScope: 'BASE' | 'ALL',
    successUrl: string,
    cancelUrl: string
  ) {
    // Créer la commande
    const order = await this.prisma.order.create({
      data: {
        userId,
        chapterId,
        type,
        status: 'PENDING',
        amount: versionScope === 'ALL' ? 2999 : 1499, // Centimes
        currency: 'eur'
      }
    });

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Chapitre ${type} - ${versionScope}`
          },
          unit_amount: order.amount
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        userId,
        chapterId,
        versionScope
      }
    });

    // Mettre à jour l'order avec l'ID de session
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  }

  /**
   * Traite un webhook Stripe
   * @throws {Error} INVALID_SIGNATURE si signature invalide
   */
  async handleWebhook(rawBody: string, signature: string) {
    // Vérifier la signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new Error('INVALID_SIGNATURE');
    }

    // Vérifier idempotence
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { externalId: event.id }
    });

    if (existing) {
      return { success: true, message: 'Already processed' };
    }

    // Traiter l'événement
    if (event.type === 'checkout.session.completed') {
      await this.prisma.$transaction(async (tx) => {
        // Enregistrer le webhook
        await tx.webhookEvent.create({
          data: {
            externalId: event.id,
            type: event.type,
            payload: event as any,
            processedAt: new Date()
          }
        });

        // Récupérer la session
        const session = event.data.object as Stripe.Checkout.Session;
        const { orderId, userId, chapterId, versionScope } = session.metadata!;

        // Mettre à jour l'order
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            stripePaymentIntentId: session.payment_intent as string,
            completedAt: new Date()
          }
        });

        // Créer l'entitlement
        await tx.entitlement.create({
          data: {
            userId,
            chapterId,
            orderId,
            versionScope: versionScope as 'BASE' | 'ALL',
            source: 'PURCHASE',
            volumeFrom: 1,
            volumeTo: 999 // Tous les volumes
          }
        });
      });
    }

    return { success: true };
  }
}
```

## Service Best Practices

### ✅ Do
- Séparer business logic du HTTP
- Valider données métier (en plus de Zod)
- Utiliser transactions pour opérations atomiques
- Throw errors avec codes clairs
- Documenter avec JSDoc
- Tester unitairement
- Retourner types stricts

### ❌ Don't
- Logique HTTP dans le service
- Accès direct à request/reply
- Mutations sans transaction
- Errors vagues ("Error", "Failed")
- Services géants (> 500 lignes)
- Dépendances circulaires
- Side effects cachés

## Checklist Service

- [ ] PrismaClient injecté via constructor
- [ ] Méthodes documentées (JSDoc)
- [ ] Validation métier implémentée
- [ ] Errors avec codes clairs
- [ ] Transactions pour opérations atomiques
- [ ] Types stricts (DTOs)
- [ ] Tests unitaires
- [ ] Pas de dépendance à Fastify
