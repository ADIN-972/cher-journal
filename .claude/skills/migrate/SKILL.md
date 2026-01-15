# Skill: Migrate

## Description
Gestion des migrations de base de données Prisma pour Cher Journal.

## Usage
```
@migrate [action] [name]
```

## Actions

### 1. Create Migration
```bash
# Créer migration depuis changements schema
npx prisma migrate dev --name add_user_avatar

# Créer migration vide (custom SQL)
npx prisma migrate dev --create-only --name custom_indexes
```

### 2. Apply Migrations
```bash
# Dev: Applique + génère client
npx prisma migrate dev

# Production: Applique uniquement (pas de prompt)
npx prisma migrate deploy

# Specific migration
npx prisma migrate deploy --skip-seed
```

### 3. Reset Database
```bash
# ⚠️ DEV ONLY - Supprime et recrée tout
npx prisma migrate reset

# Sans confirmation
npx prisma migrate reset --force

# Sans seed
npx prisma migrate reset --skip-seed
```

### 4. Migration Status
```bash
# Voir l'état des migrations
npx prisma migrate status

# Voir l'historique
npx prisma migrate resolve --applied "migration_name"
```

## Exemples de Migrations

### Ajouter une Colonne
```prisma
// Before
model User {
  id    String @id @default(uuid())
  email String @unique
}

// After
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  avatarUrl String?  // Nouvelle colonne nullable
}
```

```bash
npx prisma migrate dev --name add_user_avatar
```

### Ajouter une Table
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
}

model User {
  // ...existing fields
  notifications Notification[]
}
```

```bash
npx prisma migrate dev --name add_notifications
```

### Renommer une Colonne
```prisma
// Before
model Chapter {
  id    String @id
  name  String
}

// After
model Chapter {
  id    String @id
  title String  // Renamed from 'name'
}
```

Migration générée:
```sql
-- AlterTable
ALTER TABLE "Chapter" RENAME COLUMN "name" TO "title";
```

### Ajouter un Index
```prisma
model Volume {
  id           String @id
  chapterId    String
  volumeNumber Int

  @@index([chapterId])
  @@index([volumeNumber])
  @@index([chapterId, volumeNumber])  // Composite index
}
```

```bash
npx prisma migrate dev --name add_volume_indexes
```

### Modifier un Enum
```prisma
// Before
enum UserRole {
  USER
  ADMIN
}

// After
enum UserRole {
  USER
  ADMIN
  MODERATOR  // New value
}
```

```bash
npx prisma migrate dev --name add_moderator_role
```

## Migrations Safe en Production

### Pattern: Add Column (Nullable → Required)

**❌ DANGEREUX: Ajouter colonne NOT NULL directement**
```prisma
model User {
  email    String
  username String  // Breaking change!
}
```

**✅ SAFE: Migration en 2 étapes**

**Étape 1**: Ajouter colonne nullable
```prisma
model User {
  email    String
  username String?  // Nullable
}
```

```bash
npx prisma migrate dev --name add_username_nullable
```

**Backfill Data** (entre migrations):
```typescript
// Script ou seed
await prisma.user.updateMany({
  where: { username: null },
  data: { username: prisma.raw('email') }
});
```

**Étape 2**: Rendre obligatoire
```prisma
model User {
  email    String
  username String  // Now required
}
```

```bash
npx prisma migrate dev --name make_username_required
```

### Pattern: Renommer Colonne

**Option 1: Prisma détecte automatiquement (avec prompt)**
```bash
npx prisma migrate dev --name rename_column
# Prisma demande confirmation du rename
```

**Option 2: Migration custom SQL**
```bash
# Créer migration vide
npx prisma migrate dev --create-only --name rename_user_name_to_title

