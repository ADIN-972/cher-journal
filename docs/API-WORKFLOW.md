# Workflow de Développement avec Vérifications API

## Vue d'ensemble

Ce guide explique comment intégrer les vérifications API automatiques dans votre workflow de développement. Après chaque feature, vous devez **systématiquement** lancer les audits pour garantir la qualité et la sécurité.

## Workflow Standard

### 1. Développer la Feature

Implémentez votre feature normalement :

```typescript
// 1. Frontend - apps/admin/src/pages/MyFeature.tsx
const handleCreate = async (data) => {
  await api.post('/admin/my-resource', data);
};

// 2. Backend - apps/backend/src/modules/admin/my-resource/
// - my-resource.routes.ts
// - my-resource.controller.ts
// - my-resource.service.ts
// - my-resource.schemas.ts
```

### 2. Vérifier la Synchronisation

**Après avoir écrit TOUT le code de la feature :**

```bash
npm run api:sync
```

**Résultat attendu :**
```
✅ All frontend API calls have corresponding backend routes!
```

**Si des routes manquent :**
```bash
# Voir le code à générer
npm run api:generate

# Copier-coller dans les fichiers appropriés
# Implémenter la logique métier
```

### 3. Auditer la Sécurité

**Toujours exécuter après api:sync :**

```bash
npm run api:security
```

**Ce qui est vérifié :**
- ✅ Routes admin avec `requireAdmin`
- ✅ Mutations avec validation Zod
- ✅ Paramètres cohérents frontend/backend
- ✅ Pas d'endpoints publics non intentionnels
- ✅ Body présent pour POST/PATCH/PUT

**Résultats possibles :**

#### ✅ Aucun problème
```
✅ No critical security issues detected!
   Review docs/api-security.md for recommendations
```
→ **Vous pouvez continuer**

#### 🔴 Issues critiques
```
⚠️  SECURITY ISSUES DETECTED:
   🔴 Critical: 2
   
   Review docs/api-security.md for details
```
→ **BLOQUER : corriger avant de commit**

#### 🟠 Issues high/medium
```
⚠️  SECURITY ISSUES DETECTED:
   🟠 High: 3
   🟡 Medium: 5
```
→ **REVIEWER : corriger ou justifier**

### 4. Corriger les Issues

Ouvrez `docs/api-security.md` pour voir les détails :

```markdown
## 🔴 CRITICAL (2)

### 1. MISSING ADMIN CHECK

- **Endpoint**: `DELETE /admin/chapters/:id`
- **Description**: Admin endpoint does not require admin role
- **Recommendation**: Use requireAdmin middleware
```

**Correction :**

```typescript
// ❌ AVANT
app.delete('/admin/chapters/:id', {
  preHandler: requireAuth, // Pas assez restrictif !
  handler: controller.delete.bind(controller),
});

// ✅ APRÈS
app.delete('/admin/chapters/:id', {
  preHandler: requireAdmin, // ✅ Admin requis
  handler: controller.delete.bind(controller),
});
```

### 5. Re-vérifier

Après corrections :

```bash
npm run api:security
```

Répéter jusqu'à ce qu'il n'y ait plus d'issues critiques.

## Checklist Complète

### Avant de Committer

- [ ] Code feature écrit et testé
- [ ] `npm run api:sync` → ✅ Toutes les routes existent
- [ ] `npm run api:security` → ✅ Aucune issue critique
- [ ] Issues high/medium documentées ou corrigées
- [ ] Tests unitaires passent
- [ ] Code review demandée

### Avant de Merger

- [ ] Tous les checks CI/CD passent
- [ ] Security audit validé
- [ ] Documentation mise à jour
- [ ] Migration Prisma si nécessaire

## Patterns de Correction

### 1. Route Admin sans requireAdmin

**Issue :**
```
MISSING ADMIN CHECK
Endpoint: POST /admin/users/:id/promote
```

**Fix :**
```typescript
app.post('/admin/users/:id/promote', {
  preHandler: requireAdmin, // Changé de requireAuth
  handler: controller.promote.bind(controller),
});
```

### 2. Mutation sans Validation

**Issue :**
```
MISSING VALIDATION
Endpoint: PATCH /admin/chapters/:id
```

**Fix :**
```typescript
// 1. Créer le schema (chapters.schemas.ts)
export const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PUBLISHED']).optional(),
  isArchived: z.boolean().optional(),
});

// 2. Ajouter à la route
app.patch('/admin/chapters/:id', {
  preHandler: requireAdmin,
  schema: {
    body: updateChapterSchema,
  },
  handler: controller.update.bind(controller),
});
```

### 3. Paramètres Manquants

**Issue :**
```
PARAMETER MISMATCH
Expected 2 parameters but got 1
File: apps/admin/src/pages/Volumes.tsx:45
```

**Backend :**
```typescript
app.get('/admin/chapters/:chapterId/volumes/:volumeId', ...)
```

