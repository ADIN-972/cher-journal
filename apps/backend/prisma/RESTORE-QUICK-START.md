# Restore Seed - Quick Start Guide

## 🚀 30 seconds to backup/restore your database

### Export Current Database

```bash
cd apps/backend
npx ts-node prisma/scripts/extract-all-data.ts
```

**What it does:**
- Exports ALL tables from your database to `prisma/seeds/data/restore-data.json`
- Creates a complete snapshot of your current state
- Includes metadata with export timestamp and record counts

### Restore from Snapshot

```bash
cd apps/backend
npm run seed
```

**What it does:**
- Cleans all data tables
- Runs generated seed (test data)
- Runs production seed
- **Restores your snapshot** if `restore-data.json` exists

## 📋 Common Workflows

### Scenario 1: Before Making Major Changes

```bash
# 1. Export current state
npx ts-node prisma/scripts/extract-all-data.ts

# 2. Make changes...
# Update database manually or through admin panel

# 3. If something goes wrong, restore:
npm run seed  # Back to the saved snapshot!
```

### Scenario 2: Share Test Data with Team

```bash
# Developer A - Export test state
npx ts-node prisma/scripts/extract-all-data.ts

# Commit to git
git add prisma/seeds/data/restore-data.json
git commit -m "Update test data snapshot"
git push

# Developer B - Pull and restore
git pull
npm run seed  # Same exact state!
```

### Scenario 3: Create Timestamped Backups

```bash
# Export and keep old backups
npx ts-node prisma/scripts/extract-all-data.ts
cp prisma/seeds/data/restore-data.json \
   "prisma/seeds/data/restore-data_$(date +%Y%m%d_%H%M%S).json"

# Now you have both latest.json and backup_YYYYMMDD_HHMMSS.json
```

## 📊 What Gets Exported

**Everything** - all 38 tables with **complete data**:

- ✅ Users & Sessions (full password hashes)
- ✅ Chapters & Volumes (with all accroches and descriptions)
- ✅ Orders & Refunds
- ✅ Prices & Promotions
- ✅ Badges & Progression
- ✅ Constellations
- ✅ Asset metadata
- ✅ Audit logs
- ✅ And more!

**Data Integrity:**
- All password hashes are complete bcrypt values
- All UUIDs and IDs are preserved
- All timestamps are in full ISO 8601 format
- All text fields are untruncated
- The restored database is an **exact replica**

Note: Asset files (images) are NOT embedded - only file references.

## 🔧 Advanced: Using the Helper Script

If you're on macOS/Linux, use the helper script:

```bash
bash prisma/scripts/restore-helper.sh [command]
```

Commands:
```bash
# Export with one command
bash scripts/restore-helper.sh export

# Export and create timestamped backup
bash scripts/restore-helper.sh export-backup

# Restore from backup
bash scripts/restore-helper.sh restore-backup

# See status
bash scripts/restore-helper.sh status

# List all backups
bash scripts/restore-helper.sh list-backups
```

## 📁 Files Created

After first export:

```
prisma/seeds/data/
├── restore-data.json           # Latest snapshot (auto-updated)
├── restore-data_20260213_103000.json  # Timestamped backup
├── restore-data_20260213_093000.json  # Previous backup
└── restore-data-EXAMPLE.json   # Example structure
```

## ⚙️ How It Works

**Export Flow:**
```
extract-all-data.ts
  → Query all 38 tables
  → Serialize to JSON (handling BigInt, Buffer, etc)
  → Write to restore-data.json
  → Print summary with record counts
```

**Restore Flow:**
```
seeds/index.ts
  → Run 01-generated-seed.ts (test data)
  → Run 02-production-seed.ts (production data)
  → Run 03-restore-seed.ts (YOUR SNAPSHOT!)
     - Check if restore-data.json exists
     - Restore tables in dependency order
     - Skip duplicate records (no errors)
     - Print progress
```

## ⚠️ Important Notes

### Complete Data Export - NO TRUNCATION
**All data fields are fully transcribed:**
- ✅ Passwords: Full bcrypt hashes (e.g., `$2b$10$N9qo8uLOickgx2ZMRZoMye7J8jQG7cqZ...`)
- ✅ Tokens: Complete session/JWT tokens
- ✅ Hashes: Full SHA256 values
- ✅ Text: Complete accroches, descriptions, content
- ✅ IDs: Full UUIDs and identifiers
- ✅ Timestamps: Complete ISO 8601 dates

**When you restore, you get an EXACT REPLICA of the original database.**

### Don't commit sensitive data
- Passwords are hashed (safe)
- Remove auth tokens if not needed
- Remove encrypted blobs if privacy is concern
- Consider git-ignoring for production:

```bash
# Add to .gitignore for production
echo "prisma/seeds/data/restore-data.json" >> .gitignore
```

### Images are referenced, not embedded
- `restore-data.json` is ~100-200KB
- Images files stay in `/uploads` folder
- Must back up images separately if needed

### Large files
- If JSON grows > 10MB, consider:
  - Using compression (gzip)
  - Splitting into multiple snapshots
  - Archiving old backups

## 🐛 Troubleshooting

### "File not found" error
- This is normal! The restore seed is optional
- It only runs if `restore-data.json` exists

### "Unique constraint violation"
- Some records already exist (expected)
- The restore process skips duplicates
- This is safe for partial imports

### Large file size
```bash
# Check file size
du -h prisma/seeds/data/restore-data.json

# Check record count
jq '.metadata.tables' prisma/seeds/data/restore-data.json
```

### Need to restore from specific backup?
```bash
# Copy backup to restore-data.json
cp "prisma/seeds/data/restore-data_20260210_150000.json" \
   "prisma/seeds/data/restore-data.json"

# Then run seed
npm run seed
```

## 📚 Full Documentation

See [RESTORE-SEED.md](./RESTORE-SEED.md) for complete documentation including:
- Detailed export/restore walkthrough
- JSON structure reference
- All supported tables
- Error handling
- Advanced usage patterns

## 🎯 Next Steps

1. **First time?** Export your current state:
   ```bash
   npx ts-node prisma/scripts/extract-all-data.ts
   ```

2. **Review the JSON** to see what data exists:
   ```bash
   cat prisma/seeds/data/restore-data.json
   ```

3. **Commit to git** to preserve it:
   ```bash
   git add prisma/seeds/data/restore-data.json
   git commit -m "Export test data snapshot"
   ```

4. **From now on**, any team member can restore with:
   ```bash
   npm run seed
   ```

That's it! You now have version-controlled database snapshots. 🎉
