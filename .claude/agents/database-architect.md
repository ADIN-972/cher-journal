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

### Schema Complet
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum UserRole {
  USER
  ADMIN
}

enum ChapterStatus {
  DRAFT
  IN_PROGRESS
  PUBLISHED
  ARCHIVED
}

enum Perspective {
  NARRATOR      // Vue narrateur (inclus dans BASE)
  PROTAGONIST   // Vue protagoniste (nécessite ALL)
}

enum OrderType {
  CHAPTER       // Achat chapitre complet
  VOLUME        // Achat volume individuel (non utilisé actuellement)
}

enum OrderStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum EntitlementVersionScope {
  BASE          // Accès perspective NARRATOR uniquement
  ALL           // Accès NARRATOR + PROTAGONIST
}

enum EntitlementSource {
  PURCHASE      // Achat Stripe
  PROMO         // Code promo
  ADMIN         // Attribution admin
}

enum UnlockTriggeredBy {
  WAIT          // Timer wait-until-free
  PURCHASE      // Achat direct
}

enum AssetKind {
  IMAGE
  COVER
  ILLUSTRATION
}

// ==================== MODELS ====================

model User {
  id           String      @id @default(uuid())
  publicId     String      @unique @default(uuid())
  email        String      @unique
  passwordHash String
  status       UserStatus  @default(ACTIVE)
  role         UserRole    @default(USER)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  sessions     Session[]
  orders       Order[]
  entitlements Entitlement[]
  unlocks      Unlock[]
  volumeReads  VolumeRead[]

  @@index([email])
  @@index([status])
}

model Session {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}

model Chapter {
  id              String        @id @default(uuid())
  title           String
  protagonistName String
  status          ChapterStatus @default(DRAFT)
  coverAssetId    String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  coverAsset   ChapterAsset?   @relation("ChapterCover", fields: [coverAssetId], references: [id], onDelete: SetNull)
  volumes      Volume[]
  assets       ChapterAsset[]  @relation("ChapterAssets")
  orders       Order[]
  entitlements Entitlement[]

  @@index([status])
}

model Volume {
  id                    String   @id @default(uuid())
  chapterId             String
  volumeNumber          Int
  isFinalPaywall        Boolean  @default(false)
  illustrationAssetId   String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  chapter           Chapter          @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  illustrationAsset ChapterAsset?    @relation("VolumeIllustration", fields: [illustrationAssetId], references: [id], onDelete: SetNull)
  versions          VolumeVersion[]
  unlocks           Unlock[]
  volumeReads       VolumeRead[]

  @@unique([chapterId, volumeNumber])
  @@index([chapterId])
  @@index([volumeNumber])
}

model VolumeVersion {
  id                    String      @id @default(uuid())
  volumeId              String
  perspective           Perspective
  title                 String
  illustrationAssetId   String?
  textBlobId            String?     @unique
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  volume            Volume         @relation(fields: [volumeId], references: [id], onDelete: Cascade)
  illustrationAsset ChapterAsset?  @relation("VolumeVersionIllustration", fields: [illustrationAssetId], references: [id], onDelete: SetNull)
  textBlob          EncryptedBlob? @relation(fields: [textBlobId], references: [id])
  assets            VersionAsset[]

  @@unique([volumeId, perspective])
  @@index([volumeId])
  @@index([perspective])
}

model VersionAsset {
  id              String @id @default(uuid())
  volumeVersionId String
  assetOrder      Int
  chapterAssetId  String

  volumeVersion VolumeVersion @relation(fields: [volumeVersionId], references: [id], onDelete: Cascade)
  chapterAsset  ChapterAsset  @relation(fields: [chapterAssetId], references: [id], onDelete: Cascade)

  @@unique([volumeVersionId, assetOrder])
  @@unique([volumeVersionId, chapterAssetId])
  @@index([volumeVersionId])
}