**Frontend (incorrecte) :**
```typescript
await api.get(`/admin/chapters/${chapterId}/volumes`);
// Manque volumeId !
```

**Fix :**
```typescript
await api.get(`/admin/chapters/${chapterId}/volumes/${volumeId}`);
```

### 4. Body Manquant

**Issue :**
```
MISSING BODY
Endpoint: POST /admin/chapters
Called without body
```

**Frontend (incorrecte) :**
```typescript
await api.post('/admin/chapters');
```

**Fix :**
```typescript
await api.post('/admin/chapters', {
  title: 'Mon Chapitre',
  description: 'Description...',
});
```

### 5. Endpoint Public Non Intentionnel

**Issue :**
```
MISSING AUTH
Endpoint: GET /admin/stats/revenue
```

**Fix :**
```typescript
app.get('/admin/stats/revenue', {
  preHandler: requireAdmin, // Ajout de l'auth
  handler: controller.getRevenue.bind(controller),
});
```

## Rapports Générés

### docs/api-inventory.md

**Contenu :**
- Liste TOUS les endpoints
- Métadonnées : auth, middleware, params, body
- Usage frontend avec fichiers et lignes
- Utile pour : documentation, onboarding, audit

**Exemple :**
```markdown
### POST /admin/chapters/:id/duplicate

- **Feature**: chapters
- **Handler**: controller.duplicate.bind
- **Authentication**: ✅ Required
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 2 location(s)
  - admin: apps/admin/src/pages/Chapters.tsx:198
  - admin: apps/admin/src/components/ChapterActions.tsx:45
```

### docs/api-security.md

**Contenu :**
- Issues de sécurité par sévérité
- Description, fichier, recommandation
- Utile pour : corriger vulnérabilités, audit sécurité

**Exemple :**
```markdown
## 🔴 CRITICAL (1)

### 1. MISSING ADMIN CHECK

- **Endpoint**: `DELETE /admin/users/:id`
- **File**: apps/backend/src/modules/admin/users/users.routes.ts
- **Description**: Admin endpoint does not require admin role
- **Recommendation**: Use requireAdmin middleware instead of requireAuth
```

## Intégration CI/CD

### GitHub Actions

Créer `.github/workflows/api-security.yml` :

```yaml
name: API Security Audit

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run API sync check
        run: npm run api:sync
      
      - name: Run security audit
        run: npm run api:security
        continue-on-error: true
      
      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: api-security-report
          path: docs/api-security.md
      
      - name: Check for critical issues
        run: |
          if grep -q "🔴" docs/api-security.md; then
            echo "❌ Critical security issues detected!"
            exit 1
          fi
```

### Git Hooks (Husky)

**Installation :**
```bash
npm install --save-dev husky
npx husky install
```

**Pre-commit :**
```bash
npx husky add .husky/pre-commit "npm run api:sync"
```

**Pre-push :**
```bash
npx husky add .husky/pre-push "npm run api:security"
```

## FAQ

### Quand lancer les vérifications ?

**Toujours :**
- ✅ Après avoir terminé une feature
- ✅ Avant de commit
- ✅ Avant de créer une PR
- ✅ Avant un déploiement

**Optionnel :**
- Pendant le développement (pour vérifier au fur et à mesure)
- Après un merge de main

### Que faire si api:sync échoue ?

1. Lire le rapport console
2. Identifier les routes manquantes
3. Lancer `npm run api:generate`
4. Copier le code généré
5. Implémenter la logique
6. Re-tester

### Que faire si api:security détecte des criticals ?

**STOP - NE PAS COMMIT**

1. Ouvrir `docs/api-security.md`
2. Lire chaque issue critique
3. Corriger immédiatement
4. Re-lancer `npm run api:security`
5. Continuer seulement quand résolu

### Puis-je ignorer les warnings medium/low ?

**Medium :** Recommandé de corriger, mais pas bloquant
**Low :** Nice-to-have, peut être corrigé plus tard

**Règle :** Jamais ignorer les criticals et highs

### Comment vérifier un seul endpoint ?

Les scripts scannent tout le projet. Pour un check manuel :

1. Chercher l'endpoint dans `docs/api-inventory.md`
2. Vérifier les métadonnées
3. Voir les issues associées dans `docs/api-security.md`

### Les rapports sont-ils versionnés ?

**Recommandation :**
- ❌ Ne PAS commit `docs/api-*.md` (ajoutez à `.gitignore`)
- ✅ Générer à chaque CI/CD run
- ✅ Archiver dans artifacts pour audit

```bash
# .gitignore
docs/api-inventory.md
docs/api-security.md
```

## Agents Experts

Consultez les agents pour plus de détails :

- **`.claude/agents/api-sync-expert.md`** - Synchronisation API
- **`.claude/agents/api-security-expert.md`** - Sécurité API

## Support

En cas de problème :
1. Lire les rapports générés
2. Consulter les agents experts
3. Vérifier les patterns dans les features existantes
4. Demander une review si nécessaire

**Principe de base :** La sécurité d'abord, toujours.
