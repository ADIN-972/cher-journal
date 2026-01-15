# API Synchronization & Security Tools

## Vue d'ensemble

Suite complète d'outils pour maintenir la cohérence et la sécurité entre les appels API frontend et les endpoints backend.

**🚀 Voir aussi :** [API-WORKFLOW.md](API-WORKFLOW.md) pour le guide complet d'utilisation

## Outils Disponibles

### 1. `npm run api:sync` - Vérification de Synchronisation

Scanne toutes les applications frontend (admin, web, mobile) et compare avec les routes backend existantes.

**Sortie :**
- ✅ Nombre d'appels frontend par app
- ✅ Nombre de routes backend
- ❌ Routes manquantes (utilisées en frontend mais absentes du backend)
- ⚠️ Routes potentiellement inutilisées (définies en backend mais jamais appelées)

### 2. `npm run api:generate` - Génération de Code

Génère automatiquement le code boilerplate pour les routes manquantes.

**Sortie :**
- Code pour `.routes.ts`
- Code pour `.controller.ts`
- Code pour `.service.ts`

### 3. `npm run api:security` - Audit de Sécurité ⚡ NOUVEAU

Analyse complète de la sécurité des API avec génération de rapports.

**Vérifie :**
- ✅ Routes admin avec `requireAdmin`
- ✅ Mutations avec validation Zod
- ✅ Paramètres cohérents frontend/backend
- ✅ Pas d'endpoints publics non intentionnels
- ✅ Body présent pour POST/PATCH/PUT

**Génère :**
- `docs/api-inventory.md` - Inventaire complet de tous les endpoints
- `docs/api-security.md` - Rapport des vulnérabilités détecté

**Exit codes :**
- `0` - Aucune issue critique
- `1` - Issues critiques ou high détectées

## Exemple : api:sync
```bash
npm run api:sync
```

**Résultat :**
```
🔍 API Sync Check - Cher Journal

═══════════════════════════════════════════════════════════

📱 Scanning frontend API calls...
🔌 Scanning backend routes...

📊 Scan Results:
   Admin calls:    87
   Web calls:      42
   Mobile calls:   0
   Backend routes: 125

❌ Missing Backend Routes: 4

POST /admin/chapters/:chapterId/volumes/:volumeId/perspective
   Priority: 🔴 Critical
   Used in:
      - admin/apps/admin/src/components/VolumePerspectiverDrawer.tsx:156
      - admin/apps/admin/src/pages/ChapterDetail.tsx:289
   Suggested: apps/backend/src/modules/admin/volumes/volumes.routes.ts

⚠️  Potentially Unused Backend Routes: 2

GET /admin/stats/revenue-by-month
   Defined in: apps/backend/src/modules/admin/stats/stats.routes.ts
   Handler: controller.getRevenueByMonth
   Recommendation: Verify if this route is still needed
```

### 2. `npm run api:generate` - Génération de Code

Génère automatiquement le code boilerplate pour les routes manquantes.

**Sortie :**
- Code pour `.routes.ts`
- Code pour `.controller.ts`
- Code pour `.service.ts`

**Exemple :**
```bash
npm run api:generate
```

**Résultat :**
```
🔧 Generating code for missing routes...

════════════════════════════════════════════════════════════
POST /admin/chapters/:chapterId/volumes/:volumeId/perspective
════════════════════════════════════════════════════════════

📝 Route Code (add to .routes.ts):

  app.post('/admin/chapters/:chapterId/volumes/:volumeId/perspective', {
    preHandler: requireAdmin,
    handler: controller.perspective.bind(controller),
  });

📝 Controller Method (add to .controller.ts):

  async perspective(
    request: FastifyRequest<{ 
      Params: { chapterId: string; volumeId: string };
      Body: any;
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.perspective(
        request.params.chapterId,
        request.params.volumeId,
        request.body
      );
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Volumes not found',
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error.message || 'Operation failed',
        },
      });
    }
  }

📝 Service Method (add to .service.ts):

  async perspective(chapterId: string, volumeId: string, data: any) {
    // TODO: Implement perspective logic
    // Access database with prisma.volumes.findUnique/findMany/create/update/delete
    
    throw new Error('NOT_IMPLEMENTED');
  }

📍 Suggested location: apps/backend/src/modules/admin/volumes/volumes.routes.ts

📊 Usage count: 2 file(s)
   - admin/apps/admin/src/components/VolumePerspectiverDrawer.tsx:156
   - admin/apps/admin/src/pages/ChapterDetail.tsx:289
```

