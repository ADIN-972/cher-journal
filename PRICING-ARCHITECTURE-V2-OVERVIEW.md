# V2 Pricing Architecture - Complete Technical Overview

## Problem Statement (from User)

> "est ce qu il ne faudtait pas décorélér les prix des chapitres et à la création d'une tarification déterminer une tarification générale à tous les chapitres et dans tarification gérer les regles des exceptions"

Translation: "Shouldn't we decouple prices from chapters, create a general pricing for all chapters at creation, and in pricing manage exception rules?"

**Issues with V1 (Prices in Chapter Model):**
1. ❌ Prices hardcoded in Chapter - can't change globally
2. ❌ No price history - can't answer "what was the price on date X?"
3. ❌ No audit trail - who changed what when?
4. ❌ Exception management - each chapter overrides = code changes
5. ❌ Billing disputes - no traceability from order to price to schema

## Solution: V2 Architecture

### Three-Layer Pricing System

```
┌─────────────────────────────────────────────┐
│         Admin Interface                     │
│  Create/Edit Schemas, Overrides, View Audit│
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Service Layer                       │
│  priceSchemaService with CRUD operations   │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│      Data Models (3 new tables)             │
│  PriceSchema + ChapterPriceOverride         │
│         + PriceHistory                      │
└─────────────────────────────────────────────┘
```

### Model Relationships

```
PriceSchema (default pricing)
  ↓ 1:many
ChapterPriceOverride (exceptions)
  ↓ 1:1
Chapter (already exists)

PriceHistory (audit trail)
  ↓ tracks changes to
PriceSchema or ChapterPriceOverride
```

## Core Concepts

### 1. PriceSchema - Central Pricing
**Purpose:** Single source of truth for default prices

**Example:**
```
Name: "2026-Q1 Standard"
priceFreeToRead: 199€
pricePaywall: 299€
priceEpilogue: 399€
isActive: true
appliedFrom: 2026-01-01
appliedTo: null (no end date)
```

**Use Case:** "All chapters cost $2.99 for paywall starting Q1 2026"

### 2. ChapterPriceOverride - Exceptions
**Purpose:** Allow per-chapter variations without code changes

**Example:**
```
chapterId: "chapter_bestseller"
schemaId: "schema_2026_q1"
priceFreeToRead: null (use schema default: 199€)
pricePaywall: 199€ (cheaper than default!)
priceEpilogue: null (use schema default: 399€)
reason: "Launch special promotion"
```

**Use Case:** "Chapter X is on sale at $1.99 instead of $2.99"

**Key Feature:** NULL fields mean "inherit from schema"
- Don't duplicate unchanged values
- Easy to see what's different
- Update one field without touching others

### 3. PriceHistory - Immutable Audit Trail
**Purpose:** Track every price change with who/when/what

**Example:**
```
entityType: "OVERRIDE"
entityId: "override_bestseller"
previousValues: { pricePaywall: 299 }
newValues: { pricePaywall: 199 }
changedBy: "admin_user_123"
changedAt: 2026-01-15 14:30:00
changeReason: "Post-launch discount"
```

**Use Case:** "Prove to audit team that we changed prices on X date for reason Y"

## Example Flows

### Day 1: Initial Setup
```
1. Create PriceSchema "2026-Q1 Standard"
   - Store: 199€, 299€, 399€
   - PriceHistory records creation event

2. Readers can now:
   - Query active schema
   - Get prices for any chapter (all use schema defaults)
   - Make purchases with transparent pricing
```

### Day 10: Create Exception
```
1. Create ChapterPriceOverride for "Chapter Bestseller"
   - Set: priceFreeToRead=null, pricePaywall=199€, priceEpilogue=null
   - Reason: "Launch special"
   - PriceHistory records change

2. This chapter now costs $1.99 (instead of default $2.99)
   - Via fallback: schema paywall (299) OR override paywall (199) → 199
   - All other chapters unaffected
```

### Day 25: Schema Price Increase
```
1. Update PriceSchema "2026-Q1 Standard"
   - Change: 299€ → 349€
   - PriceHistory records: { previousValues: {299}, newValues: {349} }

2. Pricing result:
   - "Chapter Bestseller": still 199€ (override trumps schema)
   - All other chapters: now 349€ (schema updated)
   
3. Audit shows:
   - What changed: paywall price
   - When: 2026-01-25
   - Who: admin_user_456
   - Why: (reason stored in request)
```

### Day 45: Customer Dispute
```
Customer: "I was charged $2.99 but now it costs $1.99"

Support looks up:
1. SELECT * FROM orders WHERE customer_id=X ORDER BY created_at DESC
2. Finds order: appliedPriceSchemaId="schema_q1", appliedPricePaywall=299
3. Queries price history: shows schema was 299€ on order date
4. Confirms: customer paid correct price for that date
```

