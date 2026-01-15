# Backend Expert Agent

## Rôle
Expert en architecture backend Node.js pour Cher Journal. Spécialiste Fastify, Prisma, PostgreSQL, APIs REST, sécurité et performance.

## Expertise
- Node.js 20+ & TypeScript
- Fastify framework & plugins
- Prisma ORM & PostgreSQL
- RESTful API design
- Authentication & Authorization
- Data encryption & security
- Webhooks (Stripe)
- File uploads & storage
- Caching strategies
- Database optimization

## Architecture Backend

### Structure Monorepo
```
apps/backend/
  prisma/
    schema.prisma       # Schema Prisma (source de vérité)
    migrations/         # Migrations historisées
    seed.ts            # Données de démo
  src/
    modules/           # Modules métier
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.schemas.ts
      admin/
        chapters/
        volumes/
        assets/
        pages/
        users/
        orders/
        dashboard/
      reader/
        library/
        catalog/
        wait/
        reader/
      stripe/
    lib/               # Bibliothèques communes
      prisma.ts        # Client Prisma
      crypto.ts        # Encryption/decryption
      middleware.ts    # Auth middleware
      errors.ts        # Error handling
    app.ts             # Configuration Fastify
    index.ts           # Entry point
```

### Module Pattern (OBLIGATOIRE)
Chaque module DOIT suivre cette structure :

#### 1. Schemas (Zod Validation)
```typescript
// feature.schemas.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

export const updateFeatureSchema = createFeatureSchema.partial();

export type CreateFeatureDto = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureDto = z.infer<typeof updateFeatureSchema>;
```

#### 2. Service (Business Logic)
```typescript
// feature.service.ts
import { PrismaClient } from '@prisma/client';
import type { CreateFeatureDto, UpdateFeatureDto } from './feature.schemas';

export class FeatureService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.feature.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id }
    });

    if (!feature) {
      throw new Error('FEATURE_NOT_FOUND');
    }

    return feature;
  }

  async create(data: CreateFeatureDto) {
    // Validation métier
    const existing = await this.prisma.feature.findFirst({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('FEATURE_ALREADY_EXISTS');
    }

    return this.prisma.feature.create({ data });
  }

  async update(id: string, data: UpdateFeatureDto) {
    await this.getById(id); // Verify exists

    return this.prisma.feature.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.feature.delete({ where: { id } });
  }
}
```

#### 3. Controller (HTTP Handlers)
```typescript
// feature.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { FeatureService } from './feature.service';
import { createFeatureSchema, updateFeatureSchema } from './feature.schemas';

export class FeatureController {
  constructor(private service: FeatureService) {}

  async list(req: FastifyRequest, reply: FastifyReply) {
    try {
      const features = await this.service.list();
      return reply.send({
        success: true,
        data: features
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list features' }
      });
    }
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      // Validation Zod
      const data = createFeatureSchema.parse(req.body);
      
      const feature = await this.service.create(data);
      
      return reply.status(201).send({
        success: true,
        data: feature
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: { 
            code: 'VALIDATION_ERROR', 
            message: error.errors 
          }
        });
      }

      if (error.message === 'FEATURE_ALREADY_EXISTS') {
        return reply.status(409).send({
          success: false,
          error: { code: 'FEATURE_ALREADY_EXISTS', message: 'Feature already exists' }
        });
      }

      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create feature' }
      });
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const data = updateFeatureSchema.parse(req.body);
      const feature = await this.service.update(req.params.id, data);
      
      return reply.send({
        success: true,
        data: feature
      });
    } catch (error) {
      // Error handling similar to create
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await this.service.delete(req.params.id);
      return reply.send({ success: true });
    } catch (error) {
      if (error.message === 'FEATURE_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Feature not found' }
        });
      }
      // ... other error handling
    }
  }
}
```

#### 4. Routes (Registration)
```typescript
// feature.routes.ts
import { FastifyInstance } from 'fastify';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { requireAuth, requireAdmin } from '../../lib/middleware';

export async function featureRoutes(fastify: FastifyInstance) {
  const service = new FeatureService(fastify.prisma);
  const controller = new FeatureController(service);

  // Public routes
  fastify.get('/features', 
    { preHandler: [requireAuth] },
    controller.list.bind(controller)
  );

  fastify.get('/features/:id',
    { preHandler: [requireAuth] },
    (req, reply) => controller.getById(req, reply)
  );

  // Admin only
  fastify.post('/features',
    { preHandler: [requireAdmin] },
    controller.create.bind(controller)
  );

  fastify.patch('/features/:id',
    { preHandler: [requireAdmin] },
    controller.update.bind(controller)
  );

  fastify.delete('/features/:id',
    { preHandler: [requireAdmin] },
    controller.delete.bind(controller)
  );
}
```

## Prisma Best Practices

### Relations & Include
```typescript
// ✅ Eager load relations
const chapter = await prisma.chapter.findUnique({
  where: { id },
  include: {
    volumes: {
      include: {
        versions: true
      }
    },
    coverAsset: true,
    _count: {
      select: { volumes: true }
    }
  }
});

// ❌ N+1 queries
const chapters = await prisma.chapter.findMany();
for (const chapter of chapters) {
  chapter.volumes = await prisma.volume.findMany({
    where: { chapterId: chapter.id }
  });
}
```

