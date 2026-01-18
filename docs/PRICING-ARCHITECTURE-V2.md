# Architecture Pricing - Proposition Améliorée

## 🎯 Objectifs

1. **Découpler prix des chapitres** - Les prix ne sont plus hardcodés dans Chapter
2. **Tarification par défaut** - Schéma de prix appliqué à tous les chapitres
3. **Exceptions par chapitre** - Possibilité de surcharger les prix pour certains chapitres
4. **Historique complet** - Tracer tous les changements de prix
5. **Audit des paiements** - Pouvoir retrouver le prix appliqué au moment du paiement

---

## 📊 Nouveau Schéma Prisma

```prisma
// ============= PRICING SCHEMAS (Tarifications par défaut) =============

model PriceSchema {
  id                  String    @id @default(uuid())
  name                String    // "Schema 2026-Q1", "Schema Standard", etc.
  description         String?
  
  // Prix par type de volume (en centimes)
  priceFreeToRead     Int       @default(199)    // 1,99€ par défaut
  pricePaywall        Int       @default(299)    // 2,99€ paywall final
  priceEpilogue       Int       @default(399)    // 3,99€ épilogue (vol > 10)
  
  // Metadata
  isActive            Boolean   @default(true)
  appliedFrom         DateTime  @default(now())  // Date d'application
  appliedTo           DateTime? // NULL = toujours actif
  createdAt           DateTime  @default(now())
  createdBy           String    // admin user ID
  
  // Relations
  chapterOverrides    ChapterPriceOverride[]
  
  @@index([isActive])
  @@index([appliedFrom])
  @@map("price_schemas")
}

// ============= CHAPTER OVERRIDES (Exceptions par chapitre) =============

model ChapterPriceOverride {
  id                  String    @id @default(uuid())
  
  // Relation
  chapterId           String    @unique
  chapter             Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  // Schéma de base
  schemaId            String
  schema              PriceSchema @relation(fields: [schemaId], references: [id])
  
  // Overrides (optionnels - NULL = utiliser le prix du schéma)
  priceFreeToRead     Int?      // NULL = utiliser schema.priceFreeToRead
  pricePaywall        Int?      // NULL = utiliser schema.pricePaywall
  priceEpilogue       Int?      // NULL = utiliser schema.priceEpilogue
  
  // Raison de l'exception
  reason              String?   // "Lancement spécial", "Promo permanente", etc.
  
  // Metadata
  isActive            Boolean   @default(true)
  appliedFrom         DateTime  @default(now())
  appliedTo           DateTime? // NULL = toujours actif
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([schemaId])
  @@index([isActive])
  @@map("chapter_price_overrides")
}

// ============= PRICE HISTORY (Audit trail) =============

model PriceHistory {
  id                  String    @id @default(uuid())
  
  // Quelle entité?
  entityType          String    // "SCHEMA" ou "OVERRIDE"
  entityId            String    // PriceSchema.id ou ChapterPriceOverride.id
  
  // Valeurs avant/après
  previousValues      Json?     // { priceFreeToRead: 199, ... }
  newValues           Json      // { priceFreeToRead: 249, ... }
  
  // Changement
  changeReason        String?   // "Admin adjustment", "Promotion", etc.
  changedBy           String    // admin user ID
  changedAt           DateTime  @default(now())
  
  @@index([entityType, entityId])
  @@index([changedAt])
  @@map("price_histories")
}

// ============= MODIFIED: Chapter (REMOVED price fields) =============

model Chapter {
  id              String         @id @default(uuid())
  title           String
  protagonistName String
  status          ChapterStatus  @default(DRAFT)
  publishedAt     DateTime?
  
  // ❌ REMOVED: priceFreeToRead, pricePaywall, priceEpilogue
  
  coverAssetId    String?
  isArchived      Boolean        @default(false)
  coverAsset      ChapterAsset?  @relation("ChapterCover", fields: [coverAssetId], references: [id])
  createdAt       DateTime       @default(now())
  
  // Relations
  assets          ChapterAsset[]
  volumes         Volume[]
  entitlements    Entitlement[]
  unlocks         Unlock[]
  reads           VolumeRead[]
  priceOverride   ChapterPriceOverride?  // ← NEW
  
  @@map("chapters")
}

// ============= MODIFIED: Order (store applied prices) =============

model Order {
  id                      String      @id @default(uuid())
  userId                  String
  type                    OrderType
  status                  OrderStatus @default(PENDING)
  provider                String?
  providerSessionId       String?
  providerPaymentIntentId String?
  currency                String?
  amountTotal             Int?
  
  // NEW: Tracer les prix appliqués
  appliedPriceFreeToRead  Int?        // Prix utilisé au moment de la commande
  appliedPricePaywall     Int?
  appliedPriceEpilogue    Int?
  appliedPriceSchemaId    String?     // Quel schéma était actif?
  appliedPromotionId      String?     // Quelle promo a été appliquée?
  
  createdAt               DateTime    @default(now())
  user                    User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("orders")
}
```

