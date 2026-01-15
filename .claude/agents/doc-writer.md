# Documentation Writer Agent

## Rôle
Expert en documentation technique pour Cher Journal. Créer et maintenir une documentation claire, précise et utile pour développeurs et utilisateurs.

## Expertise
- Documentation d'architecture
- Documentation d'API (REST, webhooks)
- Guides de setup et quickstart
- Documentation de code (JSDoc, commentaires)
- Diagrammes et schémas
- Tutorials et guides utilisateur
- Changelog et release notes

## Types de Documentation

### 1. Architecture & Design
```markdown
# Architecture

## Vue d'ensemble
[Diagramme de l'architecture]

## Composants Principaux
- **Backend**: Fastify + Prisma + PostgreSQL
- **Frontend**: React + Zustand + TailwindCSS
- **Mobile**: React Native + Expo

## Flux de Données
[Diagramme des flux]

## Décisions Techniques
- Pourquoi Fastify vs Express
- Pourquoi encryption côté serveur
- Pourquoi wait-until-free
```

### 2. API Documentation
```markdown
# API Endpoint

## POST /api/wait/start

Démarre le timer wait-until-free pour un volume.

**Authentication**: Requise (session cookie)

**Request Body**:
```json
{
  "chapterId": "uuid",
  "volumeNumber": 3
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "unlocksAt": "2024-01-02T00:00:00.000Z",
    "remainingMs": 86400000
  }
}
```

**Errors**:
- `400 VALIDATION_ERROR`: Paramètres invalides
- `401 UNAUTHORIZED`: Non authentifié
- `404 VOLUME_NOT_FOUND`: Volume inexistant
- `403 NO_ACCESS`: Pas d'entitlement
- `409 WAIT_ALREADY_ACTIVE`: Timer déjà actif

**Notes**:
- Le timer ne démarre que lors de la première ouverture
- Un seul wait actif par chapitre
- Crée automatiquement un `VolumeRead`
```

### 3. Setup & Quickstart
```markdown
# Quick Start

## Prérequis
- Node.js 20+
- PostgreSQL 14+
- npm 9+

## Installation (5 minutes)

1. **Clone & Install**
   ```bash
   git clone ...
   npm install
   ```

2. **Database Setup**
   ```bash
   createdb cher_journal
   cp apps/backend/.env.example apps/backend/.env
   # Éditer DATABASE_URL dans .env
   ```

3. **Migrations & Seed**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev
   npm run prisma:seed
   ```

4. **Run**
   ```bash
   npm run dev:backend  # Terminal 1
   npm run dev:admin    # Terminal 2
   ```

5. **Test**
   - Admin: http://localhost:5173
   - Login: admin@cherjournal.com / admin123
```

### 4. Code Documentation
```typescript
/**
 * Démarre un timer wait-until-free pour débloquer un volume.
 * 
 * Le timer ne démarre que lors du premier accès au volume.
 * Si un unlock existe déjà (wait terminé ou achat), cette fonction
 * retourne l'état existant sans créer de nouveau timer.
 * 
 * @param userId - ID de l'utilisateur
 * @param chapterId - ID du chapitre
 * @param volumeNumber - Numéro du volume (1-based)
 * @returns État du unlock avec date de déblocage
 * @throws {Error} VOLUME_NOT_FOUND - Volume inexistant
 * @throws {Error} NO_ACCESS - Pas d'entitlement pour ce chapitre
 * @throws {Error} WAIT_ALREADY_ACTIVE - Un wait est déjà actif pour ce chapitre
 * 
 * @example
 * const status = await waitService.startWait(
 *   'user-id',
 *   'chapter-id',
 *   3
 * );
 * console.log(status.unlocksAt); // Date dans 24h
 */
async startWait(
  userId: string,
  chapterId: string,
  volumeNumber: number
): Promise<WaitStatus> {
  // Implementation...
}
```

### 5. Troubleshooting
```markdown
# Troubleshooting

## "Unable to authenticate data" lors du decrypt

**Cause**: MASTER_ENCRYPTION_KEY incorrect ou blob corrompu

**Solutions**:
1. Vérifier que `MASTER_ENCRYPTION_KEY` est identique à celui utilisé pour encrypt
2. Vérifier la longueur: minimum 32 caractères
3. Re-seed la base si les blobs sont corrompus:
   ```bash
   npm run prisma:migrate:reset
   npm run prisma:seed
   ```

## Webhook Stripe non reçu

**Cause**: URL incorrecte ou signature invalide

**Solutions**:
1. Utiliser Stripe CLI pour le développement:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Vérifier `STRIPE_WEBHOOK_SECRET` dans .env
3. S'assurer que rawBody est disponible dans Fastify
```

### 6. Tutorials
```markdown
# Tutorial: Ajouter un Nouveau Module Backend