## Workflow Recommandé

### Développement d'une Nouvelle Feature

1. **Développer le frontend** avec les appels API nécessaires
   ```typescript
   // Dans votre composant
   const response = await api.post('/admin/chapters/:id/new-action', data);
   ```

2. **Vérifier les routes manquantes**
   ```bash
   npm run api:sync
   ```

3. **Générer le code backend**
   ```bash
   npm run api:generate
   ```

4. **Copier-coller** le code généré dans les fichiers appropriés

5. **Implémenter la logique** dans le service

6. **Tester** l'endpoint

### Avant de Commit

```bash
# Vérifier que toutes les APIs sont synchronisées
npm run api:sync

# Si des routes manquent, les créer avec
npm run api:generate
```

### Intégration CI/CD

Ajouter dans votre pipeline :

```yaml
# .github/workflows/ci.yml
- name: Check API Sync
  run: npm run api:sync
```

## Structure des Routes

### Convention de Nommage

**Routes RESTful standards :**
- `GET /admin/chapters` → `list()`
- `GET /admin/chapters/:id` → `getById()`
- `POST /admin/chapters` → `create()`
- `PATCH /admin/chapters/:id` → `update()`
- `DELETE /admin/chapters/:id` → `delete()`

**Actions personnalisées :**
- `POST /admin/chapters/:id/duplicate` → `duplicate()`
- `POST /admin/chapters/:id/archive` → `archive()`
- `GET /admin/chapters/:id/stats` → `stats()`

### Organisation des Modules

```
apps/backend/src/modules/
├── admin/
│   ├── chapters/
│   │   ├── chapters.routes.ts
│   │   ├── chapters.controller.ts
│   │   ├── chapters.service.ts
│   │   └── chapters.schemas.ts
│   ├── volumes/
│   └── users/
├── auth/
├── reader/
└── stripe/
```

## Détection Automatique

### Patterns Détectés

Le script détecte automatiquement :

**Frontend :**
```typescript
api.get('/path')
api.post('/path', data)
api.patch('/path', data)
api.delete('/path')
fetch('/api/path')
```

**Backend :**
```typescript
app.get('/path', { handler: ... })
app.post('/path', { handler: ... })
```

### Normalisation des Paramètres

Les paramètres sont normalisés pour la comparaison :
- `/chapters/:id` ≈ `/chapters/:chapterId`
- `/volumes/:volumeId` ≈ `/volumes/:id`

Tous les paramètres sont traités comme équivalents pour le matching.

## Troubleshooting

### "Missing backend routes" mais la route existe

**Cause :** Pattern non détecté ou path différent

**Solution :**
1. Vérifier que le path est identique (casse, slashes)
2. Vérifier que la méthode HTTP est identique
3. Vérifier les paramètres (ordre, noms)

### "Unused routes" mais j'utilise cette route

**Cause :** Appel API dynamique ou dans un fichier non scanné

**Solution :**
1. Vérifier que le fichier est dans `apps/*/src/**/*.{ts,tsx}`
2. Vérifier que l'appel utilise le pattern `api.method('path')`
3. Éviter les paths dynamiques (construits avec variables)

### Erreur "Cannot find module"

**Cause :** Dépendances manquantes

**Solution :**
```bash
npm install
```

## Maintenance

### Ajouter de Nouvelles Apps

Modifier `scripts/sync-api.ts` :

```typescript
const myAppCalls = await scanFrontendCalls('apps/my-app', 'my-app');
const allCalls = [...adminCalls, ...webCalls, ...myAppCalls];
```

### Patterns Personnalisés

Ajouter dans `scanFrontendCalls()` :

```typescript
// Votre pattern custom
const customMatches = [...line.matchAll(/myApi\.(get|post)\(['"`]([^'"`]+)['"`]/g)];
```

## Ressources

- **Agent Expert :** `.claude/agents/api-sync-expert.md`
- **Script de scan :** `scripts/sync-api.ts`
- **Script de génération :** `scripts/generate-routes.ts`

## Support

En cas de problème :
1. Vérifier les logs de `npm run api:sync`
2. Consulter l'agent expert
3. Tester manuellement un endpoint avec Postman/curl