---

## 🔄 Flux de Détermination du Prix

### Phase 1: Initialisation (Admin)

```
1. Admin crée un PriceSchema "2026-Q1"
   ├─ priceFreeToRead: 199 (1,99€)
   ├─ pricePaywall: 299 (2,99€)
   └─ priceEpilogue: 399 (3,99€)

2. Ce schéma s'applique automatiquement à TOUS les chapitres
   (via une fonction getChapterPrices qui cherche le schéma actif)
```

### Phase 2: Exceptions

```
3. Pour "Chapitre XYZ", créer un ChapterPriceOverride
   ├─ priceFreeToRead: NULL (utiliser 199 du schéma)
   ├─ pricePaywall: 499 (OVERRIDE: 4,99€ au lieu de 2,99€)
   ├─ priceEpilogue: 599 (OVERRIDE: 5,99€ au lieu de 3,99€)
   └─ reason: "Lancement spécial - contenu premium"

4. Lors du calcul du prix:
   - Chercher ChapterPriceOverride pour ce chapitre
   - Si trouvé: utiliser les values non-NULL, fallback au schéma pour les NULL
   - Sinon: utiliser le schéma actif
```

### Phase 3: Historique

```
5. Chaque modification enregistre un PriceHistory
   └─ Permet de retracer: quel prix était appliqué le 2026-01-10 à 15h30?
```

### Phase 4: Audit des Commandes

```
6. Lors d'une commande Stripe:
   Order.appliedPriceFreeToRead = prix utilisé pour le calcul
   Order.appliedPriceSchemaId = quel schéma était actif
   Order.appliedPromotionId = quelle promo a été appliquée
   
   → Permet de réconcilier: Client dit avoir payé X€, 
     on peut vérifier le prix du 2026-01-10 + la promo appliquée
```

---

## 📝 Exemple d'Exécution

### Jour 1: Initialisation

```bash
# Admin crée le schéma par défaut
POST /admin/price-schemas
{
  "name": "2026-Q1 Standard",
  "description": "Tarification standard Q1 2026",
  "priceFreeToRead": 199,
  "pricePaywall": 299,
  "priceEpilogue": 399
}

# Réponse: { id: "schema-001", isActive: true, ... }
```

### Jour 10: Exception pour un chapitre

```bash
# Admin crée une exception
POST /admin/chapters/:chapterId/price-override
{
  "schemaId": "schema-001",
  "priceFreeToRead": null,           # Garder le 1,99€ du schéma
  "pricePaywall": 499,               # OVERRIDE: 4,99€
  "priceEpilogue": 599,              # OVERRIDE: 5,99€
  "reason": "Lancement spécial - bestseller"
}

# Réponse: { id: "override-001", chapterId: "...", ... }

# Un PriceHistory est créé automatiquement:
# {
#   entityType: "OVERRIDE",
#   entityId: "override-001",
#   previousValues: null,
#   newValues: { priceFreeToRead: null, pricePaywall: 499, ... },
#   changedBy: "admin-user-123"
# }
```

