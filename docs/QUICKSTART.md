# 🚀 Quick Start Guide - Cher Journal

## Installation rapide (5 minutes)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer PostgreSQL

Créer la base de données:

```sql
CREATE DATABASE cher_journal;
```

### 3. Configuration environnement

Copier le fichier `.env.example`:

```bash
copy apps\backend\.env.example apps\backend\.env
```

**Modifier au minimum** dans `apps\backend\.env`:

```env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/cher_journal
```

Les autres valeurs par défaut fonctionnent pour le développement.

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate:dev

# Insérer les données de test
npm run prisma:seed
```

### 5. Lancer l'application

Ouvrir **3 terminaux** :

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
→ API disponible sur http://localhost:3000

**Terminal 2 - Admin:**
```bash
npm run dev:admin
```
→ Admin disponible sur http://localhost:5174

**Terminal 3 - Web (optionnel):**
```bash
npm run dev:web
```
→ Web disponible sur http://localhost:5173

## 🔑 Identifiants de test

### Admin
- **URL**: http://localhost:5174
- **Email**: admin@cherjournal.com
- **Mot de passe**: admin123

### User
- **URL**: http://localhost:5173
- **Email**: user@example.com
- **Mot de passe**: user123

## ✅ Vérifications

### Backend est lancé ?
Ouvrir http://localhost:3000/health dans le navigateur.

Devrait afficher:
```json
{"status":"ok","timestamp":"..."}
```

### Prisma Studio (optionnel)
Pour explorer la base de données:

```bash
npm run prisma:studio
```

Ouvre une interface web sur http://localhost:5555

## 📋 Fonctionnalités disponibles après seed

✅ 2 chapitres créés:
- "Les Ombres du Passé" (PUBLISHED, 10 volumes)
- "Le Réveil des Étoiles" (IN_PROGRESS, 5 volumes)

✅ Chaque volume a 2 versions:
- NARRATOR (narrateur)
- PROTAGONIST (protagoniste)

✅ Textes chiffrés dans la base

✅ Admin a accès complet (ALL scope)

✅ User a accès partiel:
- Chapter 1, volumes 1-5, BASE scope (narrateur seulement)
- Wait actif sur volume 3 (expire dans 24h)

## 🧪 Tester les fonctionnalités

### 1. Admin - Dashboard
1. Se connecter sur http://localhost:5174
2. Voir les statistiques: 2 users, 2 chapitres

### 2. Admin - Gérer chapitres
1. Cliquer sur "Chapitres" dans le menu
2. Voir la liste des 2 chapitres

### 3. API - Test auth

**PowerShell:**
```powershell
# Login
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"user@example.com","password":"user123"}' `
  -SessionVariable session

# Voir profil
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
  -WebSession $session
```

### 4. API - Test library

```powershell
# Bibliothèque user
Invoke-RestMethod -Uri "http://localhost:3000/api/library" `
  -WebSession $session
```

### 5. API - Test wait-until-free

```powershell
# Status du wait actif
Invoke-RestMethod -Uri "http://localhost:3000/api/wait/active" `
  -WebSession $session
```

## 🛠️ Troubleshooting

### Erreur "Cannot find module"
```bash
npm install
npm run prisma:generate
```

### Erreur connexion PostgreSQL
Vérifier:
1. PostgreSQL est démarré
2. DATABASE_URL correcte dans .env
3. Base `cher_journal` existe

```bash
# Vérifier connexion
psql -U postgres -d cher_journal
```

### Port déjà utilisé
Modifier dans les fichiers:
- Backend: `apps/backend/.env` → `PORT=3001`
- Admin: `apps/admin/vite.config.ts` → `port: 5175`
- Web: `apps/web/vite.config.ts` → `port: 5174`

### Canvas erreur (Windows)
Si erreur avec le package `canvas`, installer les dépendances:

Télécharger et installer [GTK+ for Windows](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases)

Ou utiliser une alternative sans canvas (désactiver le rendu image temporairement).

## 📖 Prochaines étapes

1. ✅ Explorer l'interface admin
2. ✅ Tester les APIs avec Postman/curl
3. ✅ Lire le README.md complet
4. ✅ Configurer Stripe (clés test)
5. ✅ Développer les fonctionnalités avancées

## 📚 Documentation

- **README complet**: `README.md`
- **Architecture**: Voir section "Architecture" dans README
- **API Endpoints**: Voir section "Lancer l'application" dans README
- **Modèle de données**: `apps/backend/prisma/schema.prisma`

## 💡 Astuces

### Réinitialiser la base de données

```bash
npm run prisma:migrate:dev -- --name reset
npm run prisma:seed
```

### Changer les identifiants de seed

Modifier dans `apps/backend/.env`:
```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=MonMotDePasseSecurise123!
```

Puis relancer le seed.

### Activer les logs SQL

Dans `apps/backend/src/lib/prisma.ts`, décommenter:
```typescript
log: ['query', 'error', 'warn']
```

---

**Bon développement ! 🎉**
