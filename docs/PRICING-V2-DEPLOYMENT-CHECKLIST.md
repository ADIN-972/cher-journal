# V2 Pricing Implementation - Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No `any` types (except where unavoidable)
- [ ] Proper error handling with meaningful messages
- [ ] Zod schemas validate all inputs
- [ ] HTTP status codes are correct (201 create, 204 delete, 400 validation, 404 not found, 500 error)

### Database
- [ ] `schema.prisma` changes look correct
- [ ] Prisma migration file created: `20260113214454_price_schema_v2`
- [ ] Migration preserves existing data (no data loss)
- [ ] Indexes are properly defined
- [ ] Foreign key constraints are correct

### API
- [ ] 10 new endpoints defined
- [ ] Routes registered in `/` prefix
- [ ] Routes registered in `/api` prefix
- [ ] All endpoints protected with `requireAuth`
- [ ] Error responses have proper format

### Admin UI
- [ ] PriceSchemasPage.tsx compiles
- [ ] ChapterPricesPage.tsx compiles
- [ ] PriceHistoryPage.tsx compiles
- [ ] Pages use correct API endpoints
- [ ] Form validation works
- [ ] JSON display for history entries

### Security
- [ ] `createdBy` and `changedBy` fields capture user IDs
- [ ] No plaintext prices logged
- [ ] PriceHistory is immutable (only CREATE, never UPDATE)
- [ ] Order snapshots prevent orphaned data

### Documentation
- [ ] PRICING-IMPLEMENTATION-V2.md complete
- [ ] PRICING-V2-IMPLEMENTATION-COMPLETE.md complete
- [ ] API test script (test-price-schema-api.sh) works
- [ ] SQL audit queries documented
- [ ] Integration examples provided

## Deployment Steps

### 1. Code Review & Approval
```
- [ ] Backend team reviews service layer
- [ ] Frontend team reviews admin UI
- [ ] Database team reviews migration
- [ ] Security team reviews audit trail
```

### 2. Backup Database
```bash
# Create backup before migration
pg_dump cherjournal_claude > backup-before-v2-$(date +%Y%m%d_%H%M%S).sql
```

### 3. Deploy Backend Code
```bash
# Push changes to main
git add apps/backend/
git commit -m "feat: implement V2 pricing architecture with schemas and overrides"
git push origin main

# Deploy to staging/production
npm run build:backend
npm run deploy:backend
```

### 4. Run Database Migration
```bash
# Connect to production database
cd apps/backend

# Run migration
npm run prisma:migrate:deploy

# Verify migration applied
psql $DATABASE_URL -c "SELECT name FROM _prisma_migrations WHERE migration_name LIKE '%price_schema%';"
```

### 5. Initialize Default Schema
```bash
# Run initialization script
npm run ts-node prisma/init-price-schemas.ts

# Verify schema created
psql $DATABASE_URL -c "SELECT * FROM price_schemas WHERE name LIKE '%Standard%';"

# Verify orders updated
psql $DATABASE_URL -c "SELECT COUNT(*) as updated_orders FROM orders WHERE applied_price_schema_id IS NOT NULL;"
```

### 6. Deploy Admin UI
```bash
# Push frontend changes
git add apps/admin/
git commit -m "feat: add pricing schema and history admin pages"
git push origin main

# Build and deploy
npm run build:admin
npm run deploy:admin
```

### 7. Test Production APIs
```bash
# Run test script against production
./test-price-schema-api.sh

# Verify endpoints respond correctly
curl -s https://api.cherjournal.com/admin/price-schemas -H "Authorization: Bearer $TOKEN" | jq .

# Check schema was created
curl -s https://api.cherjournal.com/admin/price-schemas | jq '.[] | {id, name, isActive}'
```

### 8. Verify Admin UI Access
```
- [ ] Login as admin at https://admin.cherjournal.com
- [ ] Navigate to "Price Schemas"
- [ ] Verify default schema displays
- [ ] Create test schema
- [ ] Edit test schema
- [ ] View price history
- [ ] Delete test schema
```

### 9. Test End-to-End
```
- [ ] Create price schema (Q1 pricing)
- [ ] Create chapter override (special pricing)
- [ ] Verify pricing.service uses getChapterPrices()
- [ ] Make test order → verify applied prices stored
- [ ] Query order in DB → confirm appliedPrice* fields set
- [ ] View price history → confirm changes logged
```

### 10. Monitor Logs
```bash
# Check backend logs for errors
tail -f logs/backend.log | grep -i "error\|price"

# Check database query logs (if enabled)
tail -f logs/postgres.log | grep -i "price_schemas\|chapter_price_overrides"

# Monitor API response times
tail -f logs/api.log | grep "/admin/price-schemas"
```

## Post-Deployment Verification

### Database Integrity
```bash
# Check all new tables exist
psql $DATABASE_URL -c "\dt" | grep -E "price_schemas|chapter_price_overrides|price_histories"

# Verify constraints
psql $DATABASE_URL -c "\d chapter_price_overrides" | grep "UNIQUE\|FOREIGN"

# Check index coverage
psql $DATABASE_URL -c "SELECT * FROM pg_indexes WHERE tablename IN ('price_schemas', 'chapter_price_overrides', 'price_histories');"
```

### Data Validation
```sql
-- Verify only one active schema
SELECT COUNT(*) FROM price_schemas WHERE is_active = true;
-- Should return 1 (or 0 if none activated)

-- Check schema prices
SELECT id, name, price_free_to_read, price_paywall, price_epilogue FROM price_schemas;

-- Verify orders have prices
SELECT COUNT(*) FROM orders WHERE applied_price_schema_id IS NOT NULL;
-- Should be > 0 (all orders should have prices)

-- Check history entries
SELECT COUNT(*) FROM price_histories;
-- Should show initialization entry

-- Verify no orphaned overrides
SELECT COUNT(*) FROM chapter_price_overrides 
WHERE schema_id NOT IN (SELECT id FROM price_schemas);
-- Should return 0
```

