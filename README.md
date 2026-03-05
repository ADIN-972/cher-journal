# Cher Journal

Plateforme de lecture d'histoires avec système de monétisation, perspectives narrateur/protagoniste, et mécanisme wait-until-free.

> 📋 **[GLOBAL TODO - Liste complète des fonctionnalités à implémenter](./docs/GLOBAL-TODO.md)**

## 🏗️ Architecture

Monorepo structure:
- `apps/backend` - API Node.js + Fastify + Prisma + PostgreSQL
- `apps/admin` - Interface d'administration React + TailwindCSS
- `apps/web` - Application web lecteur React + TailwindCSS
- `apps/mobile` - Application mobile React Native
- `apps/test` - Tests d'intégration
- `packages/` - Packages partagés (types, config, utils, ui, etc.)

## 🚀 Installation

### Prérequis

- Node.js >= 20.0.0
- PostgreSQL >= 14
- npm >= 10.0.0

### Étapes

1. **Cloner et installer les dépendances**

```bash
npm install
```

2. **Configuration de la base de données**

Créer une base de données PostgreSQL:

```sql
CREATE DATABASE cher_journal;
```

3. **Variables d'environnement**

Copier le fichier `.env.example` dans `apps/backend`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Éditer `apps/backend/.env` avec vos valeurs:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cher_journal
MASTER_ENCRYPTION_KEY=your-32-byte-key-here-change-in-prod
SESSION_SECRET=your-session-secret-here
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

⚠️ **IMPORTANT**: En production, générez des clés sécurisées:
- `MASTER_ENCRYPTION_KEY`: 32 caractères minimum (pour chiffrement AES-256)
- `SESSION_SECRET`: chaîne aléatoire longue et complexe

4. **Générer le client Prisma**

```bash
npm run prisma:generate
```

5. **Exécuter les migrations**

```bash
npm run prisma:migrate:dev
```

6. **Seed la base de données**

```bash
npm run prisma:seed
```

Cela créera:
- **Admin**: admin@cherjournal.com / admin123
- **User**: user@example.com / user123
- 2 chapitres avec volumes
- Entitlements de démo
- Unlock wait de démo

## 🎯 Lancer l'application

### Backend (API)

```bash
npm run dev:backend
```

Le serveur démarre sur `http://localhost:5000`

Endpoints disponibles avec ET sans préfixe `/api`:
- `/auth/register`, `/auth/login`, `/auth/logout`, `/me`
- `/library`, `/chapters`, `/chapters/:id`
- `/wait/start`, `/wait/status`, `/wait/active`
- `/reader/volume-version`, `/reader/volume-versions/:id/render`
- `/stripe/create-checkout-session`, `/stripe/webhook`
- `/admin/*` (requiert rôle ADMIN)

### Admin

```bash
npm run dev:admin
```

Interface admin sur `http://localhost:5174`

Connectez-vous avec:
- Email: `admin@cherjournal.com`
- Password: `admin123`

### Web (Lecteur)

```bash
npm run dev:web
```

Application lecteur sur `http://localhost:5173`

### Mobile

```bash
npm run dev:mobile
```

## 📚 Fonctionnalités clés

### 🔐 Authentification
- Auth par session cookie httpOnly (pas de localStorage)
- Protection brute force
- Middleware `requireAuth` et `requireAdmin`

### 🔒 Chiffrement des textes
- Chiffrement applicatif avec AES-256-GCM
- Envelope encryption (KEK + DEK)
- Texte JAMAIS envoyé en clair au client
- Rendu côté serveur en image PNG/WEBP

### ⏱️ Wait-Until-Free
- Timer déclenché uniquement à l'ouverture réelle du volume
- Un seul timer actif par chapitre
- Unlock automatique après expiration
- Endpoints: `/wait/start`, `/wait/status`, `/wait/active`

### 💳 Monétisation Stripe
- Checkout Stripe pour achats
- Webhooks avec vérification signature
- Idempotence via `webhook_events`
- Attribution droits UNIQUEMENT via webhooks
- Types: CHAPTER, PREORDER, BUNDLE, COLORING, VERSION_PACK

### 📖 Perspectives
- NARRATOR: perspective narrateur (inclus dans BASE)
- PROTAGONIST: perspective protagoniste (nécessite ALL)
- Entitlements avec scope BASE ou ALL

### 🎨 Assets & Pages
- Upload sécurisé d'images (validation type/taille)
- ChapterAssets: IMAGE, COLORING_PAGE
- VersionAssets: association assets + ordre pour chaque version

### 👥 Admin
- Dashboard avec KPIs
- CRUD Chapitres, Volumes, VolumeVersions
- Gestion Assets (upload/delete)
- Gestion Pages (VersionAsset + reorder)
- Users, Orders, Entitlements
- Bootstrap volumes automatique
- **📅 Système de Publication**
  - Statuts de volumes (DRAFT, IN_PROGRESS, PUBLISHED)
  - Programmation flexible des publications
  - Calendrier de publication groupé par chapitre
  - Publication automatique via cron
  - Contrôle d'accès lecteur basé sur les dates

