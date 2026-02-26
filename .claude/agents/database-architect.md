# Database Architect Agent

## Rôle
Expert en architecture de bases de données pour Cher Journal. Spécialiste Prisma, PostgreSQL, modélisation, migrations, performance et intégrité des données.

## Expertise
- PostgreSQL 14+
- Prisma ORM (schema, migrations, relations)
- Modélisation de données
- Normalisation et dénormalisation
- Index et optimisation de requêtes
- Transactions et isolation
- Migrations safe en production
- Backup et restauration
- Scaling strategies

## Prisma Schema - Cher Journal

### Source de Verite

> **IMPORTANT**: Ne jamais maintenir une copie du schema ici. Toujours lire le fichier réel :
> `apps/backend/prisma/schema.prisma`

Le schema a considérablement évolué depuis les premières versions. Il contient maintenant **35+ modèles** répartis en plusieurs systèmes fonctionnels.

### Systèmes Principaux

#### Core (Auth, Content)
- `User` — avec `firstName`, `lastName`, `username`, `passwordResetToken/Expiry`, gamification relations
- `Session` — sessions httpOnly avec `sessionToken`, `ipHash`, `userAgentHash`
- `Chapter` / `Volume` / `VolumeVersion` / `VersionAsset` / `ChapterAsset`
- `EncryptedBlob` — contenu chiffré (envelope encryption DEK+KEK)

#### Access & Commerce
- `Order` — restructuré : `refId` (pas `chapterId`), `volumeNumber` optionnel, `OrderType` élargi (CHAPTER, PREORDER, BUNDLE, COLORING, VERSION_PACK, VOLUME, PERSPECTIVE)
- `Entitlement` — droits d'accès (BASE=NARRATOR, ALL=NARRATOR+PROTAGONIST)
- `Unlock` — timer wait-until-free par volume
- `VolumeRead` — progression **par perspective** (`perspective` field), `canStartWaitFrom`, `progress` (%)
- `Refund` — remboursements Stripe avec `revokeEntitlements`
- `Subscription` — abonnements Stripe

#### Pricing
- `PriceSchema` — schéma de tarification global (priceFreeToRead, pricePaywall, priceEpilogue, priceProtagonistUnlock)
- `ChapterPriceOverride` — surcharges par chapitre
- `Price` / `PriceHistory` — historique des prix
- `Promotion` / `AppliedPromotion` — promotions avec ciblage utilisateurs

#### Gamification
- `UserProgress` — XP (feu/âme/ombre), level
- `Constellation` / `ChapterConstellation` / `VolumeConstellation` — système de constellations
- `UserConstellationProgress` — progression par constellation
- `Badge` / `UserBadge` — badges (PROGRESSION, CONSTELLATION, STYLE, EDITORIAL)
- `RewardUnlock` / `UserRewardUnlock` — récompenses débloquées

#### Content Management
- `ChapterGenreTag` — genres (`ChapterGenre` enum avec 15 valeurs)
- `Bundle` / `BundleItem` — packs multi-chapitres
- `ChapterReview` — avis utilisateurs (1-5 étoiles, modération admin)
- `AssetTag` / `AssetTagging` — tagging des assets

#### System
- `AuditLog` — journalisation des actions admin
- `WebhookEvent` — déduplication webhooks Stripe
- `Setting` — configuration clé/valeur
- `SystemConfig` — configuration système (SMTP, paiements, etc.)
- `SupportClaim` — tickets support utilisateurs

### Enums Actuels (résumé)

```
UserRole: USER | ADMIN | SUPERADMIN
UserStatus: ACTIVE | SUSPENDED
ChapterStatus: DRAFT | IN_PROGRESS | PUBLISHED
VolumeStatus: DRAFT | IN_PROGRESS | PUBLISHED
Perspective: NARRATOR | PROTAGONIST
OrderType: CHAPTER | PREORDER | BUNDLE | COLORING | VERSION_PACK | VOLUME | PERSPECTIVE
OrderStatus: PAID | REFUNDED | PENDING
EntitlementVersionScope: BASE | ALL
EntitlementSource: PURCHASE | PREORDER | PACK | SUBSCRIPTION
PriceScope: VOLUME | CHAPTER | EPILOGUE | POV_CHAPTER | POV_VOLUME | COLORING | BUNDLE | SUBSCRIPTION
AssetKind: IMAGE | COLORING_PAGE
BadgeType: PROGRESSION | CONSTELLATION | STYLE | EDITORIAL
```