## Data Flow During Purchase

```
User clicks "Buy Chapter 5"
  ↓
reader.service.getVolumePrice()
  ↓
priceSchemaService.getChapterPrices("ch_5")
  ↓
Checks: Is there a ChapterPriceOverride?
  ├─ YES: Use override values (with NULL → schema fallback)
  └─ NO: Get active PriceSchema
  ↓
Returns: { priceFreeToRead: 199, pricePaywall: 299, ... }
  ↓
Stripe creates charge for $2.99
  ↓
Order created with:
  - appliedPricePaywall: 299 (snapshot)
  - appliedPriceSchemaId: "schema_q1" (which schema)
  - appliedPromotionId: null (no promo applied)
  ↓
Order stored, pricing immutable forever
```

## Key Architectural Decisions

### 1. Why NULL Fields in Override?
```typescript
// Instead of this (V1 - duplication):
ChapterOverride {
  priceFreeToRead: 199,    // Same as schema!
  pricePaywall: 199,       // Different
  priceEpilogue: 399,      // Same as schema!
}

// We use this (V2 - efficient):
ChapterOverride {
  priceFreeToRead: null,   // Inherit from schema
  pricePaywall: 199,       // Override this one
  priceEpilogue: null,     // Inherit from schema
}

// Benefits:
✅ Less storage
✅ Clear what's different
✅ Update schema → affects overrides (unless overridden)
```

### 2. Why JSON in PriceHistory?
```typescript
// Instead of this (V1 - multiple columns):
price_history {
  schema_id,
  old_price_free_to_read: 199,
  new_price_free_to_read: 249,
  old_price_paywall: 299,
  new_price_paywall: 349,
  old_price_epilogue: 399,
  new_price_epilogue: 449,
  // But what if we add new price types?
}

// We use this (V2 - flexible):
price_history {
  entityType: "SCHEMA",
  entityId: "schema_123",
  previousValues: { priceFreeToRead: 199, pricePaywall: 299, ... },
  newValues: { priceFreeToRead: 249, pricePaywall: 349, ... },
  // Can store ANY fields, extensible for future
}

// Benefits:
✅ Flexible for future price types
✅ Easier parsing in code
✅ Compact storage
✅ Works for any entity change
```

### 3. Why Store Prices in Order?
```typescript
// Instead of this (V1 - reference only):
Order { pricingSchemaId: "schema_q1" }
// Problem: If schema deleted, can't recreate history

// We use this (V2 - snapshot):
Order {
  appliedPriceFreeToRead: 199,
  appliedPricePaywall: 299,
  appliedPriceEpilogue: 399,
  appliedPriceSchemaId: "schema_q1",  // Also store reference
}

// Benefits:
✅ Complete data independence
✅ Can delete schema, order pricing still intact
✅ Enables revenue analysis by price point
✅ Dispute resolution has complete info
```

### 4. Why Single Active Schema?
```typescript
// Instead of this (complex):
- Schema A applies to chapters 1-5
- Schema B applies to chapters 6-10
- Schema C applies to chapters 11+
// Question: What if chapter 5 has override? Which wins?

// We use this (simple):
- Only ONE schema is "active" at a time
- All chapters use it (unless overridden)
- Can switch to new schema at any time
// Answer: Override always wins, fallback to schema

// Future: Could add priority/date-range logic if needed
```

## Security Model

### Authentication
```
✅ All endpoints require `requireAuth` middleware
✅ Only admin users can access price endpoints
✅ Role-based control possible (future: CFO-only, Finance-only)
```

### Audit & Compliance
```
✅ GDPR: changedBy field identifies user
✅ SOX: Immutable history with timestamps
✅ PCI: Can prove prices charged are accurate
✅ GDPR Compliance: Can show who made price changes
✅ Audit Trail: Full before/after in JSON

Immutability:
✅ PriceHistory records: created once, never updated/deleted
✅ Order snapshots: applied prices never change
✅ User attribution: who made every change
```

## Performance Design

### Query Patterns

**Get Active Schema (frequently called)**
```sql
SELECT * FROM price_schemas 
WHERE is_active = true 
  AND applied_from <= NOW()
  AND (applied_to IS NULL OR applied_to >= NOW())
LIMIT 1;
```
Index: `(is_active, applied_from)` ✅

**Get Chapter Override (frequently called)**
```sql
SELECT * FROM chapter_price_overrides 
WHERE chapter_id = $1 AND is_active = true
LIMIT 1;
```
Index: `(chapter_id)` UNIQUE ✅