model ChapterAsset {
  id         String    @id @default(uuid())
  chapterId  String
  kind       AssetKind
  label      String?
  objectKey  String    @unique
  mimeType   String
  sizeBytes  Int
  width      Int?
  height     Int?
  createdAt  DateTime  @default(now())

  chapter                     Chapter         @relation("ChapterAssets", fields: [chapterId], references: [id], onDelete: Cascade)
  usedAsChapterCover          Chapter[]       @relation("ChapterCover")
  usedAsVolumeIllustration    Volume[]        @relation("VolumeIllustration")
  usedAsVersionIllustration   VolumeVersion[] @relation("VolumeVersionIllustration")
  versionAssets               VersionAsset[]

  @@index([chapterId])
  @@index([kind])
}

model Order {
  id                    String      @id @default(uuid())
  userId                String
  chapterId             String
  type                  OrderType
  status                OrderStatus @default(PENDING)
  amount                Int
  currency              String      @default("eur")
  stripeSessionId       String?     @unique
  stripePaymentIntentId String?     @unique
  completedAt           DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter      Chapter       @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  entitlements Entitlement[]

  @@index([userId])
  @@index([chapterId])
  @@index([status])
  @@index([stripeSessionId])
}

model Entitlement {
  id           String                    @id @default(uuid())
  userId       String
  chapterId    String
  orderId      String?
  versionScope EntitlementVersionScope
  source       EntitlementSource
  volumeFrom   Int
  volumeTo     Int
  createdAt    DateTime                  @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  order   Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([chapterId])
  @@index([userId, chapterId])
}

model Unlock {
  id          String            @id @default(uuid())
  userId      String
  chapterId   String
  volumeNumber Int
  triggeredBy UnlockTriggeredBy
  unlocksAt   DateTime
  createdAt   DateTime          @default(now())

  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  volume  Volume @relation(fields: [chapterId, volumeNumber], references: [chapterId, volumeNumber], onDelete: Cascade)

  @@unique([userId, chapterId, volumeNumber])
  @@index([userId])
  @@index([chapterId, volumeNumber])
  @@index([unlocksAt])
}

model VolumeRead {
  id           String   @id @default(uuid())
  userId       String
  chapterId    String
  volumeNumber Int
  lastReadAt   DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  volume Volume @relation(fields: [chapterId, volumeNumber], references: [chapterId, volumeNumber], onDelete: Cascade)

  @@unique([userId, chapterId, volumeNumber])
  @@index([userId])
  @@index([chapterId, volumeNumber])
}

model EncryptedBlob {
  id         String   @id @default(uuid())
  ownerId    String
  purpose    String
  cipherText Bytes
  iv         Bytes
  tag        Bytes
  wrappedDek Bytes
  alg        String
  version    Int
  createdAt  DateTime @default(now())

  volumeVersion VolumeVersion?

  @@index([ownerId, purpose])
}

model WebhookEvent {
  id          String   @id @default(uuid())
  externalId  String   @unique
  type        String
  payload     Json
  processedAt DateTime @default(now())
  createdAt   DateTime @default(now())

  @@index([type])
  @@index([externalId])
}
```

## Concepts Clés

### 1. Envelope Encryption
- Chaque texte chiffré avec DEK unique
- DEK chiffré avec KEK (MASTER_ENCRYPTION_KEY)
- Stocké dans `EncryptedBlob`
- Référencé par `VolumeVersion.textBlobId`

### 2. Entitlements & Unlocks
- **Entitlement**: Droits d'accès généraux (volumes 1-10, scope BASE/ALL)
- **Unlock**: Déblocage spécifique d'un volume (wait ou purchase)
- Un entitlement peut couvrir plusieurs volumes
- Un unlock est spécifique à un volume

### 3. Wait-Until-Free
- `Unlock` créé avec `triggeredBy: WAIT` lors du premier accès
- `unlocksAt` = maintenant + 24h
- Un seul wait actif par chapitre (constraint business logic)
- `VolumeRead` créé/updated pour tracker la lecture

### 4. Perspectives
- Chaque `Volume` a 2 `VolumeVersion` (NARRATOR + PROTAGONIST)
- NARRATOR inclus dans scope BASE
- PROTAGONIST nécessite scope ALL
- Permet de raconter l'histoire de 2 points de vue

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
