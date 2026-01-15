# Copilot Instructions for Cher Journal

## Project Overview
Story reading platform with narrator/protagonist perspectives, wait-until-free monetization, and Stripe payments. Users can read chapters with timers, purchase access, and experience stories from different viewpoints.

## Architecture
**Monorepo** structure using npm workspaces:
```
apps/
  backend/       - Node.js + Fastify + Prisma + PostgreSQL
  admin/         - React + TailwindCSS (admin interface)
  web/           - React + TailwindCSS (reader web app)
  mobile/        - React Native (Expo)
  test/          - Integration tests
packages/
  types/         - Shared TypeScript types
  config/        - Configuration management
  utils/         - Shared utilities
```

## Tech Stack
- **Backend**: Node.js 20+, Fastify, Prisma, PostgreSQL, TypeScript
- **Frontend**: React 18, TypeScript, TailwindCSS, Vite, Zustand
- **Mobile**: React Native, Expo
- **Payment**: Stripe Checkout + Webhooks
- **Security**: AES-256-GCM encryption, httpOnly cookies, rate limiting

## Critical Concepts

### 1. Text Encryption (MANDATORY)
- **ALL** volume text stored encrypted in `EncryptedBlob` table
- Uses envelope encryption: KEK (from env) + DEK (per-blob)
- Decryption ONLY on server-side
- Client receives **images** (PNG/WEBP), never plaintext
- Rendering: `apps/backend/src/modules/reader/reader/reader.service.ts`

### 2. Wait-Until-Free System
- Timer starts ONLY when user opens volume (not before)
- One active wait per chapter maximum
- Stored in `Unlock` table with `triggeredBy: WAIT`
- Check: `apps/backend/src/modules/reader/wait/wait.service.ts`

### 3. Perspectives
- **NARRATOR**: Standard perspective (included in BASE access)
- **PROTAGONIST**: First-person perspective (requires ALL access)
- Each volume has 2 `VolumeVersion` records (one per perspective)

### 4. Stripe Integration
- Checkout via `stripe.checkout.sessions.create`
- **Access granted ONLY via webhooks** (`/stripe/webhook`)
- Idempotence via `WebhookEvent` table
- Never trust client-side payment status

### 5. Dual Route Registration
Backend routes work with **AND** without `/api` prefix:
- Both `/auth/login` and `/api/auth/login` are valid
- Implemented in `apps/backend/src/app.ts`

## Module Structure (Backend)
Every module MUST have:
```
modules/[feature]/
  [feature].routes.ts      - Fastify route registration
  [feature].controller.ts  - HTTP handlers
  [feature].service.ts     - Business logic
  [feature].schemas.ts     - Zod validation schemas
```

Example: `apps/backend/src/modules/admin/chapters/`

## Key Files
- **Prisma Schema**: `apps/backend/prisma/schema.prisma` (authoritative)
- **Seed**: `apps/backend/prisma/seed.ts` (demo data)
- **Config**: `packages/config/src/index.ts` (env management)
- **Crypto**: `apps/backend/src/lib/crypto.ts` (encryption logic)
- **Auth Middleware**: `apps/backend/src/lib/middleware.ts`

## Common Patterns

### Adding a New Backend Module
1. Create directory: `apps/backend/src/modules/[feature]/`
2. Create `.schemas.ts` with Zod validation
3. Create `.service.ts` with Prisma logic
4. Create `.controller.ts` with Fastify handlers
5. Create `.routes.ts` and register in `src/app.ts`
6. Import in app.ts routes array

### Adding Text to a Volume
```typescript
const encrypted = encrypt(plaintext);
const blob = await prisma.encryptedBlob.create({
  data: {
    ownerId: versionId,
    purpose: 'volume_text',
    cipherText: encrypted.cipherText,
    iv: encrypted.iv,
    tag: encrypted.tag,
    wrappedDek: encrypted.wrappedDek,
    alg: encrypted.alg,
    version: encrypted.version,
  },
});
await prisma.volumeVersion.update({
  where: { id: versionId },
  data: { textBlobId: blob.id },
});
```

### Checking User Access
```typescript
const entitlement = await prisma.entitlement.findFirst({
  where: {
    userId,
    chapterId,
    volumeFrom: { lte: volumeNumber },
    volumeTo: { gte: volumeNumber },
  },
});

// Check unlock/wait
const unlock = await prisma.unlock.findUnique({
  where: { userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber } },
});

const isLocked = unlock && unlock.unlocksAt > new Date();
```

## Development Workflow

### Running the Stack
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Admin
npm run dev:admin

# Terminal 3 - Web (optional)
npm run dev:web
```

### Database Changes
```bash
# After modifying schema.prisma
npm run prisma:migrate:dev -- --name your_migration_name
npm run prisma:generate
```

### Resetting Database
```bash
npm run prisma:migrate:dev -- --name reset
npm run prisma:seed
```

## Security Requirements
- ✅ No plaintext text in client responses
- ✅ Session cookies are httpOnly
- ✅ All inputs validated with Zod
- ✅ No SQL concatenation (Prisma only)
- ✅ Stripe webhook signatures verified
- ✅ Upload validation (type, size, mime)
- ✅ CORS restricted to configured origins

## Common Pitfalls
1. **Don't** send encrypted text to client - render as image
2. **Don't** trust client payment status - use webhooks only
3. **Don't** start wait timer before user opens volume
4. **Don't** forget to register routes in BOTH `/api` and `/` prefixes
5. **Don't** skip Zod validation in endpoints

## Testing
Credentials (after seed):
- **Admin**: admin@cherjournal.com / admin123
- **User**: user@example.com / user123

Test data includes:
- 2 chapters (1 published, 1 in-progress)
- 10 volumes for chapter 1, 5 for chapter 2
- Encrypted text for all versions
- Demo entitlements and wait unlock

## Environment Variables
Critical vars in `apps/backend/.env`:
```env
DATABASE_URL=postgresql://...
MASTER_ENCRYPTION_KEY=32-char-minimum-key
SESSION_SECRET=strong-random-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Notes for AI Assistants
- This is a production-grade monorepo with strict conventions
- Always respect the module structure (routes/controller/service/schemas)
- Encryption and security are non-negotiable requirements
- When adding features, check existing patterns in similar modules
- Backend code is TypeScript, use strong typing
- Test webhooks with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
