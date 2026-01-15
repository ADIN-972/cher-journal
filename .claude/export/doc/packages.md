# Package Management & Dependencies

Guide générique pour gérer les packages et configurations `package.json` dans une architecture monorepo.

## Structure Monorepo (npm workspaces)

```
project-root/
  package.json (root workspace)
  apps/
    backend/
      package.json
    admin/
      package.json
    web/
      package.json
    mobile/
      package.json
    test/
      package.json
  packages/
    types/
      package.json
    config/
      package.json
    utils/
      package.json
```

## Root package.json

Configuration pour orchestrer les workspaces:

```json
{
  "name": "@generic-project/monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Generic Project Monorepo",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "install": "npm install",
    "dev": "npm run dev --workspaces",
    "dev:backend": "npm run dev --workspace=@generic-project/backend",
    "dev:admin": "npm run dev --workspace=@generic-project/admin",
    "dev:web": "npm run dev --workspace=@generic-project/web",
    "build": "npm run build --workspaces",
    "build:backend": "npm run build --workspace=@generic-project/backend",
    "build:admin": "npm run build --workspace=@generic-project/admin",
    "start": "npm run start --workspace=@generic-project/backend",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prettier": "^3.1.0",
    "eslint": "^8.56.0"
  }
}
```

## Backend package.json

Configuration pour app Node.js + Fastify + Prisma:

```json
{
  "name": "@generic-project/backend",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@generic-project/config": "*",
    "@generic-project/types": "*",
    "@fastify/cookie": "^9.3.1",
    "@fastify/cors": "^8.4.2",
    "@fastify/jwt": "^7.1.0",
    "@fastify/multipart": "^8.0.0",
    "@prisma/client": "^5.7.1",
    "fastify": "^4.25.2",
    "zod": "^3.22.4",
    "sharp": "^0.33.1",
    "stripe": "^14.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "prisma": "^5.7.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

## Admin (React) package.json

Configuration pour app React + Vite + TailwindCSS:

```json
{
  "name": "@generic-project/admin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "zustand": "^4.4.7",
    "axios": "^1.6.5",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.32"
  }
}
```

## Web (Reader) package.json

Configuration pour app React web lecteur:

```json
{
  "name": "@generic-project/web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

## Mobile (React Native) package.json

Configuration pour app Expo:

```json
{
  "name": "@generic-project/mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo": "^50.0.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "typescript": "^5.3.3"
  }
}
```

## Shared Packages (types, config, utils)

### packages/types/package.json

```json
{
  "name": "@generic-project/types",
  "version": "1.0.0",
  "main": "dist/index.d.ts",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### packages/config/package.json

```json
{
  "name": "@generic-project/config",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### packages/utils/package.json

```json
{
  "name": "@generic-project/utils",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

## Gestion des Versions

### Stratégie SemVer

- **MAJOR** (1.0.0): Changements incompatibles (breaking changes)
- **MINOR** (1.1.0): Nouvelles fonctionnalités rétro-compatibles
- **PATCH** (1.0.1): Corrections de bugs

### Bump des Versions

```bash
# Root
npm version major|minor|patch

# Workspace spécifique
npm version major|minor|patch --workspace=@generic-project/backend
```

## Mise à Jour des Dépendances

### Vérifier les dépendances obsolètes

```bash
npm outdated
npm outdated --workspace=@generic-project/backend
```

### Mettre à jour

```bash
# Patch uniquement (sûr)
npm update

# Minor+Patch (installer les nouvelles mineures)
npm upgrade

# Une dépendance spécifique
npm install package@latest
npm install package@latest --workspace=@generic-project/backend
```

### Audit de sécurité

```bash
npm audit
npm audit fix
npm audit fix --workspace=@generic-project/backend
```

## Installation et Setup

```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance dans tous les workspaces
npm install lodash --workspaces

# Installer une dépendance dans un workspace spécifique
npm install axios --workspace=@generic-project/backend

# Installer une dépendance de dev
npm install --save-dev typescript --workspaces

# Installer une dépendance locale (package interne)
npm install @generic-project/types --workspace=@generic-project/backend
```

## Bonnes Pratiques

### ✅ Do
- Centraliser les dépendances communes au root
- Utiliser des versions explicites pour libs critiques
- Vérifier l'audit de sécurité avant release
- Documenter les breaking changes
- Utiliser `npm workspaces` pour cohérence

### ❌ Don't
- Installer les mêmes dépendances dans plusieurs workspaces (utiliser root)
- Utiliser `npm install` directement dans un workspace (ne pas créer node_modules dupliqués)
- Ignorer les vulnérabilités de sécurité
- Installer des dépendances beta en production
- Mélanger npm, yarn, pnpm sans cohérence

## Troubleshooting

### `Cannot find module '@generic-project/types'`
→ Vérifier que le package est listé dans `package.json` du workspace
→ Vérifier que le package a `"main"` ou `"exports"` défini
→ Relancer `npm install`

### `ERESOLVE unable to resolve dependency tree`
→ Il y a un conflit de dépendances
→ Utiliser `npm install --legacy-peer-deps` temporairement
→ Mettre à jour les dépendances conflictuelles

### Les dépendances ne se mettent pas à jour
→ Supprimer `node_modules/` et `package-lock.json`
→ Relancer `npm install`

## Commandes Essentielles

```bash
# Info sur les workspaces
npm ls

# Listar les dépendances (arborescence)
npm ls --depth=0

# Nettoyer les dépendances inutilisées
npm prune

# Vérifier la cohérence
npm ls @generic-project/types
```
