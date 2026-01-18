# Implémentation Côté Lecteur - Système de Publication

## ✅ Modifications Appliquées

### 1. `reader.service.ts`

**Méthode `getVolumeVersion()`:**

```typescript
async getVolumeVersion(
  chapterId: string,
  volumeNumber: number,
  perspective: Perspective
) {
  const volume = await prisma.volume.findFirst({
    where: {
      chapterId,
      volumeNumber,
      // Volume must be published
      status: 'PUBLISHED',
      // AND either no scheduled date OR scheduled date has passed
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
      ]
    },
    include: {
      versions: {
        where: { perspective },
        include: {
          assets: {
            include: { chapterAsset: true },
            orderBy: { assetOrder: "asc" },
          },
          textBlob: true,
        },
      },
    },
  });

  if (!volume || volume.versions.length === 0) {
    throw new Error("VOLUME_NOT_AVAILABLE");
  }

  return volume.versions[0];
}
```

**Impact:**
- Les volumes avec `status != PUBLISHED` ne sont plus accessibles
- Les volumes avec `scheduledFor` futur ne sont plus accessibles
- Nouvelle erreur `VOLUME_NOT_AVAILABLE` pour une meilleure gestion

---

### 2. `reader.controller.ts`

**Ajout de la gestion de l'erreur `VOLUME_NOT_AVAILABLE`:**

```typescript
if (error.message === 'VOLUME_NOT_AVAILABLE') {
  return reply.status(404).send({
    success: false,
    error: {
      code: 'VOLUME_NOT_AVAILABLE',
      message: 'Volume is not available yet or not published'
    },
  });
}
```

**Impact:**
- Message d'erreur plus explicite pour l'utilisateur
- Code HTTP 404 approprié

---

### 3. `catalog.service.ts`

**Méthode `listChapters()`:**

```typescript
async listChapters() {
  return prisma.chapter.findMany({
    where: {
      status: ChapterStatus.PUBLISHED,
      // Chapter must be either without scheduledFor OR scheduled date has passed
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
      ]
    },
    include: {
      coverAsset: true,
      _count: {
        select: {
          volumes: {
            where: {
              // Only count volumes that are published and accessible
              status: VolumeStatus.PUBLISHED,
              OR: [
                { scheduledFor: null },
                { scheduledFor: { lte: new Date() } }
              ]
            }
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

**Impact:**
- Ne liste que les chapitres accessibles (PUBLISHED et scheduledFor passé)
- Le compteur de volumes ne compte que les volumes accessibles
- Les utilisateurs ne voient pas les chapitres/volumes à venir

---

**Méthode `getChapter()`:**

```typescript
async getChapter(id: string, userId?: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: {
      coverAsset: true,
      volumes: {
        where: {
          // Only include volumes that are published and accessible
          status: VolumeStatus.PUBLISHED,
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } }
          ]
        },
        include: {
          illustrationAsset: true,
        },
        orderBy: { volumeNumber: 'asc' },
      },
    },
  });
  // ... reste du code
}
```

**Impact:**
- La liste des volumes d'un chapitre ne contient que les volumes accessibles
- Les volumes programmés pour le futur ne sont pas visibles

---

### 4. `library.service.ts`

**Méthode `getLibrary()`:**

```typescript
async getLibrary(userId: string) {
  const entitlements = await prisma.entitlement.findMany({
    where: { userId },
    include: {
      chapter: {
        include: {
          coverAsset: true,
          volumes: {
            where: {
              // Only include volumes that are published and accessible
              status: VolumeStatus.PUBLISHED,
              OR: [
                { scheduledFor: null },
                { scheduledFor: { lte: new Date() } }
              ]
            },
            orderBy: { volumeNumber: 'asc' },
          },
        },
      },
    },
  });
  // ... reste du code
}
```

**Impact:**
- La bibliothèque de l'utilisateur ne montre que les volumes accessibles
- Les volumes programmés dans le futur ne sont pas listés, même si l'utilisateur a les droits d'accès

---

## 🎯 Logique d'Accessibilité Complète

### Pour qu'un volume soit accessible au lecteur:

1. **Status = PUBLISHED**
   - Le volume doit avoir été publié

2. **ET** une des conditions suivantes:
   - `scheduledFor = null` → Accessible immédiatement
   - `scheduledFor <= now` → La date programmée est passée

### Matrice d'accessibilité:

| Status      | scheduledFor | Visible | Lisible | Comportement                           |
|-------------|--------------|---------|---------|----------------------------------------|
| DRAFT       | any          | ❌      | ❌      | Volume non publié                      |
| IN_PROGRESS | any          | ❌      | ❌      | Volume en cours de publication         |
| PUBLISHED   | null         | ✅      | ✅      | Volume accessible immédiatement        |
| PUBLISHED   | future       | ❌      | ❌      | Volume pas encore visible/lisible      |
| PUBLISHED   | past         | ✅      | ✅      | Volume accessible                      |

---

## 🧪 Tests Recommandés

### Test 1: Volume accessible (PUBLISHED, scheduledFor = null)
```sql
-- Créer un volume de test
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NULL
WHERE id = '[ID]';

