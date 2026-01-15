# Skill: Doc

## Description
Génération et mise à jour de documentation pour Cher Journal.

## Usage
```
@doc [type] [subject]
```

## Types de Documentation

### 1. API Documentation
```
@doc api /auth/login
```

Génère:
```markdown
### POST /api/auth/login

Authentifie un utilisateur et crée une session.

**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "status": "ACTIVE"
    }
  }
}
```

**Cookies Set**:
- `sessionToken` - httpOnly session cookie (30 days)

**Errors**:
- `400 VALIDATION_ERROR` - Email ou password invalide
- `401 INVALID_CREDENTIALS` - Identifiants incorrects
- `403 ACCOUNT_SUSPENDED` - Compte suspendu

**Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'
```
```

### 2. Module Documentation
```
@doc module wait-until-free
```

Génère:
```markdown
# Wait-Until-Free Module

## Description
Système de monétisation permettant aux utilisateurs d'attendre 24h pour débloquer un volume gratuitement.

## Architecture
- **Service**: `wait.service.ts` - Business logic
- **Controller**: `wait.controller.ts` - HTTP handlers
- **Routes**: `wait.routes.ts` - Endpoints definition
- **Schemas**: `wait.schemas.ts` - Validation Zod

## Fonctionnement

### 1. Démarrage du Timer
Lorsqu'un utilisateur accède à un volume verrouillé pour la première fois :
1. Vérifier qu'il a un entitlement pour ce chapitre
2. Vérifier qu'il n'a pas déjà un wait actif sur ce chapitre
3. Créer un `Unlock` avec `triggeredBy: WAIT` et `unlocksAt: now + 24h`
4. Créer/mettre à jour `VolumeRead`

### 2. Vérification d'Accès
Lors de l'accès à un volume :
1. Chercher entitlement correspondant
2. Chercher unlock correspondant
3. Si unlock existe et `unlocksAt < now` → Accès autorisé
4. Sinon → Volume verrouillé

### 3. Contraintes
- **Un seul wait actif par chapitre** (business rule, pas DB constraint)
- Timer démarre uniquement au premier accès
- Si utilisateur achète pendant le wait, unlock reste (mais triggeredBy reste WAIT)

## Database Schema

```prisma
model Unlock {
  id           String            @id @default(uuid())
  userId       String
  chapterId    String
  volumeNumber Int
  triggeredBy  UnlockTriggeredBy // WAIT | PURCHASE
  unlocksAt    DateTime
  createdAt    DateTime          @default(now())

  @@unique([userId, chapterId, volumeNumber])
}
```

## API Endpoints

### POST /api/wait/start
Démarre le timer pour un volume.

### GET /api/wait/status
Récupère le statut d'un wait.

### GET /api/wait/active
Liste tous les waits actifs de l'utilisateur.

## Examples

### Start Wait
```typescript
const status = await waitService.startWait(userId, chapterId, volumeNumber);
console.log(status.unlocksAt); // 24h dans le futur
```

### Check Access
```typescript
const unlock = await prisma.unlock.findUnique({
  where: { userId_chapterId_volumeNumber: { userId, chapterId, volumeNumber } }
});

const hasAccess = unlock && unlock.unlocksAt <= new Date();
```

## Error Handling

- `VOLUME_NOT_FOUND` - Volume inexistant
- `NO_ACCESS` - Pas d'entitlement
- `WAIT_ALREADY_ACTIVE` - Un wait est déjà actif sur ce chapitre

## Testing

```typescript
describe('WaitService', () => {
  it('should start wait timer', async () => {
    const status = await service.startWait(userId, chapterId, 1);
    expect(status.unlocksAt).toBeInstanceOf(Date);
    expect(status.remainingMs).toBeGreaterThan(0);
  });

  it('should prevent duplicate waits', async () => {
    await service.startWait(userId, chapterId, 1);
    await expect(
      service.startWait(userId, chapterId, 2)
    ).rejects.toThrow('WAIT_ALREADY_ACTIVE');
  });
});
```
```

### 3. Function Documentation (JSDoc)
```
@doc function encrypt
```

Génère:
```typescript
/**
 * Chiffre un texte avec AES-256-GCM en utilisant envelope encryption.
 * 
 * Génère un DEK (Data Encryption Key) aléatoire pour chiffrer le texte,
 * puis chiffre le DEK avec le KEK (Key Encryption Key) depuis l'environnement.
 * 
 * @param plaintext - Texte en clair à chiffrer
 * @returns Objet contenant cipherText, iv, tag, wrappedDek, alg, et version
 * 
 * @throws {Error} Si MASTER_ENCRYPTION_KEY n'est pas défini ou trop court
 * 
 * @example
 * ```typescript
 * const encrypted = encrypt("Secret text");
 * await prisma.encryptedBlob.create({
 *   data: {
 *     ownerId: versionId,
 *     purpose: 'volume_text',
 *     ...encrypted
 *   }
 * });
 * ```
 * 
 * @see {@link decrypt} pour déchiffrer
 * @see {@link decryptBlob} pour déchiffrer depuis un enregistrement DB
 */
export function encrypt(plaintext: string): EncryptedData {
  // Implementation...
}
```

### 4. Setup Guide
```
@doc setup local-development
```

Génère:
```markdown
# Local Development Setup

## Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm 9+
- Git

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-org/cher-journal.git
cd cher-journal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create database
createdb cher_journal

# Configure environment
cp apps/backend/.env.example apps/backend/.env

# Edit DATABASE_URL in apps/backend/.env
# Example: postgresql://postgres:password@localhost:5432/cher_journal

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed database
npm run prisma:seed
```

