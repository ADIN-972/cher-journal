# Encryption Strategy

## Overview

Cher Journal implements a **hybrid encryption strategy** that can be toggled between:
- **Development Mode** (plaintext) - Fast, debuggable, simple
- **Production Mode** (encrypted) - Secure, GDPR-compliant, defense-in-depth

## Configuration

### Environment Variable

```bash
# .env
ENCRYPTION_ENABLED=false  # Development: plaintext storage
ENCRYPTION_ENABLED=true   # Production: encrypted storage (default)
```

**Default:** `true` (encryption enabled)

## Architecture

### Development Mode (`ENCRYPTION_ENABLED=false`)

```
User creates chapter
  ↓
generateVolumeText("Cher journal\n\n...Lorem ipsum...")
  ↓
VolumeVersion.create({ text: plaintext })  ← Stored directly in DB
  ↓
Reader fetches VolumeVersion.text
  ↓
Render as PNG and return
```

**Advantages:**
- ✅ Fast development (no crypto overhead)
- ✅ Easy debugging (`SELECT * FROM volume_versions`)
- ✅ Full-text search possible
- ✅ Simpler backup/restore
- ✅ No key management complexity

**Disadvantages:**
- ❌ No protection if DB is leaked
- ❌ Admins can read all content
- ❌ Not GDPR-compliant for sensitive data

### Production Mode (`ENCRYPTION_ENABLED=true`)

```
User creates chapter
  ↓
generateVolumeText("Cher journal\n\n...Lorem ipsum...")
  ↓
encrypt(plaintext) → { cipherText, iv, tag, wrappedDek }
  ↓
EncryptedBlob.create({ cipherText, iv, tag, ... })
  ↓
VolumeVersion.create({ textBlobId: blob.id, text: null })
  ↓
Reader fetches VolumeVersion + textBlob
  ↓
decryptBlob(textBlob) → plaintext (in RAM only)
  ↓
Render as PNG and return
```

**Advantages:**
- ✅ **Defense in depth** - DB leak doesn't expose content
- ✅ **Separation of privileges** - DB admins can't read content
- ✅ **GDPR compliance** - Encrypted data at rest
- ✅ **Audit trail** - Key access can be logged
- ✅ **Key rotation** - Possible without data migration (envelope encryption)

**Disadvantages:**
- ❌ Performance overhead (encrypt/decrypt CPU cost)
- ❌ No full-text search on encrypted data
- ❌ Complex key management (lose key = lose data)
- ❌ Harder debugging (need app to decrypt)
- ❌ Backup/restore more complex

## Encryption Details

### Algorithm
- **Cipher**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: Envelope Encryption
  - **KEK** (Key Encryption Key): From `MASTER_ENCRYPTION_KEY` env variable
  - **DEK** (Data Encryption Key): Random per blob, wrapped with KEK
- **Authentication**: AEAD with 128-bit tag (prevents tampering)

### Key Hierarchy

```
MASTER_ENCRYPTION_KEY (env variable, 32+ bytes)
  ↓ (wraps)
DEK_1 (random 256 bits) → encrypts blob_1
DEK_2 (random 256 bits) → encrypts blob_2
DEK_3 (random 256 bits) → encrypts blob_3
...
```