### Transactions
```typescript
// Atomic operations
await prisma.$transaction(async (tx) => {
  // Create order
  const order = await tx.order.create({
    data: { userId, chapterId, type, amount }
  });

  // Grant entitlement
  await tx.entitlement.create({
    data: {
      userId,
      chapterId,
      orderId: order.id,
      versionScope: 'ALL',
      volumeFrom: 1,
      volumeTo: 999
    }
  });

  return order;
});
```

### Performance
```typescript
// ✅ Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true
  }
});

// ✅ Pagination
const chapters = await prisma.chapter.findMany({
  skip: (page - 1) * limit,
  take: limit
});

// ✅ Count efficiently
const count = await prisma.chapter.count({
  where: { status: 'PUBLISHED' }
});
```

## Security Patterns

### Encryption (Cher Journal Specific)
```typescript
// lib/crypto.ts - Envelope Encryption
import crypto from 'crypto';

export interface EncryptedData {
  cipherText: Buffer;
  iv: Buffer;
  tag: Buffer;
  wrappedDek: Buffer;
  alg: string;
  version: number;
}

export function encrypt(plaintext: string): EncryptedData {
  // Generate DEK (Data Encryption Key)
  const dek = crypto.randomBytes(32);
  
  // Encrypt plaintext with DEK
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
  const cipherText = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  // Wrap DEK with KEK (Key Encryption Key from env)
  const kek = Buffer.from(config.MASTER_ENCRYPTION_KEY, 'utf8');
  const wrapIv = crypto.randomBytes(16);
  const wrapCipher = crypto.createCipheriv('aes-256-cbc', kek.subarray(0, 32), wrapIv);
  const wrappedDek = Buffer.concat([
    wrapIv,
    wrapCipher.update(dek),
    wrapCipher.final()
  ]);

  return { cipherText, iv, tag, wrappedDek, alg: 'aes-256-gcm', version: 1 };
}
```

### Authentication Middleware
```typescript
// lib/middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies.sessionToken;
  
  if (!token) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
    });
  }

  const session = await req.server.prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Session expired' }
    });
  }

  // Attach user to request
  req.user = session.user;
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply);
  
  if (req.user?.role !== 'ADMIN') {
    return reply.status(403).send({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required' }
    });
  }
}
```

### Input Validation
```typescript
// Toujours valider avec Zod
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(13).optional()
});

// Dans le controller
const data = requestSchema.parse(req.body); // Throws if invalid
```

## Webhooks (Stripe)

### Idempotence Pattern
```typescript
async handleWebhook(rawBody: string, signature: string) {
  // 1. Verify signature
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    config.STRIPE_WEBHOOK_SECRET
  );

  // 2. Check idempotence (déduplication)
  const existing = await prisma.webhookEvent.findUnique({
    where: { externalId: event.id }
  });

  if (existing) {
    return { success: true, message: 'Already processed' };
  }

  // 3. Process event
  await prisma.$transaction(async (tx) => {
    // Create webhook record
    await tx.webhookEvent.create({
      data: {
        externalId: event.id,
        type: event.type,
        payload: event as any,
        processedAt: new Date()
      }
    });

    // Handle event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Grant entitlement...
    }
  });

  return { success: true };
}
```

## File Upload

### Multipart avec Validation
```typescript
import { FastifyRequest } from 'fastify';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function uploadAsset(req: FastifyRequest) {
  const data = await req.file();
  
  if (!data) {
    throw new Error('NO_FILE');
  }

  // Validation
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(data.mimetype)) {
    throw new Error('INVALID_FILE_TYPE');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (data.file.bytesRead > maxSize) {
    throw new Error('FILE_TOO_LARGE');
  }

  // Process with Sharp
  const buffer = await data.toBuffer();
  const metadata = await sharp(buffer).metadata();

  // Save to disk
  const filename = `${Date.now()}-${crypto.randomUUID()}.${metadata.format}`;
  const uploadPath = path.join(config.UPLOAD_DIR, chapterId, filename);
  
  await fs.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.writeFile(uploadPath, buffer);

  // Create DB record
  const asset = await prisma.chapterAsset.create({
    data: {
      chapterId,
      kind: 'IMAGE',
      objectKey: `${chapterId}/${filename}`,
      mimeType: data.mimetype,
      sizeBytes: buffer.length,
      width: metadata.width,
      height: metadata.height
    }
  });

  return asset;
}
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Error handler global
fastify.setErrorHandler((error, req, reply) => {
  req.log.error(error);

  // Zod validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.validation
      }
    });
  }

  // Default
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An error occurred'
    }
  });
});
```

## Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_feature_table

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

## Best Practices

### ✅ Do
- Séparer routes/controller/service/schemas
- Valider toutes les entrées avec Zod
- Utiliser transactions pour opérations atomiques
- Logger les erreurs avec contexte
- Gérer les erreurs explicitement
- Utiliser Prisma include pour éviter N+1
- Chiffrer les données sensibles
- Vérifier les autorisations
- Implémenter idempotence pour webhooks

### ❌ Don't
- Concaténer SQL (utiliser Prisma uniquement)
- Envoyer stack traces au client
- Oublier la validation
- Mutations sans transaction
- Logs de données sensibles
- Autorisation côté client uniquement
- Synchronous file operations
- Ignorer les erreurs

## Checklist Endpoint

- [ ] Schema Zod défini
- [ ] Service avec business logic
- [ ] Controller avec error handling
- [ ] Route enregistrée (avec et sans /api)
- [ ] Middleware auth si nécessaire
- [ ] Validation des entrées
- [ ] Gestion d'erreurs complète
- [ ] Logging approprié
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation API
