# Scripts de Gestion API

Ce dossier contient les scripts automatisés pour la synchronisation, validation et audit de sécurité des API.

## Scripts Disponibles

### 1. sync-api.ts
**Commande :** `npm run api:sync`

Scanne tous les appels API frontend et vérifie qu'ils ont des endpoints backend correspondants.

**Fonctions exportées :**
- `scanFrontendCalls()` - Scan apps/admin, apps/web, apps/mobile
- `scanBackendRoutes()` - Scan apps/backend/src/modules
- `findMissingRoutes()` - Compare et détecte manquants
- `normalizePath()` - Normalise les paramètres pour comparaison
- `normalizeTemplatePath()` - Convertit `${var}` en `:__PARAM__`

**Détection :**
- Pattern `api.get|post|patch|delete('/path')`
- Pattern `fetch('/api/path')` avec détection de méthode HTTP
- Template literals `${variable}` convertis en paramètres

### 2. generate-routes.ts
**Commande :** `npm run api:generate`

Génère le code boilerplate pour les routes backend manquantes.

**Fonctions :**
- `parseRoutePath()` - Extrait module, feature, params
- `generateRouteName()` - Crée noms de méthodes (list, getById, etc.)
- `generateRouteCode()` - Produit snippets de code

**Templates générés :**
- Route Fastify avec preHandler et handler
- Méthode controller avec try/catch et error handling
- Méthode service avec TODO et NOT_IMPLEMENTED

### 3. api-inventory.ts ⚡ NOUVEAU
**Commande :** `npm run api:security`

Analyse complète de la sécurité et génération d'inventaire des API.

**Fonctions exportées :**
- `scanBackendEndpoints()` - Scan détaillé avec métadonnées
- `scanFrontendUsage()` - Match appels frontend avec endpoints
- `analyzeSecurityIssues()` - Détecte vulnérabilités

**Analyses de sécurité :**
1. **Missing Auth** - Endpoints publics non intentionnels
2. **Missing Admin Check** - Routes `/admin/*` sans requireAdmin
3. **Missing Validation** - Mutations sans schema Zod
4. **Parameter Mismatch** - Incohérence nombre de params
5. **Missing Body** - POST/PATCH/PUT sans body
6. **Unused Endpoints** - Routes définies mais jamais utilisées

**Rapports générés :**
- `docs/api-inventory.md` - Liste complète des endpoints avec usage
- `docs/api-security.md` - Vulnérabilités classées par sévérité

## Workflow d'Utilisation

### Développement d'une Feature

```bash
# 1. Développer frontend + backend
# ...

# 2. Vérifier synchronisation
npm run api:sync

# 3. Si routes manquent
npm run api:generate
# Copier-coller le code généré

# 4. Auditer sécurité
npm run api:security
# Corriger les issues critiques avant de commit
```

### Avant Chaque Commit

```bash
# Vérification rapide
npm run api:sync && npm run api:security
```

### Dans CI/CD

```yaml
- name: API Checks
  run: |
    npm run api:sync
    npm run api:security
```

## Interfaces TypeScript

### ApiCall
```typescript
interface ApiCall {
  method: string;        // HTTP method
  path: string;          // Normalized path avec :__PARAM__
  file: string;          // Fichier source
  line: number;          // Ligne dans le fichier
  params?: Record<string, string>;  // Params extraits
  hasBody?: boolean;     // true si POST/PATCH/PUT avec data
}
```

### BackendRoute
```typescript
interface BackendRoute {
  method: string;
  path: string;
  file: string;
  handler?: string;
  middleware?: string[];      // Liste des middleware
  requiresAuth?: boolean;     // requireAuth présent
  requiresAdmin?: boolean;    // requireAdmin présent
}
```

### ApiEndpoint
```typescript
interface ApiEndpoint {
  method: string;
  path: string;
  module: string;            // Module backend (auth, admin, etc.)
  feature: string;           // Feature (chapters, users, etc.)
  handler?: string;
  middleware: string[];
  requiresAuth: boolean;
  requiresAdmin: boolean;
  params: ParamInfo[];       // Détails des paramètres
  bodySchema?: string;       // Nom du schema Zod
  usedBy: UsageInfo[];       // Liste des appels frontend
  securityNotes?: string[];
}
```

### SecurityIssue
```typescript
interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;              // Type de vulnérabilité
  endpoint: string;          // Endpoint concerné
  description: string;
  recommendation: string;    // Comment corriger
  file: string;             // Fichier source
}
```

## Patterns Détectés

### Frontend (API Calls)

```typescript
// Pattern 1: api.METHOD
api.get('/admin/chapters')
api.post('/admin/chapters', data)
api.patch(`/admin/chapters/${id}`, data)

// Pattern 2: fetch
fetch('/api/admin/users', {
  method: 'POST',
  body: JSON.stringify(data)
})

// Template literals
api.get(`/admin/chapters/${chapterId}/volumes/${volumeId}`)
// → Converti en /admin/chapters/:__PARAM__/volumes/:__PARAM__
```

### Backend (Route Definitions)

```typescript
// Pattern détecté
app.get('/admin/chapters', {
  preHandler: requireAdmin,
  schema: { body: chapterSchema },
  handler: controller.list.bind(controller),
});

// Middleware array
app.post('/admin/chapters', {
  preHandler: [requireAdmin, validateUpload],
  handler: controller.create.bind(controller),
});
```

## Exit Codes

- **0** - Succès, aucun problème
- **1** - Problèmes détectés :
  - Routes manquantes (`api:sync`)
  - Issues critiques/high (`api:security`)

## Configuration

Aucune configuration externe nécessaire. Les scripts utilisent :
- Paths hardcodés : `apps/admin`, `apps/web`, `apps/mobile`, `apps/backend`
- Patterns regex pour détection
- Normalisation automatique des paths

## Maintenance

### Ajouter un Nouveau Pattern de Détection

Modifier `scanFrontendCalls()` dans `sync-api.ts` :

```typescript
// Exemple: détecter axios
const axiosMatches = [
  ...line.matchAll(/axios\.(get|post|patch|put|delete)\(['"`]([^'"`]+)['"`]/g)
];
```

### Ajouter un Nouveau Check de Sécurité

Modifier `analyzeSecurityIssues()` dans `api-inventory.ts` :

```typescript
// Exemple: vérifier rate limiting
if (endpoint.path.startsWith('/public/') && !endpoint.middleware?.includes('rateLimit')) {
  issues.push({
    severity: 'high',
    type: 'missing_rate_limit',
    endpoint: endpointStr,
    description: 'Public endpoint without rate limiting',
    recommendation: 'Add rate limit middleware',
    file: endpoint.file,
  });
}
```

## Dépendances

- **glob** (^10.3.10) - Scan de fichiers
- **tsx** (^4.7.0) - Exécution TypeScript
- Node.js built-ins : fs/promises, path

## Tests

Pas de tests unitaires actuellement. Validation manuelle via :

```bash
# Test avec projet réel
npm run api:sync
npm run api:security

# Vérifier rapports générés
cat docs/api-inventory.md
cat docs/api-security.md
```

## Ressources

- **Agent Sync** : `.claude/agents/api-sync-expert.md`
- **Agent Security** : `.claude/agents/api-security-expert.md`
- **Guide Workflow** : `docs/API-WORKFLOW.md`
- **Guide Sync** : `docs/API-SYNC.md`

## Support

Pour questions ou bugs :
1. Consulter les agents experts
2. Vérifier patterns dans code existant
3. Tester manuellement avec un petit projet
4. Demander review si nécessaire