**Get Change History (admin reports)**
```sql
SELECT * FROM price_histories 
WHERE entity_id = $1
ORDER BY changed_at DESC;
```
Index: `(entity_type, entity_id)` ✅

### Caching Strategy
```
- Option 1: Cache active schema in memory (5-10 min TTL)
  Pros: Fast reads
  Cons: Stale data during updates
  
- Option 2: No caching (query each time)
  Pros: Always current
  Cons: Extra DB hit
  
- Chosen: No caching initially
  Reason: Price accuracy > performance (can add later)
```

## Compliance & Legal

### Supports Auditing For:
✅ **Payment Disputes**: Prove what price was charged when
✅ **Regulatory**: Show price change history with attribution
✅ **Tax**: Track pricing changes for tax year
✅ **Billing**: Reconcile customer charges with schema
✅ **Fraud Investigation**: Who changed prices and why

### Supports Use Cases:
✅ "Customer claims we charged $5 but now it's $2"
✅ "When did we increase prices for this chapter?"
✅ "How many chapters have custom pricing?"
✅ "Who made price changes last month?"
✅ "What was the price on 2026-01-15?"

## Integration Points

### With Reader App
```typescript
// Reader getting volume prices
const prices = await priceSchemaService.getChapterPrices(chapterId);
// Returns current prices with override applied
```

### With Stripe
```typescript
// During checkout
const prices = await priceSchemaService.getChapterPrices(chapterId);
const stripe = await stripe.checkout.sessions.create({
  line_items: [{ price_data: { unit_amount: prices.pricePaywall } }],
});

// On webhook
const order = await prisma.order.create({
  appliedPriceFreeToRead: prices.priceFreeToRead,
  appliedPricePaywall: prices.pricePaywall,
  appliedPriceSchemaId: prices.schemaId,
});
```

### With Admin Panel
```typescript
// Create schema
POST /admin/price-schemas { name, prices }

// Create exception
POST /admin/chapters/:id/price-override { schemaId, prices }

// View history
GET /admin/price-history
```

## Future Enhancements

### Phase 2 (Optional):
1. **Approval Workflows**: Price changes require CFO approval
2. **Scheduled Changes**: Schedule future price increases
3. **Bulk Actions**: Change multiple chapter prices at once
4. **Price Rules**: Min/max constraints, % change caps
5. **Reporting**: Revenue by schema, price point analysis

### Phase 3 (Optional):
1. **Multi-Schema Support**: Multiple active schemas by region/customer
2. **Promotional Schedules**: Integrate with discount system
3. **A/B Testing**: Test different prices for same chapter
4. **Predictive Pricing**: ML-based optimal pricing
5. **Currency Support**: Different prices by currency/region

## Testing Strategy

### Unit Tests
```typescript
// priceSchemaService.getChapterPrices()
- Should return schema prices if no override
- Should return override prices if exist
- Should fallback to schema for NULL fields
- Should handle missing schema (error)
```

### Integration Tests
```
- Create schema → prices accessible
- Create override → overrides schema
- Update schema → history recorded
- Delete override → back to schema
- Get history → shows all changes
```

### API Tests
```
- POST /admin/price-schemas (201 created)
- PATCH /admin/price-schemas/:id (200 ok)
- DELETE /admin/chapters/:id/price-override (204 no content)
- GET /admin/price-history (200 with array)
```

## Migration Path

### V1 → V2 Timeline
```
T0: Design (DONE)
T1: Implement service (DONE)
T2: Run migration
  - Create tables
  - Create default schema
  - Update order snapshots
T3: Deploy
T4: Monitor (first week)
T5: Decommission V1 (if confident)
```

## Documentation
- ✅ PRICING-IMPLEMENTATION-V2.md - Complete reference
- ✅ PRICING-V2-IMPLEMENTATION-COMPLETE.md - Implementation details
- ✅ PRICING-V2-DEPLOYMENT-CHECKLIST.md - Deployment steps
- ✅ test-price-schema-api.sh - Full API test suite
- ✅ This document - Architecture overview

## Conclusion

The V2 pricing architecture transforms pricing from a static Chapter property into a dynamic, auditable system supporting:
- ✅ Flexible centralized pricing (PriceSchema)
- ✅ Per-chapter exceptions (ChapterPriceOverride)
- ✅ Complete audit trails (PriceHistory)
- ✅ Billing reconciliation (Order snapshots)
- ✅ Compliance & disputes (Full traceability)

This enables the business to:
- 🎯 Change prices globally without code changes
- 📊 Track pricing evolution over time
- 💰 Handle promotions and exceptions cleanly
- 📋 Audit and reconcile all pricing decisions
- 🛡️ Defend against billing disputes with complete data