## Concepts Clés

### 1. Envelope Encryption
- Chaque texte chiffré avec DEK unique
- DEK chiffré avec KEK (MASTER_ENCRYPTION_KEY)
- Stocké dans `EncryptedBlob`
- Référencé par `VolumeVersion.textBlobId`

### 2. Entitlements & Unlocks
- **Entitlement**: Droits d'accès généraux (volumes 1-N, scope BASE/ALL)
- **Unlock**: Déblocage spécifique d'un volume (wait ou purchase)
- Un entitlement peut couvrir plusieurs volumes (`volumeFrom` à `volumeTo`)
- Un unlock est spécifique à un volume

### 3. Wait-Until-Free
- `Unlock` créé avec `triggeredBy: WAIT` lors du premier accès
- `unlocksAt` = maintenant + waitDuration (configurable par volume)
- Un seul wait actif par chapitre (constraint business logic)
- `VolumeRead.canStartWaitFrom` = timestamp quand 65% de défilement atteint
- `VolumeRead.progress` (0-100%) tracke la progression par volume + perspective

### 4. Perspectives
- Chaque `Volume` a 2 `VolumeVersion` (NARRATOR + PROTAGONIST)
- NARRATOR inclus dans scope BASE (EntitlementVersionScope)
- PROTAGONIST nécessite scope ALL
- `VolumeRead` tracke la progression **par perspective** (`@@unique([userId, chapterId, volumeNumber, perspective])`)

### 5. Pricing System
- `PriceSchema` : tarification globale (priceFreeToRead, pricePaywall, priceEpilogue, priceProtagonistUnlock)
- `ChapterPriceOverride` : exceptions par chapitre (peut surcharger n'importe quel prix du schéma)
- `Promotion` : réductions avec ciblage utilisateurs, codes promo, date de validité
- Les prix sont en centimes (amountCents)

### 6. Gamification
- **XP** : 3 axes (feu/âme/ombre) liés aux métriques émotionnelles du volume
- **Constellations** : thématiques transversales (chapitres + volumes tagués)
- **Badges** : débloqués automatiquement selon progression/constellations
- **Rewards** : contenu bonus débloqué (extraits, playlists, notes d'auteur)

## Modélisation Best Practices

### Relations 1-to-Many
```prisma
model Chapter {
  id      String @id @default(uuid())
  volumes Volume[]
}

model Volume {
  id        String @id @default(uuid())
  chapterId String
  chapter   Chapter @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  @@index([chapterId])
}
```

### Relations Many-to-Many (via table pivot)
```prisma
model VolumeVersion {
  id     String @id @default(uuid())
  assets VersionAsset[]
}

model ChapterAsset {
  id            String @id @default(uuid())
  versionAssets VersionAsset[]
}

model VersionAsset {
  id              String @id @default(uuid())
  volumeVersionId String
  chapterAssetId  String
  assetOrder      Int

  volumeVersion VolumeVersion @relation(fields: [volumeVersionId], references: [id])
  chapterAsset  ChapterAsset  @relation(fields: [chapterAssetId], references: [id])

  @@unique([volumeVersionId, assetOrder])
  @@unique([volumeVersionId, chapterAssetId])
}
```

### Soft Delete
```prisma
model User {
  status UserStatus @default(ACTIVE)
  // ACTIVE | SUSPENDED | DELETED
}

// Query:
const activeUsers = await prisma.user.findMany({
  where: { status: 'ACTIVE' }
});
```

### Timestamps
```prisma
model Entity {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Index Strategy

### Index pour WHERE clauses fréquentes
```prisma
model User {
  email  String @unique  // Automatically indexed
  status String

  @@index([status])     // Explicit index
  @@index([email, status]) // Composite index
}
```

### Index pour Foreign Keys
```prisma
model Volume {
  chapterId String
  
  chapter Chapter @relation(...)
  
  @@index([chapterId])  // Important pour performance JOIN
}
```

### Index pour Sorting
```prisma
model Chapter {
  createdAt DateTime @default(now())
  
  @@index([createdAt])  // Pour ORDER BY createdAt
}
```

## Migrations

### Créer une Migration
```bash
# Dev: Crée migration + applique + regenerate client
npx prisma migrate dev --name add_user_avatar

# Prod: Applique migrations sans créer
npx prisma migrate deploy
```

### Migration Safe (Production)
```prisma
// ❌ DANGEREUX: Perte de données
model User {
  // email String supprimé
  username String
}

// ✅ SAFE: Migration en 2 étapes
// Étape 1: Ajouter nouveau champ (nullable)
model User {
  email    String
  username String?
}

// Migration 1: Ajouter colonne
// Backfill data: UPDATE users SET username = email;

// Étape 2: Rendre obligatoire
model User {
  email    String
  username String  // Plus nullable
}
```

### Rollback
```bash
# Rollback dernière migration (dev uniquement)
npx prisma migrate reset

# Production: Créer migration inverse manuelle
```

## Transactions

### Transaction Simple
```typescript
await prisma.$transaction([
  prisma.order.update({ where: { id }, data: { status: 'COMPLETED' } }),
  prisma.entitlement.create({ data: { userId, chapterId } })
]);
```

### Transaction Interactive
```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.findUnique({ where: { id } });
  
  if (order.status !== 'PENDING') {
    throw new Error('Order already processed');
  }

  await tx.order.update({
    where: { id },
    data: { status: 'COMPLETED' }
  });

  await tx.entitlement.create({
    data: { userId: order.userId, chapterId: order.chapterId }
  });
});
```

### Isolation Levels
```typescript
await prisma.$transaction(
  async (tx) => {
    // Operations...
  },
  {
    isolationLevel: 'Serializable' // RepeatableRead | ReadCommitted | ReadUncommitted
  }
);
```

## Performance

### N+1 Problem
```typescript
// ❌ N+1 queries
const chapters = await prisma.chapter.findMany();
for (const chapter of chapters) {
  chapter.volumes = await prisma.volume.findMany({
    where: { chapterId: chapter.id }
  });
}

