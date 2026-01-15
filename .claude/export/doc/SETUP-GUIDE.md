# Guide Pratique : Intégration Package Management dans Votre Projet

Ce guide vous aide à intégrer complètement la gestion des packages dans votre monorepo Generic Project.

---

## ✅ Checklist d'Implémentation

### Phase 1: Setup de Base
- [ ] Examiner structure actuelle (root + apps + packages + prisma)
- [ ] Lire `doc/packages.md` pour comprendre les concepts
- [ ] Consulter `doc/packages-templates.md` pour les patterns

### Phase 2: Configuration Root
- [ ] Créer/mettre à jour root `package.json`
- [ ] Configurer `"workspaces"` (apps/*, packages/*)
- [ ] Ajouter scripts globaux (dev, build, test, lint)
- [ ] Installer dev dependencies partagées (TypeScript, eslint, prettier)
- [ ] Committer `package-lock.json`

### Phase 3: Configuration Apps
- [ ] Créer `package.json` pour chaque app (backend, admin, web, mobile)
- [ ] Ajouter dépendances spécifiques à chaque app
- [ ] Ajouter scripts pour build/dev/start
- [ ] Vérifier que imports internes utilisent @scope/package

### Phase 4: Configuration Packages
- [ ] Créer `package.json` pour types, config, utils
- [ ] Ajouter `"main"` et `"types"` fields
- [ ] Build scripts si TypeScript
- [ ] Vérifier que apps peuvent importer avec @scope/package

### Phase 5: Validation
- [ ] Exécuter `npm install` (clean install)
- [ ] Exécuter `npm run build --workspaces`
- [ ] Exécuter `npm run dev --workspaces` (vérifier startup)
- [ ] Exécuter `npm audit` (vérifier sécurité)
- [ ] Tester imports internes (npm ls)

---

## 📋 Tâches Courantes

### Installation Initiale (Nouveau Projet)

```bash
# 1. Setup structure
mkdir apps packages

# 2. Créer root package.json (copier du template)
# Utiliser: doc/packages-templates.md → Root package.json

# 3. Installer
npm install

# 4. Vérifier
npm ls --depth=0
```

### Ajouter une Nouvelle App

```bash
# 1. Créer dossier
mkdir apps/my-new-app
cd apps/my-new-app

# 2. Copier package.json du template approprié
# Utiliser: doc/packages-templates.md → choisir type (backend/frontend/mobile)

# 3. Installer au root
cd ../..
npm install

# 4. Valider
npm run build --workspace=@generic-project/my-new-app
```

### Ajouter une Dépendance

```bash
# Global (root dev tools)
npm install --save-dev typescript

# À un workspace spécifique
npm install express --workspace=@generic-project/backend
npm install react --workspace=@generic-project/admin

# À tous les workspaces frontend
npm install zustand --workspaces
```

### Mettre à Jour Dépendances

```bash
# Vérifier obsolètes
npm outdated
npm outdated --workspace=@generic-project/backend

# Mettre à jour (sûr - patch + minor)
npm update
npm update --workspace=@generic-project/backend

# Mettre à jour une dépendance spécifique
npm install typescript@latest --save-dev

# Sécurité
npm audit
npm audit fix
```

---

## 🔍 Diagnostic

### Structure Workspaces
```bash
npm ls --depth=0
```
Devrait afficher:
```
project-name
├── @generic-project/backend
├── @generic-project/admin
├── @generic-project/web
├── @generic-project/mobile
├── @generic-project/test
├── @generic-project/types
├── @generic-project/config
└── @generic-project/utils
```

### Vérifier Import d'une Dépendance Interne
```bash
# Types disponibles globalement
npm ls @generic-project/types

# Devrait montrer: @generic-project/types@1.0.0 (ou version)
```

### Verifier Build Global
```bash
npm run build --workspaces

# Devrait compiler sans erreurs tous les packages
```

---

## 🛠️ Scripts Recommandés (Root package.json)

### Scripts Essentiels
```json
{
  "scripts": {
    "install": "npm install",
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces --if-present",
    "type-check": "npm run type-check --workspaces --if-present",
    "clean": "npm run clean --workspaces && rm -rf node_modules package-lock.json"
  }
}
```

### Scripts Sélectifs (Pour Dev)
```json
{
  "scripts": {
    "dev:backend": "npm run dev --workspace=@generic-project/backend",
    "dev:admin": "npm run dev --workspace=@generic-project/admin",
    "dev:web": "npm run dev --workspace=@generic-project/web",
    "build:backend": "npm run build --workspace=@generic-project/backend",
    "build:all": "npm run build --workspaces"
  }
}
```

### Scripts Sécurité & Maintenance
```json
{
  "scripts": {
    "audit": "npm audit --workspaces",
    "audit:fix": "npm audit fix --workspaces",
    "outdated": "npm outdated",
    "dedupe": "npm dedupe",
    "prune": "npm prune --workspaces"
  }
}
```

---

## 🚨 Problèmes Courants et Solutions

### ❌ Error: Cannot find module '@generic-project/types'

**Causes possibles:**
1. Package n'existe pas dans `packages/`
2. Workspace n'est pas déclaré dans root `package.json`
3. `npm install` n'a pas été exécuté

**Solutions:**
```bash
# 1. Vérifier que le package existe
ls packages/types/package.json

# 2. Vérifier workspace déclaration
cat package.json | grep -A 5 '"workspaces"'

# 3. Réinstaller
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error: ERESOLVE unable to resolve dependency tree

**Cause:** Conflit de dépendances (versions incompatibles)

**Solutions:**
```bash
# Option 1: Temporaire (quick fix)
npm install --legacy-peer-deps

# Option 2: Identifier le conflit
npm ls

# Option 3: Mettre à jour les packages conflictuels
npm install package1@latest package2@latest
```

### ❌ npm ERR! peer dep missing

**Cause:** Une dépendance peer n'est pas installée

**Solutions:**
```bash
# Installer la peer dep manquante
npm install missing-peer-package

# Ou ajouter au package.json de la dépendance
```

### ❌ Huge node_modules (plusieurs GB)

**Causes:** Dépendances dupliquées, packages non utilisées

**Solutions:**
```bash
# Deduplicate
npm dedupe

# Prune unused
npm prune

# Vérifier duplicates
npm ls | grep -i duplicated

# Nuclear option (clean)
rm -rf node_modules
npm clean-install
```

---

## 📚 Templates Quick Copy

### Root package.json Minimal
```bash
# Copier de: doc/packages-templates.md
# Section: Structure Minimale Root package.json
```

### Backend Complet
```bash
# Copier de: doc/packages-templates.md
# Section: Backend (Node.js + Fastify + Prisma) - Complet
```

### Frontend React
```bash
# Copier de: doc/packages-templates.md
# Section: Admin (React + Vite + TailwindCSS) - Complet
```

### Types Package
```bash
# Copier de: doc/packages-templates.md
# Section: Package Interne - Types (packages/types)
```

---

## 🔄 Workflow Continu

### Quotidien
```bash
# Start dev
npm run dev

# Build check (optionnel)
npm run build --workspaces
```

### Weekly
```bash
# Check for updates
npm outdated

# Audit security
npm audit

# If issues found
npm audit fix
npm update
```

### Before Release
```bash
# Full check
npm run build --workspaces
npm run test --workspaces
npm audit
npm ls

# Bump versions if needed
npm version major|minor|patch
```

---

## 🎯 Success Criteria

Vous pouvez considérer que votre setup est **complet et correct** si:

✅ `npm install` complète sans erreurs  
✅ `npm ls --depth=0` affiche tous vos workspaces  
✅ `npm run build --workspaces` compile tout sans erreurs  
✅ `npm run dev --workspaces` ou `npm run dev:backend` démarre les apps  
✅ `npm audit` montre 0 vulnérabilités critiques  
✅ Apps peuvent importer `@generic-project/types`, `@generic-project/config`, etc.  
✅ `node_modules/` < 2GB (raisonnable pour monorepo)  

---

## 🔗 Ressources

- **Guide Complet**: [doc/packages.md](./doc/packages.md)
- **Templates**: [doc/packages-templates.md](./doc/packages-templates.md)
- **Agent Expert**: [agents/dependency-manager.md](./agents/dependency-manager.md)
- **Skill Packages**: [skills/packages/SKILL.md](./skills/packages/SKILL.md)
- **Index Agents/Skills**: [AGENTS-SKILLS.md](./AGENTS-SKILLS.md)

---

## 💡 Tips

1. **Gardez package-lock.json en sync** - Committer après chaque `npm install`
2. **Use `--workspaces` pour cohérence** - Évite les installations fragmentées
3. **Centralise les dev tools au root** - TypeScript, ESLint, Prettier une seule fois
4. **Vérifiez les peer deps** - Surtout pour les libs complexes
5. **Documentez vos patterns** - Chaque projet a des nuances uniques
