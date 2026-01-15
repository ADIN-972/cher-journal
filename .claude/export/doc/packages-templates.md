# Configuration de package.json Pratique

Modèles et patterns pour configurer `package.json` dans une architecture monorepo Generic Project.

## Structure Minimale Root package.json

```json
{
  "name": "@generic-project/monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Generic Project Monorepo",
  "author": "Your Team",
  "license": "MIT",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "install": "npm install",
    "dev": "npm run dev --workspaces",
    "dev:backend": "npm run dev --workspace=@generic-project/backend",
    "dev:admin": "npm run dev --workspace=@generic-project/admin",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "test:packages": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "type-check": "npm run type-check --workspaces --if-present",
    "clean": "npm run clean --workspaces && rm -rf node_modules package-lock.json",
    "audit": "npm audit --workspaces",
    "audit:fix": "npm audit fix --workspaces",
    "update": "npm update --workspaces",
    "outdated": "npm outdated"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prettier": "^3.1.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

## Backend (Node.js + Fastify + Prisma) - Complet

```json
{
  "name": "@generic-project/backend",
  "version": "1.0.0",
  "description": "Generic Project Backend API",
  "main": "dist/index.js",
  "type": "commonjs",
  "author": "Your Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "@generic-project/config": "*",
    "@generic-project/types": "*",
    "@fastify/cookie": "^9.3.1",
    "@fastify/cors": "^8.4.2",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^7.1.0",
    "@fastify/multipart": "^8.0.0",
    "@fastify/rate-limit": "^9.0.1",
    "@prisma/client": "^5.7.1",
    "fastify": "^4.25.2",
    "zod": "^3.22.4",
    "sharp": "^0.33.1",
    "stripe": "^14.7.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.0",
    "prisma": "^5.7.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

## Admin (React + Vite + TailwindCSS) - Complet

```json
{
  "name": "@generic-project/admin",
  "version": "1.0.0",
  "description": "Generic Project Admin Dashboard",
  "type": "module",
  "author": "Your Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:analyze": "vite build --analyze",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@generic-project/types": "*",
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
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

## Web (React Reader) - Complet

```json
{
  "name": "@generic-project/web",
  "version": "1.0.0",
  "description": "Generic Project Reader Web App",
  "type": "module",
  "author": "Your Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src"
  },
  "dependencies": {
    "@generic-project/types": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1"
  }
}
```

## Mobile (Expo React Native) - Complet

```json
{
  "name": "@generic-project/mobile",
  "version": "1.0.0",
  "description": "Generic Project Mobile App",
  "main": "node_modules/expo/AppEntry.js",
  "author": "Your Team",
  "license": "MIT",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject",
    "test": "jest --coverage"
  },
  "dependencies": {
    "expo": "^50.0.0",
    "expo-constants": "^15.4.2",
    "expo-linking": "^6.2.2",
    "expo-status-bar": "^1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@babel/core": "^7.23.5",
    "@types/jest": "^29.5.8",
    "@types/react": "^18.2.43",
    "jest": "^29.7.0",
    "typescript": "^5.3.3"
  }
}
```

## Package Interne - Types (packages/types)

```json
{
  "name": "@generic-project/types",
  "version": "1.0.0",
  "description": "Generic Project Shared Types",
  "main": "dist/index.d.ts",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

## Package Interne - Config (packages/config)

```json
{
  "name": "@generic-project/config",
  "version": "1.0.0",
  "description": "Generic Project Configuration Management",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

## Package Interne - Utils (packages/utils)

```json
{
  "name": "@generic-project/utils",
  "version": "1.0.0",
  "description": "Generic Project Shared Utilities",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./logger": "./dist/logger.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

## Test (Integration Tests) - Complet

```json
{
  "name": "@generic-project/test",
  "version": "1.0.0",
  "description": "Generic Project Integration Tests",
  "private": true,
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config jest.config.e2e.js"
  },
  "devDependencies": {
    "@types/jest": "^29.5.8",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

## Patterns Importants

### ✅ Bonnes Pratiques

1. **Utiliser @scope/package-name** pour les packages internes:
   ```json
   "dependencies": {
     "@generic-project/config": "*",
     "@generic-project/types": "*"
   }
   ```

2. **Centraliser au root** les dev tools:
   ```json
   // Root package.json
   "devDependencies": {
     "typescript": "^5.3.3",
     "prettier": "^3.1.0",
     "eslint": "^8.56.0"
   }
   ```

3. **Utiliser `--workspaces` et `-w`** pour les commandes globales:
   ```json
   "scripts": {
     "build": "npm run build --workspaces",
     "test": "npm run test --workspaces"
   }
   ```

4. **Version en sync** pour packages internes critiques:
   ```json
   "dependencies": {
     "@generic-project/types": "*"  // "*" = latest from workspace
   }
   ```

### ❌ À Éviter

1. **Pas de duplication** de dépendances:
   ```json
   // ❌ Non - ne pas installer TypeScript partout
   // ✅ Oui - installer au root only
   ```

2. **Pas de paths relatifs** pour packages internes:
   ```json
   // ❌ "../../packages/types"
   // ✅ "@generic-project/types": "*"
   ```

3. **Pas de version spécifique** pour packages internes:
   ```json
   // ❌ "@generic-project/types": "1.0.0"
   // ✅ "@generic-project/types": "*"
   ```

## Commandes Utiles

```bash
# Vérifier la structure workspaces
npm ls --depth=0

# Installer globalement
npm install

# Installer dans un workspace
npm install package --workspace=@generic-project/backend
npm install -D typescript --workspaces

# Exécuter script dans tous les workspaces
npm run build --workspaces

# Vérifier les dépendances obsolètes
npm outdated
npm outdated --workspace=@generic-project/backend

# Sécurité
npm audit
npm audit fix --workspace=@generic-project/backend

# Nettoyer
npm prune
npm dedupe
```
