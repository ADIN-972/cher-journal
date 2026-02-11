# Database Seeding & Backup System

This document describes the database seeding and backup system for Cher Journal.

## Overview

The seeding system is split into two distinct parts:

1. **Generated Seed** (`01-generated-seed.ts`) - Test/fake data for development
2. **Production Seed** (`02-production-seed.ts`) - Real production data imported from backup

This separation ensures clean code organization and prevents mixing development data with production data.

## File Structure

```
prisma/
├── seed.ts                      # Old seed file (deprecated)
├── seeds/
│   ├── index.ts                 # Main orchestrator
│   ├── 01-generated-seed.ts     # Generated/test data
│   ├── 02-production-seed.ts    # Production data (from backup)
│   └── data/
│       └── production-data.json # Production data backup
├── scripts/
│   ├── backup-database.ts       # Export current data to JSON
│   └── restore-database.ts      # Restore from JSON backup
└── SEEDING.md                   # This file
```

## Scripts

### Backup Database

Exports all production-related data to `production-data.json`:

```bash
npm run backup:db
```

**What it exports:**
- Chapters
- Volumes
- Volume Versions
- Chapter Genre Tags
- Assets

### Restore Database

Restores data from the backup file:

```bash
npm run restore:db
```

⚠️ **Note:** This clears related tables first!

### Seed Database

Runs the complete seeding process:

```bash
npm run prisma:seed
```

**Execution order:**
1. Cleans all content tables
2. Creates generated/test data
3. Imports production data from backup

### Migrate & Backup

Runs migrations and automatically backs up the database:

```bash
npm run prisma:migrate:dev
```

This automatically calls `backup:db` after migration.

## Workflow

### When Modifying Production Data

1. Make changes in the admin panel or database
2. Export the data:
   ```bash
   npm run backup:db
   ```
3. Commit the updated `production-data.json`

### When Deploying to Production

1. Run migrations (automatically backs up):
   ```bash
   npm run prisma:migrate:dev
   ```
2. Seed the database:
   ```bash
   npm run prisma:seed
   ```
3. Verify data:
   ```bash
   npm run prisma:studio
   ```

### When Setting Up a New Environment

1. Pull the latest code
2. Seed the database:
   ```bash
   npm run prisma:seed
   ```
3. All test and production data will be loaded automatically

## Data Preservation

The system ensures that:

✅ Production data is always versionable in Git
✅ Backups are created before each migration
✅ Data survives schema changes
✅ Multiple environments can have consistent data
✅ Development doesn't interfere with production data

## Generated vs Production Data

### Generated Data (01-generated-seed.ts)

- **Purpose:** Test/development content
- **What:** 14 chapters with 5-6 volumes each
- **When:** Always created
- **Changes:** Modified by code updates

### Production Data (02-production-seed.ts)

- **Purpose:** Real content from production
- **What:** Imported from `production-data.json`
- **When:** Only if backup exists
- **Changes:** Modified through the app, then backed up

## Best Practices

1. **Always backup before major changes:**
   ```bash
   npm run backup:db
   ```

2. **Commit backup files:**
   - Include `production-data.json` in Git
   - This creates an audit trail of data changes

3. **Test seeding in development:**
   ```bash
   npm run prisma:seed
   npm run prisma:studio  # Verify in Prisma Studio
   ```

4. **Use meaningful commits:**
   ```bash
   git add production-data.json
   git commit -m "data: Update production content with new chapters"
   ```

## Troubleshooting

### Backup file not found

If you see: `No production data backup found. Skipping production seed.`

This is normal on first setup. Create a backup:
```bash
npm run backup:db
```

### Duplicate entries after seeding

If production data overlaps with generated data, the production seed checks for existing records and won't duplicate.

### Foreign key constraints

The restore order matters:
1. Chapters
2. Genre Tags
3. Volumes
4. Volume Versions
5. Assets

If you modify this order, ensure foreign key relationships are respected.

## Migration

To migrate from old seed.ts to new system:

1. Run the old seed and backup:
   ```bash
   npm run backup:db
   ```

2. Update migration reference:
   ```bash
   npm run prisma:migrate:dev
   ```

3. Seed with new system:
   ```bash
   npm run prisma:seed
   ```

## Future Improvements

- [ ] Encrypt production-data.json for sensitive fields
- [ ] Add compression for large backups
- [ ] Create versioned backups with timestamps
- [ ] Add differential backups (only changed records)
- [ ] Automate production backups