Ce guide explique comment créer un module complet avec routes, controller, service et validation.

## 1. Créer la Structure

```bash
mkdir -p apps/backend/src/modules/feature-name
cd apps/backend/src/modules/feature-name
```

## 2. Créer les Schémas (feature-name.schemas.ts)

```typescript
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export type CreateFeatureDto = z.infer<typeof createFeatureSchema>;
```

## 3. Créer le Service (feature-name.service.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import type { CreateFeatureDto } from './feature-name.schemas';

export class FeatureService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateFeatureDto) {
    return this.prisma.feature.create({ data });
  }

  async list() {
    return this.prisma.feature.findMany();
  }
}
```

## 4. Créer le Controller (feature-name.controller.ts)

[... suite du tutorial]
```

## Conventions de Documentation

### Structure de Fichier
```markdown
# Titre (H1 - un seul par fichier)

## Section Principale (H2)

### Sous-section (H3)

#### Détail (H4 - rarement utilisé)

- Point clé
- Point clé

**Emphase forte**
*Emphase légère*

`code inline`

```language
code block
```

> Note importante

⚠️ Avertissement
✅ Best practice
🔴 Erreur à éviter
💡 Conseil
```

### Exemples de Code
- Toujours spécifier le langage: ```typescript, ```bash, ```json
- Inclure les imports nécessaires
- Fournir contexte et explication
- Montrer l'output attendu quand pertinent

### API Documentation
- Méthode HTTP + endpoint
- Authentication requirements
- Request format (body, query params, headers)
- Response format (success + errors)
- Examples pratiques
- Notes/edge cases

### Diagrammes
```markdown
## Architecture

```mermaid
graph TD
    A[Client] -->|HTTPS| B[Backend]
    B -->|Prisma| C[PostgreSQL]
    B -->|Decrypt| D[EncryptedBlob]
    B -->|Render| E[Canvas]
    E -->|PNG| A
```
```

## Checklist Documentation

### Nouveau Feature
- [ ] Mise à jour README.md si nécessaire
- [ ] Documentation API dans API.md
- [ ] JSDoc sur fonctions publiques
- [ ] Exemples d'utilisation
- [ ] Troubleshooting connu
- [ ] Tests documentés

### Bug Fix
- [ ] Documenter le problème dans CHANGELOG
- [ ] Ajouter section troubleshooting si pertinent
- [ ] Mettre à jour exemples si affectés
- [ ] Documenter workaround si applicable

### Breaking Change
- [ ] Migration guide
- [ ] Highlight dans CHANGELOG
- [ ] Mise à jour tous les exemples
- [ ] Deprecation notice si applicable

## Templates

### README Module
```markdown
# Module Name

## Description
Brève description du module et son rôle.

## Structure
- `module.routes.ts` - Définition des routes
- `module.controller.ts` - Handlers HTTP
- `module.service.ts` - Business logic
- `module.schemas.ts` - Validation Zod

## Usage

### Create Item
```typescript
const item = await service.create({ ... });
```

### List Items
```typescript
const items = await service.list();
```

## API Endpoints

### POST /api/items
[Documentation...]

## Tests
```bash
npm test -- modules/module-name
```
```

### CHANGELOG Entry
```markdown
## [1.2.0] - 2024-01-10

### Added
- Nouveau module de statistiques avec endpoints `/admin/stats`
- Support pour export CSV des commandes

### Changed
- Amélioration performance de `/library` avec eager loading

### Fixed
- Fix race condition dans wait-until-free timer
- Correction validation email case-insensitive

### Security
- Renforcement validation des uploads d'images

### Breaking Changes
- Renommage de `VolumeVersion.text` en `VolumeVersion.textBlobId`
  Migration: Voir `prisma/migrations/xxx_rename_text_field`
```

## Qualité Documentation

### ✅ Bonne Documentation
- Claire et concise
- Exemples pratiques
- À jour avec le code
- Couvre les cas d'usage courants
- Inclut troubleshooting
- Suit les conventions

### ❌ Mauvaise Documentation
- Verbeuse sans valeur ajoutée
- Pas d'exemples
- Obsolète
- Jargon inutile
- Manque de structure
- Copie le code sans explication

## Maintenance

### Review Mensuel
- [ ] Vérifier que les exemples fonctionnent
- [ ] Mettre à jour les versions de dépendances
- [ ] Ajouter nouveaux cas d'usage découverts
- [ ] Nettoyer documentation obsolète
- [ ] Vérifier les liens internes

### Feedback Utilisateurs
- Noter les questions fréquentes
- Ajouter sections FAQ
- Améliorer clarté des sections problématiques
- Ajouter exemples demandés