**Benefits:**
- Each blob has unique DEK (compromise of one doesn't affect others)
- KEK rotation possible without re-encrypting all blobs (just re-wrap DEKs)
- DEKs stored encrypted in DB (can't be used without KEK)

## Implementation

### Files Modified

| File | Purpose |
|------|---------|
| `packages/config/src/index.ts` | Added `encryptionEnabled` flag |
| `apps/backend/.env.example` | Documented `ENCRYPTION_ENABLED` |
| `chapters.service.ts` | Conditional encryption in `create()` and `bootstrapVolumes()` |
| `volumes.service.ts` | Conditional guards in `createVersion()` and `updateVersion()` |
| `reader.service.ts` | Already supports both modes via fallback |

### Code Example

```typescript
// chapters.service.ts
if (config.encryptionEnabled) {
  // PRODUCTION: Encrypt and store in EncryptedBlob
  const encrypted = encrypt(volumeText);
  const blob = await tx.encryptedBlob.create({
    data: {
      ownerId: volume.id,
      purpose: 'volume_text',
      cipherText: encrypted.cipherText,
      iv: encrypted.iv,
      tag: encrypted.tag,
      wrappedDek: encrypted.wrappedDek,
      alg: encrypted.alg,
      version: encrypted.version,
    },
  });
  await tx.volumeVersion.create({
    data: {
      volumeId: volume.id,
      perspective: Perspective.NARRATOR,
      textBlobId: blob.id,
    },
  });
} else {
  // DEVELOPMENT: Store plaintext
  await tx.volumeVersion.create({
    data: {
      volumeId: volume.id,
      perspective: Perspective.NARRATOR,
      text: volumeText,
    },
  });
}
```

## Security Considerations

### Threat Model

| Threat | Dev Mode | Prod Mode |
|--------|----------|-----------|
| SQL Injection leading to data leak | 🔴 **EXPOSED** | 🟢 **PROTECTED** |
| Database backup stolen | 🔴 **EXPOSED** | 🟢 **PROTECTED** |
| Insider threat (DB admin) | 🔴 **EXPOSED** | 🟢 **PROTECTED** |
| Server compromise (full access) | 🔴 **EXPOSED** | 🔴 **EXPOSED** (KEK in env) |
| MITM attack (HTTPS bypass) | 🔴 **EXPOSED** | 🔴 **EXPOSED** (PNG over HTTP) |

### Key Management

**CRITICAL:** The `MASTER_ENCRYPTION_KEY` is the single point of failure.

**Best Practices:**
1. ✅ Generate strong key: `openssl rand -base64 32`
2. ✅ Store in environment variables (not in code)
3. ✅ Use secrets management (AWS Secrets Manager, HashiCorp Vault)
4. ✅ Backup key securely (encrypted, offline, multiple locations)
5. ✅ Rotate keys periodically (re-wrap DEKs, not data)
6. ✅ Audit key access (log all decrypt operations)

**NEVER:**
- ❌ Commit key to git
- ❌ Store key in database
- ❌ Send key over network
- ❌ Share key between environments (dev/staging/prod)

### Performance Impact

**Benchmark (estimated):**
- Encryption: ~0.5-2ms per 1KB text
- Decryption: ~0.5-2ms per 1KB text
- Storage overhead: +128 bytes per blob (iv, tag, wrappedDek, metadata)

For typical use cases (10 volumes per chapter, 1KB text each):
- **Dev Mode**: 0ms encryption overhead
- **Prod Mode**: ~20ms total encryption overhead per chapter creation

## Decision Matrix

### When to Enable Encryption

✅ **Enable (`ENCRYPTION_ENABLED=true`)** if:
- Storing user-generated content (journals, private stories)
- Handling sensitive or proprietary data (unpublished manuscripts)
- GDPR/compliance requirements
- Multi-tenant with strict data isolation
- Paranoid security posture (defense in depth)

❌ **Disable (`ENCRYPTION_ENABLED=false`)** if:
- Development/testing environment
- Demo data only (Lorem ipsum)
- Public domain content
- Performance-critical (high read throughput)
- Debugging/troubleshooting phase

### Migration Path

**Enabling encryption later:**
1. Set `ENCRYPTION_ENABLED=true`
2. Run migration script to encrypt existing plaintext
3. Verify all blobs created
4. Deploy new code

**Disabling encryption (NOT RECOMMENDED for prod):**
1. Export all encrypted data
2. Decrypt with current KEK
3. Set `ENCRYPTION_ENABLED=false`
4. Re-import as plaintext
5. ⚠️ **WARNING**: Lose all encryption benefits

## Monitoring

### Health Checks

```typescript
// Check encryption status
const isEncrypted = await prisma.volumeVersion.findFirst({
  where: { textBlobId: { not: null } }
});

if (config.encryptionEnabled && !isEncrypted) {
  logger.error('ENCRYPTION_MISMATCH: Encryption enabled but no encrypted blobs found');
}
```

### Metrics to Track

- `encryption.decrypt_time_ms` - Decryption latency
- `encryption.blob_size_bytes` - Storage overhead
- `encryption.failed_decrypts` - Potential key issues
- `encryption.plaintext_fallbacks` - Legacy data usage

## FAQ

**Q: Can I enable encryption for some chapters and not others?**
A: Currently no. It's a global setting. You could implement per-chapter encryption by adding a `encryptionEnabled` field to the `Chapter` model.

**Q: What happens if I lose the `MASTER_ENCRYPTION_KEY`?**
A: **All encrypted data is permanently lost.** There is no recovery. Backup your key!

**Q: Can I search encrypted text?**
A: No. Full-text search requires plaintext. Consider:
- Storing encrypted + plaintext (searchable but less secure)
- Homomorphic encryption (complex, slow)
- Client-side search (decrypt all, search locally)

**Q: How do I rotate the master key?**
A: 
1. Generate new key
2. For each `EncryptedBlob`:
   - Decrypt DEK with old KEK
   - Re-wrap DEK with new KEK
   - Update `wrappedDek` in DB
3. Update `MASTER_ENCRYPTION_KEY` env variable
4. Restart servers

**Q: Why not use database-level encryption (e.g., PostgreSQL TDE)?**
A: Database encryption protects disk theft but not:
- SQL injection
- Backup leaks
- Insider threats
Application-level encryption provides defense in depth.

## References

- [NIST SP 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) - Key Management Recommendations
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

## Changelog

- **2026-01-11**: Initial implementation of hybrid encryption strategy
  - Added `ENCRYPTION_ENABLED` flag
  - Implemented conditional encryption in chapter/volume creation
  - Documented architecture and trade-offs