# Éditer le fichier SQL généré
# prisma/migrations/XXXXXX_rename_user_name_to_title/migration.sql
```

```sql
-- Custom SQL
ALTER TABLE "User" RENAME COLUMN "name" TO "title";
```

```bash
# Appliquer
npx prisma migrate dev
```

### Pattern: Supprimer Colonne

**Étape 1**: Retirer du code (déployer)
```typescript
// Ne plus référencer la colonne dans le code
```

**Étape 2**: Retirer du schema (après déploiement)
```prisma
model User {
  id    String @id
  // oldField supprimé
}
```

```bash
npx prisma migrate dev --name remove_old_field
```

## Migrations Complexes

### Data Migration avec Transaction
```typescript
// prisma/migrations/custom-data-migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // 1. Migrate existing data
    const chapters = await tx.chapter.findMany({
      where: { oldFormat: true }
    });

    for (const chapter of chapters) {
      await tx.chapter.update({
        where: { id: chapter.id },
        data: {
          newFormat: transformOldToNew(chapter),
          oldFormat: false
        }
      });
    }

    // 2. Clean up
    await tx.legacyData.deleteMany();
  });

  console.log('Migration completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Migration avec Seed Conditionnel
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if already seeded
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@cherjournal.com' }
  });

  if (existingAdmin) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Seed logic...
}
```

## Rollback Strategies

### Rollback via Resolve
```bash
# Marquer migration comme appliquée sans l'exécuter
npx prisma migrate resolve --applied "migration_name"

# Marquer comme rollback
npx prisma migrate resolve --rolled-back "migration_name"
```

### Manual Rollback (Production)
```bash
# 1. Create reverse migration manually
# prisma/migrations/XXXXX_revert_feature/migration.sql

# 2. Apply reverse migration
npx prisma migrate deploy
```

### Emergency Rollback
```sql
-- Trouver dernière migration appliquée
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 1;

-- Supprimer entrée (danger!)
DELETE FROM "_prisma_migrations" WHERE "migration_name" = 'XXXXXX_bad_migration';

-- Rollback SQL manuellement
-- ... reverse SQL statements ...
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/migrations.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/prisma/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: |
          cd apps/backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test_pass@localhost:5432/test_db
      
      - name: Check migration status
        run: |
          cd apps/backend
          npx prisma migrate status
```

### Production Deployment
```bash
# Script de déploiement
#!/bin/bash

# 1. Backup database
pg_dump $DATABASE_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migrations
cd apps/backend
npx prisma migrate deploy

# 3. Verify
npx prisma migrate status

# 4. Restart application
pm2 restart backend
```

## Migration Testing

### Test Migration Locally
```bash
# 1. Create test database
createdb cher_journal_test

# 2. Apply migrations
DATABASE_URL="postgresql://localhost/cher_journal_test" \
  npx prisma migrate deploy

# 3. Verify schema
DATABASE_URL="postgresql://localhost/cher_journal_test" \
  npx prisma db pull

# 4. Drop test database
dropdb cher_journal_test
```

### Snapshot Testing
```typescript
// tests/migrations/snapshot.test.ts
import { execSync } from 'child_process';

describe('Prisma Migrations', () => {
  it('should match snapshot', () => {
    const schema = execSync('npx prisma db pull --print', {
      encoding: 'utf-8'
    });

    expect(schema).toMatchSnapshot();
  });

  it('should have no pending migrations', () => {
    const status = execSync('npx prisma migrate status', {
      encoding: 'utf-8'
    });

    expect(status).toContain('Database schema is up to date');
  });
});
```

## Troubleshooting

### "Migration already applied"
```bash
# Check status
npx prisma migrate status

# Resolve conflict
npx prisma migrate resolve --applied "migration_name"
```

### "Database schema is not empty"
```bash
# Reset and start fresh (dev only)
npx prisma migrate reset
npx prisma migrate dev
```

### "Migration failed to apply"
```bash
# Check logs
npx prisma migrate status

# Manual fix in database
psql cher_journal

# Mark as applied after manual fix
npx prisma migrate resolve --applied "failed_migration"
```

## Best Practices

### ✅ Do
- Migrations petites et atomiques
- Tester localement avant deploy
- Backup avant migration prod
- Migrations backward compatible
- Nommer clairement (descriptif)
- Utiliser transactions
- Documenter migrations complexes

### ❌ Don't
- Éditer migrations appliquées
- Migrations destructives sans backup
- Changements breaking en une seule migration
- Oublier indexes sur foreign keys
- Migrations non testées en prod
- Reset en production

## Checklist Migration

- [ ] Schema Prisma mis à jour
- [ ] Migration nommée clairement
- [ ] Testée localement
- [ ] Backward compatible (si applicable)
- [ ] Backup strategy définie (prod)
- [ ] Data migration si nécessaire
- [ ] Index ajoutés
- [ ] Documentation mise à jour
- [ ] CI/CD configuré
- [ ] Rollback plan défini