-- Tester via l'API lecteur
GET /api/reader/volume-version?chapterId=[ID]&volumeNumber=1&perspective=PROTAGONIST

-- Résultat attendu: 200 OK avec les données du volume
```

### Test 2: Volume non accessible (PUBLISHED, scheduledFor futur)
```sql
-- Créer un volume de test avec date future
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NOW() + INTERVAL '1 day'
WHERE id = '[ID]';

-- Tester via l'API lecteur
GET /api/reader/volume-version?chapterId=[ID]&volumeNumber=1&perspective=PROTAGONIST

-- Résultat attendu: 404 avec erreur "VOLUME_NOT_AVAILABLE"
```

### Test 3: Volume accessible (PUBLISHED, scheduledFor passé)
```sql
-- Créer un volume de test avec date passée
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID]';

-- Tester via l'API lecteur
GET /api/reader/volume-version?chapterId=[ID]&volumeNumber=1&perspective=PROTAGONIST

-- Résultat attendu: 200 OK avec les données du volume
```

### Test 4: Liste des chapitres
```bash
# Tester la liste des chapitres
GET /api/reader/catalog/chapters

# Vérifier:
# - Seuls les chapitres PUBLISHED apparaissent
# - Le count de volumes ne compte que les volumes accessibles
```

### Test 5: Bibliothèque utilisateur
```bash
# Tester la bibliothèque
GET /api/reader/library

# Vérifier:
# - Les volumes programmés pour le futur n'apparaissent pas
# - Les volumes accessibles sont listés correctement
```

---

## 📊 Fichiers Modifiés

1. ✅ `apps/backend/src/modules/reader/reader/reader.service.ts`
2. ✅ `apps/backend/src/modules/reader/reader/reader.controller.ts`
3. ✅ `apps/backend/src/modules/reader/catalog/catalog.service.ts`
4. ✅ `apps/backend/src/modules/reader/library/library.service.ts`

---

## 🚀 Prochaines Étapes

1. **Tester manuellement les endpoints lecteur**
   - Créer des volumes avec différents statuts et dates
   - Tester l'accès via l'API
   - Vérifier les messages d'erreur

2. **Tester avec l'interface lecteur (frontend)**
   - Vérifier que les volumes non accessibles ne sont pas visibles
   - Vérifier les messages d'erreur côté utilisateur
   - Tester le comportement avec des dates futures

3. **Tests automatisés**
   - Utiliser le script `test-reader-access.ts` pour vérifier la logique
   - Créer des tests unitaires pour les services

4. **Documentation utilisateur**
   - Expliquer aux utilisateurs pourquoi certains volumes ne sont pas visibles
   - Documenter le comportement des volumes programmés

---

## 💡 Notes Importantes

### Différence entre Visible et Lisible

Dans le système actuel, il n'y a **pas de différence** entre "visible" et "lisible" côté lecteur.

- Si un volume est `PUBLISHED` avec `scheduledFor` futur, il n'est **ni visible ni lisible**
- Cette approche simplifie l'UX et évite la frustration de voir un volume sans pouvoir le lire

### Comportement du Cron

Le cron automatique ne touche **JAMAIS** aux volumes déjà `PUBLISHED`:

```typescript
// Dans getDueForPublication()
where: {
  scheduledFor: { lte: now },
  status: { not: VolumeStatus.PUBLISHED },  // Ignore les PUBLISHED
}
```

Cela signifie que:
- Les volumes `PUBLISHED` avec `scheduledFor` passent automatiquement à "lisible" sans intervention du cron
- Le cron ne fait que publier les volumes `DRAFT` ou `IN_PROGRESS`

---

## 🎉 Résultat Final

Un système complet de publication côté lecteur qui:
- Respecte les statuts des volumes (DRAFT, IN_PROGRESS, PUBLISHED)
- Gère les dates de publication programmées
- Filtre correctement les volumes accessibles dans tous les endpoints
- Fournit des messages d'erreur clairs
- Protège l'expérience utilisateur en ne montrant que le contenu accessible