### API Testing
```bash
# Test each endpoint
curl -s -X GET https://api.cherjournal.com/api/admin/price-schemas \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, name}'

curl -s -X GET https://api.cherjournal.com/api/admin/chapter-overrides \
  -H "Authorization: Bearer $TOKEN" | jq '.'

curl -s -X GET https://api.cherjournal.com/api/admin/price-history \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {entityType, changedAt}'
```

### Performance Checks
```bash
# Query performance for active schema
EXPLAIN ANALYZE SELECT * FROM price_schemas 
WHERE is_active = true 
  AND applied_from <= NOW() 
  AND (applied_to IS NULL OR applied_to >= NOW());

# Query performance for chapter override
EXPLAIN ANALYZE SELECT * FROM chapter_price_overrides 
WHERE chapter_id = 'some-id' AND is_active = true;

# History query performance
EXPLAIN ANALYZE SELECT * FROM price_histories 
WHERE entity_type = 'SCHEMA' AND entity_id = 'some-id'
ORDER BY changed_at DESC;
```

## Rollback Plan (If Needed)

### Quick Rollback (within 1 hour)
```bash
# Restore from backup
psql -f backup-before-v2-*.sql

# Revert code
git revert <commit-hash>
git push origin main

# Redeploy previous version
npm run build:backend
npm run deploy:backend
```

### Graceful Rollback (longer process)
```bash
# Keep V2 tables but disable in code
# Set all PriceSchema.isActive = false
UPDATE price_schemas SET is_active = false;

# Add fallback logic in pricing.service
// If getActiveSchema() returns null, use hardcoded defaults
const prices = {
  priceFreeToRead: 199,
  pricePaywall: 299,
  priceEpilogue: 399,
};

# Deploy fallback code
npm run deploy:backend
```

## Monitoring & Alerts

### Set Up Alerts For
```
- [ ] 5xx errors on /admin/price-schemas endpoints
- [ ] Slow queries on price_schemas table (> 100ms)
- [ ] Lock contention on price_histories table
- [ ] Failed price history inserts
- [ ] Zero active price schemas (should always have 1)
```

### Daily Checks (First Week)
```
- [ ] No price-related errors in backend logs
- [ ] All price endpoints responding < 100ms
- [ ] Price history records being created correctly
- [ ] Admin users can create schemas
- [ ] Chapter overrides apply correctly
```

### Weekly Checks
```
- [ ] Review price history for suspicious changes
- [ ] Verify order pricing accuracy
- [ ] Check for orphaned schemas
- [ ] Monitor admin UI page load times
- [ ] Review error rates per endpoint
```

## Compliance Verification

### Audit Trail
```bash
# Verify all changes recorded
SELECT COUNT(*) FROM price_histories;
-- Should match: # of schema creates + updates + # of override creates + updates + deletes

# Verify user attribution
SELECT DISTINCT changed_by FROM price_histories;
-- Should show admin user IDs

# Verify timestamps accurate
SELECT MIN(changed_at) as first_change, MAX(changed_at) as last_change FROM price_histories;
```

### Data Retention
```bash
# Verify history not being deleted
SELECT COUNT(*) FROM pg_stat_user_tables WHERE relname = 'price_histories';
-- Should show DELETE count = 0

# Verify snapshots in orders
SELECT COUNT(*) FROM orders WHERE applied_price_schema_id IS NOT NULL;
-- Should equal total orders
```

## Sign-Off Checklist

### Development Team
- [ ] Code review completed
- [ ] All tests passing
- [ ] No compilation errors
- [ ] Database schema verified

### QA Team
- [ ] Functional testing complete
- [ ] Admin UI testing complete
- [ ] API endpoint testing complete
- [ ] Edge cases tested

### DevOps Team
- [ ] Database backup created
- [ ] Migration tested on staging
- [ ] Rollback plan documented
- [ ] Monitoring configured

### Product Team
- [ ] Feature works as specified
- [ ] Admin UI is intuitive
- [ ] Performance acceptable
- [ ] No data loss

### Security Team
- [ ] Audit trail verified
- [ ] User attribution confirmed
- [ ] No plaintext sensitive data
- [ ] GDPR/compliance requirements met

## Post-Deployment Support

### Common Issues & Solutions

**Issue: "No active price schema found"**
- Solution: Run init script to create default schema
- Check: `SELECT * FROM price_schemas WHERE is_active = true;`

**Issue: Chapter prices not loading in reader app**
- Solution: Verify pricing.service is using `getChapterPrices()`
- Check: `SELECT * FROM chapter_price_overrides WHERE chapter_id = 'X';`

**Issue: Orders not showing applied prices**
- Solution: Run migration on Orders table
- Check: `SELECT COUNT(*) FROM orders WHERE applied_price_schema_id IS NOT NULL;`

**Issue: Admin UI not showing schemas**
- Solution: Check API endpoint returns data
- Command: `curl http://localhost:3000/api/admin/price-schemas`

**Issue: Slow price history queries**
- Solution: Verify indexes created
- Check: `SELECT * FROM pg_indexes WHERE tablename = 'price_histories';`

### Support Escalation
```
Level 1: Check if default schema exists
Level 2: Verify migration applied completely
Level 3: Check database logs for constraint violations
Level 4: Database team - check for lock contention
```

## Sign-Off Date
- [ ] Deployment Date: __________
- [ ] Deployed By: __________
- [ ] Verified By: __________
- [ ] All Checks Passed: __________