### 4. Environment Variables
```env
# apps/backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cher_journal"
MASTER_ENCRYPTION_KEY="your-32-character-minimum-key-here"
SESSION_SECRET="your-random-session-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5174"
UPLOAD_DIR="./uploads"
```

### 5. Run Applications
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Admin UI
npm run dev:admin

# Terminal 3 - Web UI (optional)
npm run dev:web
```

### 6. Access Applications
- Backend: http://localhost:3000
- Admin: http://localhost:5173
- Web: http://localhost:5174

### 7. Test Credentials
- Admin: admin@cherjournal.com / admin123
- User: user@example.com / user123

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Database Connection Failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

## Next Steps
- Read [API Documentation](API.md)
- Check [Architecture Overview](README.md#architecture)
- Review [Contributing Guidelines](CONTRIBUTING.md)
```

### 5. Troubleshooting Guide
```
@doc troubleshooting encryption-errors
```

Génère:
```markdown
# Troubleshooting: Encryption Errors

## "Unable to authenticate data"

### Symptôme
```
Error: Unsupported state or unable to authenticate data
    at crypto.ts:45
```

### Cause
- MASTER_ENCRYPTION_KEY incorrect ou différent de celui utilisé pour encryption
- Blob corrompu en base de données
- IV, tag, ou wrappedDek manquant/incorrect

### Solutions

#### 1. Vérifier MASTER_ENCRYPTION_KEY
```bash
# Afficher longueur de la clé
echo -n "$MASTER_ENCRYPTION_KEY" | wc -c
# Doit être >= 32 caractères
```

#### 2. Vérifier cohérence de la clé
```typescript
// Temporaire pour debug
console.log('KEK length:', process.env.MASTER_ENCRYPTION_KEY?.length);
console.log('KEK first 8 chars:', process.env.MASTER_ENCRYPTION_KEY?.substring(0, 8));
```

#### 3. Re-seed la base avec nouvelle clé
```bash
# ⚠️ PERTE DE DONNÉES - Dev uniquement
npm run prisma:migrate:reset
npm run prisma:seed
```

#### 4. Vérifier intégrité du blob
```sql
-- Vérifier qu'aucun champ n'est NULL
SELECT id, 
  CASE WHEN "cipherText" IS NULL THEN 'cipherText NULL' END,
  CASE WHEN iv IS NULL THEN 'iv NULL' END,
  CASE WHEN tag IS NULL THEN 'tag NULL' END,
  CASE WHEN "wrappedDek" IS NULL THEN 'wrappedDek NULL' END
FROM "EncryptedBlob"
WHERE "cipherText" IS NULL 
   OR iv IS NULL 
   OR tag IS NULL 
   OR "wrappedDek" IS NULL;
```

## "MASTER_ENCRYPTION_KEY not set"

### Symptôme
```
Error: MASTER_ENCRYPTION_KEY environment variable not set
```

### Solution
```bash
# Vérifier .env
cat apps/backend/.env | grep MASTER_ENCRYPTION_KEY

# Si manquant, ajouter
echo 'MASTER_ENCRYPTION_KEY="your-minimum-32-character-secret-key"' >> apps/backend/.env

# Restart backend
```

## "Encrypted blob not found"

### Symptôme
Volume sans texte, textBlobId NULL

### Cause
- VolumeVersion créé sans texte
- textBlob supprimé par erreur

### Solution
```typescript
// Créer/mettre à jour le texte
const encrypted = encrypt("Volume text content");
const blob = await prisma.encryptedBlob.create({
  data: {
    ownerId: versionId,
    purpose: 'volume_text',
    ...encrypted
  }
});

await prisma.volumeVersion.update({
  where: { id: versionId },
  data: { textBlobId: blob.id }
});
```
```

## Templates de Documentation

### API Endpoint Template
```markdown
### [METHOD] /api/[path]

[Brief description]

**Authentication**: Required/Optional/None

**Request Parameters**: (if any)
- `param1` (type) - Description

**Request Body**: (if applicable)
```json
{
  "field": "value"
}
```

**Response [code]**:
```json
{
  "success": true,
  "data": {}
}
```

**Errors**:
- `code ERROR_CODE` - Description

**Example**:
```bash
curl command
```
```

### Module Template
```markdown
# [Module Name]

## Description
[What this module does]

## Structure
- service.ts
- controller.ts
- routes.ts
- schemas.ts

## Usage
[How to use]

## API Endpoints
[List endpoints]

## Database Schema
[Related models]

## Examples
[Code examples]
```

## Checklist Documentation

- [ ] Description claire et concise
- [ ] Exemples pratiques fournis
- [ ] Cas d'erreur documentés
- [ ] Types TypeScript inclus
- [ ] Diagrammes si nécessaire
- [ ] Liens vers ressources connexes
- [ ] À jour avec le code actuel
- [ ] Format markdown valide
- [ ] Code examples testés

## Best Practices

### ✅ Do
- Écrire pour l'utilisateur final
- Fournir exemples concrets
- Documenter les edge cases
- Inclure troubleshooting
- Maintenir à jour
- Utiliser diagrammes si utile

### ❌ Don't
- Jargon technique excessif
- Documentation obsolète
- Exemples qui ne fonctionnent pas
- Répéter le code sans explication
- Oublier les cas d'erreur