### Jour 20: Nouveau schéma pour les autres chapitres

```bash
# Admin crée un nouveau schéma avec réduction
POST /admin/price-schemas
{
  "name": "2026-Q1 Promo",
  "priceFreeToRead": 149,            # -50€ (1,49€)
  "pricePaywall": 249,               # -50€ (2,49€)
  "priceEpilogue": 349               # -50€ (3,49€)
}

# Réponse: { id: "schema-002", isActive: true, appliedFrom: "2026-01-20", ... }
```

### Jour 25: Audit - Réclamation client

```bash
# Client: "J'ai payé 2,99€ le 2026-01-15 pour le Chapitre XYZ, 
#          maintenant c'est 4,99€!"

# Query audit:
SELECT 
  ch.title,
  oh.changedAt,
  oh.previousValues,
  oh.newValues,
  o.appliedPricePaywall,
  o.appliedPromotionId,
  o.amountTotal
FROM orders o
JOIN chapters ch ON o.chapterId = ch.id
LEFT JOIN chapter_price_overrides cpo ON ch.id = cpo."chapterId"
LEFT JOIN price_histories oh ON cpo.id = oh.entityId
WHERE o."userId" = 'client-123'
  AND ch.id = 'chapter-xyz'
  AND o."createdAt" = '2026-01-15'

# Résultat: Peut voir exactement quel prix était appliqué ce jour
```

---

## 🔧 Services à Implémenter

### PriceSchemaService

```typescript
// apps/backend/src/modules/admin/price-schemas/price-schemas.service.ts

export const priceSchemaService = {
  // CRUD
  async createSchema(data: CreatePriceSchemaDto) {
    return prisma.priceSchema.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  },

  async listSchemas() {
    return prisma.priceSchema.findMany({
      include: {
        chapterOverrides: true,
        _count: { select: { chapterOverrides: true } },
      },
      orderBy: { appliedFrom: 'desc' },
    });
  },

  async updateSchema(id: string, data: UpdatePriceSchemaDto) {
    const oldSchema = await prisma.priceSchema.findUnique({ where: { id } });
    
    // Créer historique
    await prisma.priceHistory.create({
      data: {
        entityType: 'SCHEMA',
        entityId: id,
        previousValues: {
          priceFreeToRead: oldSchema.priceFreeToRead,
          pricePaywall: oldSchema.pricePaywall,
          priceEpilogue: oldSchema.priceEpilogue,
        },
        newValues: data,
        changedBy: userId,
      },
    });

    return prisma.priceSchema.update({ where: { id }, data });
  },

  async deactivateSchema(id: string) {
    return prisma.priceSchema.update({
      where: { id },
      data: {
        isActive: false,
        appliedTo: new Date(),
      },
    });
  },

  // Pricing
  async getActiveSchema() {
    const now = new Date();
    return prisma.priceSchema.findFirst({
      where: {
        isActive: true,
        appliedFrom: { lte: now },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: now } },
        ],
      },
      orderBy: { appliedFrom: 'desc' },
    });
  },

  async getChapterPrices(chapterId: string) {
    // Chercher l'override du chapitre
    const override = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
      include: { schema: true },
    });

    if (override && override.isActive) {
      const schema = override.schema;
      return {
        priceFreeToRead: override.priceFreeToRead ?? schema.priceFreeToRead,
        pricePaywall: override.pricePaywall ?? schema.pricePaywall,
        priceEpilogue: override.priceEpilogue ?? schema.priceEpilogue,
        schemaId: schema.id,
        overrideId: override.id,
      };
    }

    // Sinon, utiliser le schéma actif
    const activeSchema = await this.getActiveSchema();
    if (!activeSchema) {
      throw new Error('NO_ACTIVE_PRICE_SCHEMA');
    }

    return {
      priceFreeToRead: activeSchema.priceFreeToRead,
      pricePaywall: activeSchema.pricePaywall,
      priceEpilogue: activeSchema.priceEpilogue,
      schemaId: activeSchema.id,
      overrideId: null,
    };
  },
};
```

