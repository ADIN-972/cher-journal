# Architecture V2 - Implementation Guide

## Overview

The V2 pricing architecture decouples prices from the Chapter model, enabling:
- ✅ Centralized default pricing (PriceSchema)
- ✅ Per-chapter exceptions (ChapterPriceOverride)
- ✅ Complete audit trails (PriceHistory)
- ✅ Pricing snapshots in orders for reconciliation
- ✅ Historical price lookups for billing disputes

## Database Models

### PriceSchema
Central pricing configuration applicable to all chapters.

```sql
-- Query active schema
SELECT * FROM price_schemas 
WHERE isActive = true 
  AND appliedFrom <= NOW() 
  AND (appliedTo IS NULL OR appliedTo >= NOW())
ORDER BY appliedFrom DESC
LIMIT 1;

-- Query price on specific date
SELECT * FROM price_schemas 
WHERE isActive = true 
  AND appliedFrom <= '2026-01-15'::date 
  AND (appliedTo IS NULL OR appliedTo >= '2026-01-15'::date)
LIMIT 1;
```

**Fields:**
- `id`: UUID primary key
- `name`: "2026-Q1 Standard"
- `description`: Optional notes
- `priceFreeToRead`: Default 199€
- `pricePaywall`: Default 299€
- `priceEpilogue`: Default 399€
- `isActive`: boolean (allows temporal activation)
- `appliedFrom`: Start date (usually creation date)
- `appliedTo`: End date (NULL = no end)
- `createdBy`: User ID for audit
- `createdAt`: Timestamp

**Indexes:**
- `isActive` - Fast active schema lookup
- `appliedFrom` - Date-range queries

### ChapterPriceOverride
Exception pricing for specific chapters with NULL fallback to schema.

```sql
-- Get override (if exists and active)
SELECT * FROM chapter_price_overrides 
WHERE "chapterId" = 'ch_123'
  AND isActive = true
LIMIT 1;

-- Get all overrides for a schema
SELECT co.*, c.title 
FROM chapter_price_overrides co
JOIN chapters c ON c.id = co."chapterId"
WHERE co."schemaId" = 'schema_123'
ORDER BY c.title;

-- Get all overrides (with chapter info)
SELECT co.*, c.title, ps.name 
FROM chapter_price_overrides co
JOIN chapters c ON c.id = co."chapterId"
JOIN price_schemas ps ON ps.id = co."schemaId"
WHERE co.isActive = true
ORDER BY c.title;
```

**Fields:**
- `id`: UUID primary key
- `chapterId`: Foreign key (UNIQUE - one override per chapter)
- `schemaId`: Foreign key to PriceSchema
- `priceFreeToRead`: INT nullable (NULL = use schema value)
- `pricePaywall`: INT nullable (NULL = use schema value)
- `priceEpilogue`: INT nullable (NULL = use schema value)
- `reason`: Business reason ("Launch special", "Bestseller", etc.)
- `isActive`: boolean
- `appliedFrom`: Start date
- `appliedTo`: End date (NULL = no end)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**Indexes:**
- `schemaId` - Query overrides by schema
- `isActive` - Active override lookup

**Key Feature:** Nullable price fields enable inheritance:
```typescript
// In controller, when returning chapter prices:
const override = await prisma.chapterPriceOverride.findUnique({
  where: { chapterId },
});

if (override && override.isActive) {
  // Use override, falling back to schema for NULL fields
  priceFreeToRead = override.priceFreeToRead ?? schema.priceFreeToRead
  pricePaywall = override.pricePaywall ?? schema.pricePaywall
  priceEpilogue = override.priceEpilogue ?? schema.priceEpilogue
}
```

### PriceHistory
Immutable audit trail of all pricing changes.

```sql
-- Get all changes to a specific schema
SELECT * FROM price_histories 
WHERE "entityType" = 'SCHEMA' 
  AND "entityId" = 'schema_123'
ORDER BY "changedAt" DESC;

-- Get all changes to a specific override
SELECT * FROM price_histories 
WHERE "entityType" = 'OVERRIDE' 
  AND "entityId" = 'override_456'
ORDER BY "changedAt" DESC;

-- Audit trail for disputes (who changed what when)
SELECT ph.*, ps.name as schema_name, u.email 
FROM price_histories ph
LEFT JOIN price_schemas ps ON ph."entityType" = 'SCHEMA' AND ph."entityId" = ps.id
LEFT JOIN users u ON ph."changedBy" = u.id
WHERE ph."changedAt" >= '2026-01-01'
ORDER BY ph."changedAt" DESC;
```

**Fields:**
- `id`: UUID primary key
- `entityType`: 'SCHEMA' or 'OVERRIDE'
- `entityId`: ID of entity that changed
- `previousValues`: JSON of old values (NULL if creation)
- `newValues`: JSON of new values (NULL if deletion)
- `changeReason`: Optional reason for change
- `changedBy`: User ID who made change
- `changedAt`: Timestamp (auto-set to NOW())

**Indexes:**
- `(entityType, entityId)` - Find all changes to entity
- `changedAt` - Timeline queries

