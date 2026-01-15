# Quick Start: Encryption Toggle

## TL;DR

```bash
# Development (fast, plaintext)
echo "ENCRYPTION_ENABLED=false" >> apps/backend/.env
npm run prisma:seed

# Production (secure, encrypted)
echo "ENCRYPTION_ENABLED=true" >> apps/backend/.env
npm run prisma:seed
```

## What This Does

**`ENCRYPTION_ENABLED=false`** (Development Mode)
- ✅ Volumes stored as **plaintext** in `VolumeVersion.text`
- ✅ Fast, easy debugging, searchable
- ❌ No security if database leaks

**`ENCRYPTION_ENABLED=true`** (Production Mode - Default)
- ✅ Volumes **encrypted** with AES-256-GCM
- ✅ Stored in `EncryptedBlob`, linked via `VolumeVersion.textBlobId`
- ✅ Defense in depth, GDPR-compliant
- ❌ Slightly slower, no full-text search

## Testing Both Modes

### Test Development Mode (Plaintext)
```bash
# 1. Set flag
echo "ENCRYPTION_ENABLED=false" > apps/backend/.env

# 2. Reset database
npm run prisma:migrate:dev -- --name reset

# 3. Seed
npm run prisma:seed

# 4. Verify plaintext storage
npm run prisma:studio
# Check: VolumeVersion.text should have "Cher journal..."
# Check: VolumeVersion.textBlobId should be NULL
```

### Test Production Mode (Encrypted)
```bash
# 1. Set flag
echo "ENCRYPTION_ENABLED=true" > apps/backend/.env

# 2. Reset database
npm run prisma:migrate:dev -- --name reset

# 3. Seed
npm run prisma:seed

# 4. Verify encrypted storage
npm run prisma:studio
# Check: VolumeVersion.text should be NULL
# Check: VolumeVersion.textBlobId should have UUID
# Check: EncryptedBlob table should have cipherText (binary data)
```

## Performance Comparison

**Creating 1 chapter with 10 volumes:**

| Mode | Time | Storage |
|------|------|---------|
| Dev (plaintext) | ~50ms | 10 rows in `volume_versions` |
| Prod (encrypted) | ~70ms | 10 rows in `volume_versions` + 20 rows in `encrypted_blobs` |

**Reading 1 volume:**

| Mode | Time | Process |
|------|------|---------|
| Dev (plaintext) | ~5ms | Fetch → Render PNG |
| Prod (encrypted) | ~7ms | Fetch → Decrypt → Render PNG |

## Full Documentation

See [docs/ENCRYPTION.md](../docs/ENCRYPTION.md) for:
- Architecture details
- Security considerations
- Key management
- Migration guide
- FAQ

## Quick Decision Guide

**Use `ENCRYPTION_ENABLED=false` (Dev) if:**
- Local development
- Testing/debugging
- Demo with Lorem ipsum
- Performance benchmarking

**Use `ENCRYPTION_ENABLED=true` (Prod) if:**
- Production deployment
- User-generated content
- Sensitive data (journals, unpublished stories)
- Compliance requirements (GDPR)

**Default:** `true` (encrypted by default for safety)