### ChapterPriceOverrideService

```typescript
// apps/backend/src/modules/admin/chapter-prices/chapter-prices.service.ts

export const chapterPriceOverrideService = {
  async createOverride(chapterId: string, data: CreateOverrideDto, userId: string) {
    const oldOverride = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
    });

    // Créer historique
    await prisma.priceHistory.create({
      data: {
        entityType: 'OVERRIDE',
        entityId: data.overrideId || 'new',
        previousValues: oldOverride ? {
          priceFreeToRead: oldOverride.priceFreeToRead,
          pricePaywall: oldOverride.pricePaywall,
          priceEpilogue: oldOverride.priceEpilogue,
        } : null,
        newValues: {
          priceFreeToRead: data.priceFreeToRead,
          pricePaywall: data.pricePaywall,
          priceEpilogue: data.priceEpilogue,
        },
        changeReason: data.reason,
        changedBy: userId,
      },
    });

    if (oldOverride) {
      return prisma.chapterPriceOverride.update({
        where: { chapterId },
        data,
      });
    } else {
      return prisma.chapterPriceOverride.create({
        data: {
          chapterId,
          schemaId: data.schemaId,
          ...data,
        },
      });
    }
  },

  async deleteOverride(chapterId: string) {
    const override = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
    });

    if (override) {
      await prisma.priceHistory.create({
        data: {
          entityType: 'OVERRIDE',
          entityId: override.id,
          previousValues: {
            priceFreeToRead: override.priceFreeToRead,
            pricePaywall: override.pricePaywall,
            priceEpilogue: override.priceEpilogue,
          },
          newValues: null,
          changeReason: 'Override deleted',
          changedBy: userId,
        },
      });
    }

    return prisma.chapterPriceOverride.delete({
      where: { chapterId },
    });
  },

  async listOverrides() {
    return prisma.chapterPriceOverride.findMany({
      include: {
        chapter: { select: { id: true, title: true } },
        schema: true,
      },
    });
  },

  async getPriceHistory(chapterId: string) {
    return prisma.priceHistory.findMany({
      where: {
        entityId: {
          in: (
            await prisma.chapterPriceOverride.findMany({
              where: { chapterId },
              select: { id: true },
            })
          ).map(x => x.id),
        },
      },
      orderBy: { changedAt: 'desc' },
    });
  },
};
```

---

## 🎛️ Admin UI

### PriceSchemasPage.tsx
- Liste des schémas avec dates d'application
- Créer / Modifier / Désactiver schéma
- Afficher le nombre de chapitres utilisant ce schéma

### ChapterPricesPage.tsx
- Liste des chapitres avec leur pricing (schéma ou override)
- Créer / Modifier override
- Afficher l'historique des changements
- Bouton pour "revenir au schéma par défaut"

### PriceHistoryPage.tsx
- Afficher l'historique complet des changements
- Filtrer par chapitre, date, utilisateur
- Avant/après des prix

---

## 🔐 Audit & Compliance

### Query Audit Client

```sql
-- Trouver le prix appliqué le jour d'une commande
SELECT 
  o.id as order_id,
  o."createdAt",
  o."amountTotal",
  o."appliedPriceFreeToRead",
  o."appliedPriceSchemaId",
  o."appliedPromotionId",
  ps.name as schema_name,
  cpo.reason as override_reason
FROM orders o
LEFT JOIN price_schemas ps ON o."appliedPriceSchemaId" = ps.id
LEFT JOIN chapters c ON o."chapterId" = c.id
LEFT JOIN chapter_price_overrides cpo ON c.id = cpo."chapterId"
WHERE o."userId" = $1
  AND o."createdAt" >= $2 AND o."createdAt" <= $3
ORDER BY o."createdAt" DESC;
```