**JSON Structure Example:**
```json
{
  "previousValues": {
    "priceFreeToRead": 199,
    "pricePaywall": 299
  },
  "newValues": {
    "priceFreeToRead": 249,
    "pricePaywall": 349
  }
}
```

### Order (Enhanced)

```sql
-- Find all orders from a specific schema
SELECT * FROM orders 
WHERE "appliedPriceSchemaId" = 'schema_123'
ORDER BY "createdAt" DESC;

-- Reconcile orders with promotions
SELECT o.id, o."appliedPriceFreeToRead", o."appliedPricePaywall", 
       ap."promotionId", p.type, p.discount
FROM orders o
LEFT JOIN applied_promotions ap ON o."appliedPromotionId" = ap.id
LEFT JOIN promotions p ON ap."promotionId" = p.id
WHERE o."createdAt" >= '2026-01-01'
ORDER BY o."createdAt" DESC;

-- Find orders with pricing changes (where price != current schema)
SELECT o.id, o."appliedPricePaywall", ps."pricePaywall", 
       (ps."pricePaywall" - o."appliedPricePaywall") as price_delta
FROM orders o
JOIN price_schemas ps ON o."appliedPriceSchemaId" = ps.id
WHERE o."appliedPricePaywall" != ps."pricePaywall"
ORDER BY price_delta DESC;
```

**New Fields:**
- `appliedPriceFreeToRead`: INT nullable - Snapshot at order time
- `appliedPricePaywall`: INT nullable - Snapshot at order time
- `appliedPriceEpilogue`: INT nullable - Snapshot at order time
- `appliedPriceSchemaId`: STRING nullable - Which schema was active
- `appliedPromotionId`: STRING nullable - Which promotion applied

## Service Layer

### priceSchemaService

Located: `apps/backend/src/modules/admin/price-schemas/price-schemas.service.ts`

**Methods:**

#### PRICE SCHEMAS

```typescript
// Create new schema
priceSchemaService.createSchema({
  name: "2026-Q2 Premium",
  description: "New pricing for Q2",
  priceFreeToRead: 249,
  pricePaywall: 349,
  priceEpilogue: 449,
  createdBy: userId,
})

// List all schemas with override counts
priceSchemaService.listSchemas()
// Returns: [{ ...schema, _count: { chapterOverrides: 5 }, chapterOverrides: [...] }]

// Get specific schema
priceSchemaService.getSchemaById(id)

// Update schema (auto-creates history)
priceSchemaService.updateSchema(id, {
  priceFreeToRead: 249,
}, userId)
// Automatically creates PriceHistory record with before/after JSON

// Deactivate schema
priceSchemaService.deactivateSchema(id)

// Activate schema
priceSchemaService.activateSchema(id)

// Get currently active schema
const activeSchema = await priceSchemaService.getActiveSchema()
// SELECT * FROM price_schemas
// WHERE isActive = true AND appliedFrom <= NOW()
// AND (appliedTo IS NULL OR appliedTo >= NOW())
// ORDER BY appliedFrom DESC LIMIT 1
```

#### CHAPTER PRICE OVERRIDES

```typescript
// Create override for chapter (or update existing)
priceSchemaService.createChapterOverride(
  chapterId,
  {
    schemaId: "schema_123",
    priceFreeToRead: 99,  // Cheaper
    pricePaywall: null,    // Use schema default
    priceEpilogue: null,   // Use schema default
    reason: "Beta program member",
  },
  userId
)
// Automatically creates PriceHistory record

// Delete override
priceSchemaService.deleteChapterOverride(chapterId, userId)
// Records deletion in history

// Get override for chapter
priceSchemaService.getChapterOverride(chapterId)

// List all overrides
priceSchemaService.listChapterOverrides()
```

#### PRICING LOGIC

```typescript
// Get chapter prices with override fallback
const prices = await priceSchemaService.getChapterPrices(chapterId)
// Returns: {
//   priceFreeToRead: 199,
//   pricePaywall: 299,
//   priceEpilogue: 399,
//   schemaId: "schema_123",
//   overrideId: null,
//   isOverride: false,
// }

// Logic:
// 1. Check for active override on chapter
// 2. If found, use override values (with NULL -> schema fallback)
// 3. If not found, use active schema values
```

#### PRICE HISTORY / AUDIT

```typescript
// Get price change history (all or filtered by chapter)
priceSchemaService.getPriceHistory(chapterId?)
// Returns: all history records, optionally filtered by chapter

// Get detailed history for an entity
priceSchemaService.getPriceHistoryDetail(entityId)
// Returns: all history records for specific schema or override
```

## API Endpoints

### Price Schemas

```
GET    /admin/price-schemas              # List all schemas
POST   /admin/price-schemas              # Create schema
GET    /admin/price-schemas/:id          # Get specific schema
PATCH  /admin/price-schemas/:id          # Update schema (auto-history)
POST   /admin/price-schemas/:id/activate   # Reactivate schema
POST   /admin/price-schemas/:id/deactivate # Deactivate schema
```

### Chapter Overrides