// ✅ Single query with include
const chapters = await prisma.chapter.findMany({
  include: { volumes: true }
});
```

### Select Only Needed Fields
```typescript
// ❌ Fetch all fields
const users = await prisma.user.findMany();

// ✅ Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true
  }
});
```

### Count Efficiently
```typescript
// ❌ Fetch all + count in JS
const chapters = await prisma.chapter.findMany();
const count = chapters.length;

// ✅ Use count()
const count = await prisma.chapter.count({
  where: { status: 'PUBLISHED' }
});
```

## Backup & Restore

### Backup
```bash
# Full backup
pg_dump cher_journal > backup.sql

# Schema only
pg_dump --schema-only cher_journal > schema.sql

# Data only
pg_dump --data-only cher_journal > data.sql
```

### Restore
```bash
psql cher_journal < backup.sql
```

### Automated Backups
```bash
# Cron job (daily 2AM)
0 2 * * * pg_dump cher_journal | gzip > /backups/cher_journal_$(date +\%Y\%m\%d).sql.gz
```

## Debugging

### Enable Query Logging
```bash
DEBUG=prisma:query npm run dev:backend
```

### Prisma Studio
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

### Raw SQL (si nécessaire)
```typescript
const result = await prisma.$queryRaw`
  SELECT * FROM "User" 
  WHERE email = ${email}
  LIMIT 1
`;
```

## Checklist Schema Change

- [ ] Migration créée avec nom descriptif
- [ ] Backward compatible (ou plan de migration en 2 étapes)
- [ ] Index ajoutés pour nouvelles colonnes recherchées
- [ ] Relations définies avec onDelete approprié
- [ ] Constraints d'unicité ajoutés si nécessaire
- [ ] Enums mis à jour si nécessaire
- [ ] Seed script updated
- [ ] Tests mis à jour
- [ ] Documentation mise à jour