### Query: Quel prix au jour J?

```sql
SELECT 
  ps.name,
  ps."priceFreeToRead",
  ps."pricePaywall",
  ps."priceEpilogue",
  ps."appliedFrom",
  ps."appliedTo"
FROM price_schemas ps
WHERE ps."isActive" = true
  AND ps."appliedFrom" <= '2026-01-15'::date
  AND (ps."appliedTo" IS NULL OR ps."appliedTo" >= '2026-01-15'::date)
ORDER BY ps."appliedFrom" DESC
LIMIT 1;
```

---

## ✅ Avantages

1. ✅ **Gestion centralisée** - Un schéma pour tous les chapitres
2. ✅ **Exceptions faciles** - Override par chapitre sans dupliquer
3. ✅ **Historique complet** - Tracer tous les changements
4. ✅ **Audit robuste** - Retracer le prix appliqué n'importe quand
5. ✅ **Évolution simplifiée** - Changer le schéma = tous les chapitres mis à jour
6. ✅ **Flexibilité** - Certains chapitres à prix spécial sans déranger les autres
7. ✅ **Conformité** - Satisfait les obligations d'audit et de traçabilité

---

## 🔄 Migration depuis l'Ancienne Architecture

```sql
-- 1. Créer le schéma par défaut à partir des prix actuels
INSERT INTO price_schemas 
  (name, "priceFreeToRead", "pricePaywall", "priceEpilogue", "createdBy")
VALUES 
  ('Migration 2026-01-13', 199, 299, 399, 'migration');

-- 2. Pour chaque chapitre avec des prix différents:
INSERT INTO chapter_price_overrides 
  ("chapterId", "schemaId", "priceFreeToRead", "pricePaywall", "priceEpilogue", reason)
SELECT 
  ch.id,
  ps.id,
  CASE WHEN ch."priceFreeToRead" != 199 THEN ch."priceFreeToRead" ELSE NULL END,
  CASE WHEN ch."pricePaywall" != 299 THEN ch."pricePaywall" ELSE NULL END,
  CASE WHEN ch."priceEpilogue" != 399 THEN ch."priceEpilogue" ELSE NULL END,
  'Migrated from chapter prices'
FROM chapters ch
CROSS JOIN price_schemas ps
WHERE ch."priceFreeToRead" != 199 OR ch."pricePaywall" != 299 OR ch."priceEpilogue" != 399;

-- 3. Créer un enregistrement d'historique pour la migration
INSERT INTO price_histories 
  ("entityType", "entityId", "previousValues", "newValues", "changedBy", "changedAt")
SELECT 
  'MIGRATION',
  ch.id,
  jsonb_build_object(
    'priceFreeToRead', ch."priceFreeToRead",
    'pricePaywall', ch."pricePaywall",
    'priceEpilogue', ch."priceEpilogue"
  ),
  '{}',
  'migration',
  now()
FROM chapters ch;

-- 4. Supprimer les colonnes du schéma Chapter
ALTER TABLE chapters DROP COLUMN "priceFreeToRead";
ALTER TABLE chapters DROP COLUMN "pricePaywall";
ALTER TABLE chapters DROP COLUMN "priceEpilogue";
```

---

## 🎯 Résumé

| Aspect | Ancien | Nouveau |
|--------|--------|---------|
| Stockage prix | Chapter.price* | PriceSchema + ChapterPriceOverride |
| Gestion | Chapitre par chapitre | Schéma centralisé + exceptions |
| Historique | Aucun | PriceHistory complet |
| Audit | Difficile | Trivial (query simple) |
| Évolution prix | Modifier chaque chapitre | Modifier le schéma |
| Exceptions | Hardcoder différemment | ChapterPriceOverride avec raison |

Cette architecture est **scalable, auditable, et compliant**.