```
GET    /admin/chapter-overrides          # List all overrides
GET    /admin/chapters/:chapterId/price-override
POST   /admin/chapters/:chapterId/price-override      # Create/update
PATCH  /admin/chapters/:chapterId/price-override      # Update override
DELETE /admin/chapters/:chapterId/price-override      # Delete override
```

### Price History / Audit

```
GET    /admin/price-history              # List all changes (optional ?chapterId=)
GET    /admin/price-history/:entityId    # Get detailed history for entity
```

## Admin UI Pages

### PriceSchemasPage.tsx
- List all schemas with active status
- Create new schema
- Edit schema prices
- Activate/deactivate schema
- Shows count of chapters using each schema

### ChapterPricesPage.tsx
- List all chapter overrides
- Create/edit override with NULL fallback explanation
- Delete override
- Show reason for override
- Link to schema for reference

### PriceHistoryPage.tsx
- Timeline of all price changes
- Filter by SCHEMA vs OVERRIDE
- Expandable entries showing:
  - Previous values (JSON)
  - New values (JSON)
  - Who changed it (changedBy)
  - When (changedAt)
  - Why (changeReason)

## Integration Example: Stripe Order Creation

When user purchases a chapter:

```typescript
// In stripe.service.ts
const prices = await priceSchemaService.getChapterPrices(chapterId);

const order = await prisma.order.create({
  data: {
    userId,
    chapterId,
    volumeNumber,
    status: "completed",
    amountCents: prices.pricePaywall, // Snapshot price
    currency: "USD",
    // NEW V2 fields:
    appliedPriceFreeToRead: prices.priceFreeToRead,
    appliedPricePaywall: prices.pricePaywall,
    appliedPriceEpilogue: prices.priceEpilogue,
    appliedPriceSchemaId: prices.schemaId,
    appliedPromotionId: appliedPromotion?.id || null,
    stripePaymentIntentId: paymentIntent.id,
  },
});
```

## Audit Queries for Client Support

### "What price did user pay on 2026-01-15?"
```sql
SELECT o.id, o."amountCents", o."appliedPricePaywall", 
       ps.name, c.title
FROM orders o
JOIN price_schemas ps ON o."appliedPriceSchemaId" = ps.id
JOIN chapters c ON o."chapterId" = c.id
WHERE o.id = 'order_123'
  AND o."createdAt"::date = '2026-01-15';
```

### "Did we change prices for chapter X?"
```sql
SELECT ph.* FROM price_histories ph
WHERE ph."entityType" = 'OVERRIDE'
  AND ph."entityId" = (
    SELECT id FROM chapter_price_overrides 
    WHERE "chapterId" = 'ch_123'
  )
ORDER BY ph."changedAt" DESC;
```

### "How many chapters have custom pricing?"
```sql
SELECT COUNT(*) as override_count, 
       ps.name as schema_name
FROM chapter_price_overrides cpo
JOIN price_schemas ps ON cpo."schemaId" = ps.id
WHERE cpo.isActive = true
GROUP BY ps.id, ps.name
ORDER BY override_count DESC;
```

### "What was the price history for chapter X?"
```sql
SELECT ph.*, ps.name
FROM price_histories ph
LEFT JOIN price_schemas ps ON ph."entityType" = 'SCHEMA' 
  AND EXISTS (
    SELECT 1 FROM chapter_price_overrides 
    WHERE id = ph."entityId" AND "chapterId" = 'ch_123'
  )
WHERE ph."entityType" = 'OVERRIDE'
  AND ph."entityId" IN (
    SELECT id FROM chapter_price_overrides 
    WHERE "chapterId" = 'ch_123'
  )
ORDER BY ph."changedAt" DESC;
```

## Migration from V1 to V2

### Step 1: Run migration
```bash
npm run prisma:migrate:dev
```

### Step 2: Initialize default schema
```bash
npm run ts-node prisma/init-price-schemas.ts
```

This script:
1. Creates "2026-Q1 Standard" schema with default prices
2. Updates all orders to have appliedPrice* fields
3. Creates PriceHistory records for audit

### Step 3: Admin creates overrides as needed
Use admin UI to create per-chapter overrides for special pricing

### Step 4: Deactivate V1 schema when ready
Admin can deactivate old schema to prevent accidental use

## Key Design Decisions

1. **NULL fields in ChapterPriceOverride**: Only override specific fields, inherit others from schema
2. **Temporal validity**: appliedFrom/appliedTo dates enable price changes without code deployment
3. **JSON audit trail**: Store before/after as JSON for flexible change tracking
4. **Order snapshots**: Store appliedPrice* in Order to prevent orphaned data issues
5. **Immutable history**: PriceHistory records never updated/deleted, only created
6. **Single active schema**: Only one schema can be active at a time for simplicity

## Security & Compliance

- ✅ All price changes tracked with user attribution
- ✅ Historical prices always accessible for disputes
- ✅ Audit trail shows before/after values
- ✅ Admin roles required for all changes
- ✅ Orders store pricing snapshot (immutable)
- ✅ Full traceability: order → applied prices → schema → history
