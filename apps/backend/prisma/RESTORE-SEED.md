# Restore Seed System

## Overview

The restore seed system allows you to:
1. **Export** all current database data to a JSON file
2. **Restore** that data to recreate the exact database state

This is useful for:
- Creating backups before making major changes
- Sharing test data with team members
- Resetting to a known good state
- Version controlling database snapshots

## Files

- **`scripts/extract-all-data.ts`** - Exports all database tables to JSON
- **`seeds/03-restore-seed.ts`** - Seed that imports data from restore-data.json
- **`seeds/data/restore-data.json`** - The exported data file (auto-generated)

## Usage

### 1. Export Current Database

Export all current data to `seeds/data/restore-data.json`:

```bash
cd apps/backend
npx ts-node prisma/scripts/extract-all-data.ts
```

**Output:**
```
📦 Starting complete database export...

✅ Database exported successfully
📁 Location: /path/to/seeds/data/restore-data.json

📊 Export Summary:
   ✓ users: 11
   ✓ chapters: 14
   ✓ volumes: 70
   ✓ orders: 61
   ... (all tables)
```

### 2. Run Seeds with Restore Data

The restore seed is automatically integrated into the main seed process:

```bash
cd apps/backend
npm run seed
```

**Execution Order:**
1. Clean data tables
2. Run generated seed (test data)
3. Run production seed
4. Run restore seed (loads `restore-data.json` if it exists)

### 3. Using Restore Data

Once you have a `restore-data.json` file:

- Commit it to git to preserve your test data
- Team members can run `npm run seed` to get the same state
- Reset to this state anytime by running `npm run seed`

## Important: Data Integrity

All exported data is **complete and fully usable**:
- **Passwords**: Full bcrypt hashes (not truncated) - can be restored as-is
- **UUIDs**: Complete primary and foreign keys preserved
- **Timestamps**: Full ISO 8601 format maintained
- **Binary data**: Base64 encoded for JSON compatibility
- **Large fields**: Accroches, descriptions, and content fully included

This means your restored database will be **an exact replica** of the original state.

## Data Exported

The restore seed exports ALL tables including:

**Core Content:**
- Users & Sessions
- Chapters & Volumes
- Volume Versions & Assets
- Chapter Assets & Tagging

**Business Data:**
- Orders & Refunds
- Entitlements & Unlocks
- Prices & Price History
- Promotions & Applied Promotions

**Features:**
- Badges & User Badges
- Constellations & Progress
- Reward Unlocks
- Reviews & Audit Logs
- Bundles & System Configs

## JSON Structure

The exported file has this structure:

```json
{
  "metadata": {
    "exportedAt": "2026-02-13T10:30:00.000Z",
    "tables": {
      "users": 11,
      "chapters": 14,
      "volumes": 70,
      ...
    }
  },
  "data": {
    "users": [...],
    "chapters": [...],
    "volumes": [...],
    ...
  }
}
```

**IMPORTANT: No Data Truncation**

Each table is a simple array of records with **ALL fields completely transcribed**:
- ✅ No "..." or abbreviations
- ✅ Full bcrypt password hashes
- ✅ Complete JWT/session tokens
- ✅ Full SHA256 checksums
- ✅ Untruncated text content (accroches, descriptions)
- ✅ Complete timestamps in ISO 8601 format
- ✅ Full UUIDs and identifiers

The exported data is **exactly what you'll restore** - nothing is cut off or shortened.

## Important Notes

### Binary Data
- Images (ChapterAsset.objectKey) are referenced by filename, not embedded
- Encrypted blobs (EncryptedBlob) are Base64 encoded in JSON
- Asset files should be backed up separately

### Uniqueness
- The restore process skips records with duplicate unique keys
- Useful when importing on top of existing data
- Sessions will always be restored (not persistent across restarts)

### Large Files
- If the JSON grows very large, consider compression
- Current size with ~60 orders: ~100-200KB

## Examples

### Export before major changes
```bash
# Export current state
npx ts-node prisma/scripts/extract-all-data.ts

# Save as backup
cp seeds/data/restore-data.json seeds/data/restore-data.backup.json

# Now make changes to database...
# Later, restore from backup:
npx ts-node prisma/scripts/extract-all-data.ts < backup
npm run seed
```

### Share test data with team
```bash
# Developer A exports working test state
npx ts-node prisma/scripts/extract-all-data.ts
git add seeds/data/restore-data.json
git commit -m "Update test data snapshot"
git push

# Developer B pulls and runs
git pull
npm run seed  # Automatically restores the exact same state
```

### Manual restore (if needed)
```bash
# The restore seed is built into the main seed, so just:
npm run seed

# Or run it directly:
npx ts-node prisma/seeds/index.ts
```

## Troubleshooting

### "Restore data file not found"
This is normal on fresh setup. The restore seed is optional.

### "Unique constraint violation"
Some records weren't restored because they already exist. This is expected behavior for optional imports.

### "Cannot restore - foreign key missing"
The restore order is designed to prevent this. If it happens, check:
1. Parent records must exist before children
2. All references must have matching IDs
3. Run with a fresh database if unsure

### Large export file
If `restore-data.json` becomes too large:
1. Split into multiple snapshots
2. Archive old snapshots
3. Consider compression (gzip)

## See Also

- [SEEDING.md](./SEEDING.md) - Overall seeding strategy
- [schema.prisma](./schema.prisma) - Database schema
- [scripts/backup-database.ts](./scripts/backup-database.ts) - Content-only backup