## 🗂️ Modèle de données

Voir `apps/backend/prisma/schema.prisma` pour le schéma complet.

Entités principales:
- **User**: utilisateurs (USER/ADMIN)
- **Session**: sessions authentification
- **Chapter**: chapitres d'histoires
- **Volume**: volumes d'un chapitre
- **VolumeVersion**: versions (NARRATOR/PROTAGONIST)
- **VersionAsset**: pages/images d'une version
- **ChapterAsset**: assets (images, coloring pages)
- **Order**: commandes Stripe
- **Entitlement**: droits d'accès utilisateur
- **Unlock**: unlocks wait-until-free
- **VolumeRead**: tracking lecture
- **EncryptedBlob**: textes chiffrés
- **WebhookEvent**: idempotence webhooks

## 🧪 Tests

```bash
npm run test
```

Tests couvrant:
- Auth (register, login, session)
- Webhook idempotence
- Wait-until-free logic
- Entitlements
- Encryption/decryption

### Tests du Système de Publication

Scripts de test dédiés pour le système de publication:

```bash
# Tests automatiques (recommandé)
cd docs
.\run-all-tests.ps1  # Windows
./run-all-tests.sh   # Linux/Mac

# Tests individuels
npx tsx test-cron.ts           # Test publication automatique
npx tsx test-reader-access.ts  # Test accès lecteur
```

**Documentation complète:**
- [docs/QUICK-START-TESTS.md](docs/QUICK-START-TESTS.md) - Guide rapide de test
- [docs/TEST-COMPLETE-GUIDE.md](docs/TEST-COMPLETE-GUIDE.md) - Tests détaillés (15 tests)
- [docs/INDEX-DOCUMENTATION.md](docs/INDEX-DOCUMENTATION.md) - Index de toute la documentation

## 📦 Scripts utiles

```bash
# Installation complète
npm install

# Développement (tous les apps)
npm run dev

# Build production
npm run build

# Prisma
npm run prisma:generate      # Générer client Prisma
npm run prisma:migrate       # Exécuter migrations (prod)
npm run prisma:migrate:dev   # Créer + exécuter migrations (dev)
npm run prisma:seed          # Seed base de données
npm run prisma:studio        # Interface Prisma Studio
```

## 🔧 Configuration avancée

### Durée du Wait-Until-Free

Par défaut: 24h (86400000 ms)

Modifier dans `.env`:
```env
WAIT_DURATION_MS=3600000  # 1 heure
```

### Stripe Configuration

1. Obtenir clés test depuis [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Configurer webhook endpoint: `https://your-domain.com/api/stripe/webhook`
3. Sélectionner événements: `checkout.session.completed`, `payment_intent.succeeded`
4. Copier le webhook secret dans `.env`

### Upload Storage

Développement: fichiers locaux dans `./uploads`

Production: ajouter abstraction S3/R2 dans `apps/backend/src/modules/admin/assets/assets.service.ts`

## 🛡️ Sécurité

- ✅ CORS strict avec credentials
- ✅ Helmet (CSP, XSS protection)
- ✅ Rate limiting
- ✅ Validation inputs (Zod)
- ✅ Pas de concat SQL (Prisma uniquement)
- ✅ Session httpOnly cookies
- ✅ Chiffrement AES-256-GCM
- ✅ Webhook signature verification
- ✅ Upload validation (type, size)
- ✅ Audit logs (à implémenter)

## 🌍 RGPD

- Privacy by design
- Pas de données bancaires stockées (Stripe hosted)
- Pseudonymisation usage
- Endpoints export/suppression compte (à implémenter dans profil user)

## 📝 Convention modules backend

Chaque module DOIT contenir:
- `.routes.ts` - Définition routes Fastify
- `.controller.ts` - Handlers requêtes
- `.service.ts` - Logique métier
- `.schemas.ts` - Validation Zod

## 🎨 UI/Design

**Admin**: Inspiré AdminLTE
- Sidebar responsive (collapse en icônes)
- Drawer right pour create/edit
- Tables avec tri/sélection
- Modals confirmation

**Web/Mobile**: Maison d'édition moderne
- Typographie élégante
- Réglages accessibilité (taille/espacement)
- Transitions fluides
- Navigation intuitive

## 🐛 Dépannage

### Erreur migration Prisma

```bash
npm run prisma:migrate:dev -- --name init
```

### Erreur connexion PostgreSQL

Vérifier:
1. PostgreSQL est démarré
2. `DATABASE_URL` dans `.env` est correcte
3. Base de données existe

### Upload échoue

Vérifier:
1. Dossier `./uploads` existe et est accessible en écriture
2. `MAX_UPLOAD_SIZE` n'est pas dépassé

## 📄 Licence

Propriétaire - Tous droits réservés

## 👨‍💻 Support

Pour questions ou problèmes: ouvrir une issue sur le repo.

---

**Bon développement ! 🚀**
