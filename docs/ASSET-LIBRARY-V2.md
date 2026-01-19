# 📚 Bibliothèque d'Assets Améliorée (V2)

Documentation complète du système de gestion d'assets amélioré pour Cher Journal.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [API Backend](#api-backend)
5. [Modèles de Données](#modèles-de-données)
6. [Cas d'Usage](#cas-dusage)
7. [Tests](#tests)
8. [Prochaines Étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

La bibliothèque d'assets V2 apporte des améliorations significatives au système de gestion d'images et de pages à colorier :

- **Système de tags** : Catégorisation flexible des assets
- **Recherche avancée** : Filtrage par nom, type, et tags
- **Détection de doublons** : Identification automatique par SHA256
- **Gestion de versions** : Historique et évolution des assets
- **Amélioration future** : Édition d'images et intégration CDN

### Statut: ✅ Phase Backend Complétée

- ✅ Modèles Prisma créés et migrés
- ✅ Services backend implémentés
- ✅ Routes API configurées
- ✅ Tests de compilation réussis
- ⏳ Interface frontend (à venir)
- ⏳ Édition d'images avec Canvas API (à venir)
- ⏳ Intégration CDN Cloudflare R2 (à venir)

---

## 🌟 Fonctionnalités

### 1. Système de Tags

Permet d'organiser les assets avec des tags personnalisés.

**Caractéristiques:**
- Création de tags avec nom, description et couleur
- Association multiple (plusieurs tags par asset)
- Recherche par tags
- Statistiques d'utilisation

**Exemples de tags:**
- "Chapitre 1", "Chapitre 2", etc.
- "Paysage", "Portrait", "Personnage"
- "Illustration finale", "Brouillon", "Variation"
- "Couleur chaude", "Couleur froide"

### 2. Recherche et Filtres

Système de filtrage puissant pour retrouver rapidement les assets.

**Filtres disponibles:**
- Par type (IMAGE, COLORING_PAGE)
- Par nom (recherche textuelle)
- Par tags (un ou plusieurs)
- Afficher uniquement les doublons

### 3. Détection de Doublons

Identification automatique des fichiers identiques basée sur le hash SHA256.

**Fonctionnalités:**
- Calcul automatique du SHA256 à l'upload
- Endpoint dédié pour lister les doublons
- Regroupement par hash
- Informations d'utilisation pour chaque doublon

**Cas d'usage:**
- Nettoyer la bibliothèque
- Identifier les assets redondants
- Optimiser l'espace de stockage

### 4. Gestion de Versions

Système de versioning pour suivre l'évolution des assets.

**Fonctionnalités:**
- Création de nouvelles versions d'un asset
- Lien vers l'asset original
- Numérotation automatique (v1, v2, v3...)
- Historique complet

**Cas d'usage:**
- Corrections d'une illustration
- Variations d'une même image
- Tests A/B d'illustrations

---

## 🏗️ Architecture

### Schéma de la Base de Données

```
┌─────────────────────┐
│   ChapterAsset      │
├─────────────────────┤
│ id                  │
│ chapterId           │
│ kind                │
│ label               │
│ objectKey           │
│ sha256              │◄────┐
│ version             │     │ Détection
│ originalAssetId     │────┐│ de doublons
│ createdAt           │    ││
│ updatedAt           │    ││
└─────────────────────┘    ││
         │                 ││
         │ N               ││
         │                 ││
         ▼ N               ││
┌─────────────────────┐    ││
│   AssetTagging      │    ││
├─────────────────────┤    ││
│ id                  │    ││
│ assetId             │    ││
│ tagId               │    ││
│ createdAt           │    ││
└─────────────────────┘    ││
         │ N               ││
         │                 ││
         ▼ 1               ││
┌─────────────────────┐    ││
│   AssetTag          │    ││
├─────────────────────┤    ││
│ id                  │    ││
│ name                │    ││
│ description         │    ││
│ color               │    ││
└─────────────────────┘    ││
                           ││
     Versions:             ││
     ┌──────────────┐      ││
     │ Original (v1)│      ││
     └──────────────┘      ││
            │              ││
            ▼              ││
     ┌──────────────┐      ││
     │ Version 2    │──────┘│
     └──────────────┘       │
            │               │
            ▼               │
     ┌──────────────┐       │
     │ Version 3    │───────┘
     └──────────────┘
```

### Services Backend

```
AssetTagsService
├── listTags()
├── createTag(data)
├── updateTag(id, data)
├── deleteTag(id)
├── tagAsset(assetId, tagId)
├── untagAsset(assetId, tagId)
├── getAssetTags(assetId)
├── getAssetsByTag(tagId)
├── bulkTagAssets(assetIds, tagIds)
└── bulkUntagAssets(assetIds, tagIds)

AssetsService (amélioré)
├── list(chapterId, filters)
├── findDuplicates(chapterId)
├── createVersion(originalAssetId, file, label)
├── getAssetVersions(assetId)
├── upload(chapterId, file, kind, label)
├── delete(id)
└── update(id, chapterId, updates)
```

---

## 🔌 API Backend

### Tags Management

#### Liste des tags
```http
GET /admin/asset-tags
GET /api/admin/asset-tags
```

**Réponse:**
```json
[
  {
    "id": "uuid",
    "name": "Chapitre 1",
    "description": "Assets du chapitre 1",
    "color": "#FF5733",
    "createdAt": "2026-01-19T...",
    "updatedAt": "2026-01-19T...",
    "_count": {
      "assets": 15
    }
  }
]
```

#### Créer un tag
```http
POST /admin/asset-tags
Content-Type: application/json

{
  "name": "Paysage",
  "description": "Images de paysages",
  "color": "#3498DB"
}
```

#### Mettre à jour un tag
```http
PATCH /admin/asset-tags/:id
Content-Type: application/json

{
  "name": "Nouveau nom",
  "color": "#E74C3C"
}
```

#### Supprimer un tag
```http
DELETE /admin/asset-tags/:id
```

### Asset Tagging

#### Ajouter un tag à un asset
```http
POST /admin/assets/:assetId/tags
Content-Type: application/json

{
  "tagId": "tag-uuid"
}
```

#### Retirer un tag d'un asset
```http
DELETE /admin/assets/:assetId/tags/:tagId
```

#### Obtenir les tags d'un asset
```http
GET /admin/assets/:assetId/tags
```

#### Taguer plusieurs assets en masse
```http
POST /admin/assets/tags/bulk-tag
Content-Type: application/json

{
  "assetIds": ["asset-1", "asset-2", "asset-3"],
  "tagIds": ["tag-1", "tag-2"]
}
```

#### Dé-taguer plusieurs assets en masse
```http
POST /admin/assets/tags/bulk-untag
Content-Type: application/json

{
  "assetIds": ["asset-1", "asset-2"],
  "tagIds": ["tag-1"]
}
```

### Asset Management (Amélioré)

#### Lister les assets avec filtres
```http
GET /admin/chapters/:chapterId/assets?kind=IMAGE&search=jasmine&tagIds=tag1,tag2&showDuplicates=true
```

**Paramètres:**
- `kind`: IMAGE | COLORING_PAGE
- `search`: Recherche textuelle dans le label
- `tagIds`: Liste de tag IDs (séparés par virgule)
- `showDuplicates`: true | false

**Réponse:**
```json
[
  {
    "id": "asset-uuid",
    "kind": "IMAGE",
    "label": "Jasmine vol 5",
    "sha256": "abc123...",
    "version": 1,
    "tags": [
      {
        "id": "tag-uuid",
        "name": "Chapitre 1",
        "color": "#FF5733"
      }
    ],
    "isChapterCover": false,
    "usedByVolumes": ["vol-1"],
    "usedByVersions": []
  }
]
```

#### Trouver les doublons
```http
GET /admin/chapters/:chapterId/assets/duplicates
```

**Réponse:**
```json
[
  {
    "sha256": "abc123...",
    "count": 3,
    "assets": [
      { "id": "asset-1", "label": "Image 1", ... },
      { "id": "asset-2", "label": "Image 1 copie", ... },
      { "id": "asset-3", "label": "Image 1 backup", ... }
    ]
  }
]
```

#### Créer une nouvelle version d'un asset
```http
POST /admin/chapters/:chapterId/assets/:assetId/create-version
Content-Type: multipart/form-data

file: (binary data)
label: "Version corrigée"
```

#### Obtenir toutes les versions d'un asset
```http
GET /admin/assets/:assetId/versions
```

**Réponse:**
```json
[
  {
    "id": "original-uuid",
    "label": "Image originale",
    "version": 1,
    "originalAssetId": null,
    "createdAt": "2026-01-15T..."
  },
  {
    "id": "v2-uuid",
    "label": "Version corrigée",
    "version": 2,
    "originalAssetId": "original-uuid",
    "createdAt": "2026-01-18T..."
  }
]
```

---

## 📊 Modèles de Données

### AssetTag

```prisma
model AssetTag {
  id          String         @id @default(uuid())
  name        String         @unique
  description String?
  color       String?        // Hex color (#FF5733)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  assets      AssetTagging[]
}
```

### AssetTagging

```prisma
model AssetTagging {
  id        String       @id @default(uuid())
  assetId   String
  tagId     String
  createdAt DateTime     @default(now())
  asset     ChapterAsset @relation(...)
  tag       AssetTag     @relation(...)

  @@unique([assetId, tagId])
}
```

### ChapterAsset (Amélioré)

```prisma
model ChapterAsset {
  id                  String      @id @default(uuid())
  chapterId           String
  kind                AssetKind   @default(IMAGE)
  label               String?
  objectKey           String
  thumbnailObjectKey  String?
  mimeType            String
  sizeBytes           Int
  width               Int?
  height              Int?
  sha256              String?           // NEW: Pour détection doublons
  version             Int         @default(1)  // NEW: Version de l'asset
  originalAssetId     String?           // NEW: Référence à l'original
  originalAsset       ChapterAsset? @relation("AssetVersions", ...)
  versions            ChapterAsset[] @relation("AssetVersions")
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @default(now()) @updatedAt  // NEW
  tags                AssetTagging[]    // NEW

  @@index([sha256])         // NEW: Pour recherche rapide de doublons
  @@index([originalAssetId]) // NEW: Pour recherche de versions
}
```

---

## 💼 Cas d'Usage

### Cas 1: Organiser les Assets par Chapitre

```javascript
// 1. Créer des tags pour chaque chapitre
const tag1 = await api.post('/admin/asset-tags', {
  name: 'Chapitre 1',
  color: '#3498DB'
});

const tag2 = await api.post('/admin/asset-tags', {
  name: 'Chapitre 2',
  color: '#E74C3C'
});

// 2. Taguer les assets
await api.post(`/admin/assets/${assetId}/tags`, {
  tagId: tag1.id
});

// 3. Filtrer les assets du chapitre 1
const assets = await api.get(
  `/admin/chapters/${chapterId}/assets?tagIds=${tag1.id}`
);
```

### Cas 2: Nettoyer les Doublons

```javascript
// 1. Trouver les doublons
const duplicates = await api.get(
  `/admin/chapters/${chapterId}/assets/duplicates`
);

// 2. Pour chaque groupe de doublons
for (const group of duplicates) {
  console.log(`Found ${group.count} duplicates for hash ${group.sha256}`);

  // Identifier l'asset à garder (celui utilisé par des volumes)
  const toKeep = group.assets.find(a => a.usedByVolumes.length > 0);

  // Supprimer les autres
  const toDelete = group.assets.filter(a => a.id !== toKeep.id);
  for (const asset of toDelete) {
    if (asset.usedByVolumes.length === 0 && asset.usedByVersions.length === 0) {
      await api.delete(`/admin/assets/${asset.id}`);
    }
  }
}
```

### Cas 3: Corriger une Illustration

```javascript
// 1. Upload une nouvelle version de l'asset
const newVersion = await api.post(
  `/admin/chapters/${chapterId}/assets/${originalAssetId}/create-version`,
  formData // contient le nouveau fichier
);

// 2. Obtenir toutes les versions
const versions = await api.get(`/admin/assets/${originalAssetId}/versions`);

console.log(`Asset has ${versions.length} versions`);

// 3. La version la plus récente est automatiquement disponible
// L'asset original reste inchangé pour l'historique
```

### Cas 4: Recherche Avancée

```javascript
// Rechercher toutes les images de paysage du chapitre 1 en couleurs chaudes
const results = await api.get(
  `/admin/chapters/${chapterId}/assets?` +
  `kind=IMAGE&` +
  `search=paysage&` +
  `tagIds=${chap1TagId},${warmColorTagId}`
);
```

---

## 🧪 Tests

### Tests Manuels Recommandés

#### 1. Système de Tags

```bash
# Créer un tag
curl -X POST http://localhost:3000/admin/asset-tags \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Tag","color":"#FF0000"}'

# Lister les tags
curl http://localhost:3000/admin/asset-tags

# Taguer un asset
curl -X POST http://localhost:3000/admin/assets/{assetId}/tags \
  -H "Content-Type: application/json" \
  -d '{"tagId":"{tagId}"}'
```

#### 2. Détection de Doublons

```bash
# Upload le même fichier 2 fois (avec des noms différents)
# Vérifier la détection
curl http://localhost:3000/admin/chapters/{chapterId}/assets/duplicates
```

#### 3. Gestion de Versions

```bash
# Créer une version d'un asset
curl -X POST http://localhost:3000/admin/chapters/{chapterId}/assets/{assetId}/create-version \
  -F "file=@image-v2.png" \
  -F "label=Version corrigée"

# Obtenir les versions
curl http://localhost:3000/admin/assets/{assetId}/versions
```

### Tests Automatisés (À Créer)

```typescript
// tests/asset-tags.test.ts
describe('Asset Tags API', () => {
  it('should create a tag', async () => {
    const response = await request(app)
      .post('/admin/asset-tags')
      .send({ name: 'Test', color: '#FF0000' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test');
  });

  it('should prevent duplicate tag names', async () => {
    await createTag({ name: 'Duplicate' });

    const response = await request(app)
      .post('/admin/asset-tags')
      .send({ name: 'Duplicate' });

    expect(response.status).toBe(409);
  });
});
```

---

## 🚀 Prochaines Étapes

### Phase 1: Interface Frontend (Priorité Haute)

- [ ] Composant `TagManager` pour gérer les tags
- [ ] Composant `AssetFilters` avec tous les filtres
- [ ] Améliorer `ChapterImageGallery` pour afficher les tags
- [ ] Modal `DuplicateManager` pour gérer les doublons
- [ ] Composant `AssetVersionHistory` pour l'historique

### Phase 2: Édition d'Images (Priorité Moyenne)

- [ ] Intégration Canvas API pour édition basique
- [ ] Fonctions de crop et resize
- [ ] Preview avant sauvegarde
- [ ] Sauvegarde automatique en tant que nouvelle version

### Phase 3: CDN Integration (Priorité Basse)

- [ ] Configuration Cloudflare R2
- [ ] Migration des assets existants
- [ ] Upload direct vers R2
- [ ] Invalidation du cache
- [ ] Fallback vers stockage local

### Améliorations Futures

- [ ] Import/Export en masse
- [ ] Métadonnées EXIF
- [ ] Compression automatique
- [ ] Génération de multiples formats (WebP, AVIF)
- [ ] Intelligence artificielle pour auto-tagging
- [ ] Recherche par similarité visuelle

---

## 📝 Notes Techniques

### Performance

- Les recherches utilisent des index sur `sha256` et `originalAssetId`
- Les tags sont chargés avec `include` pour éviter les N+1 queries
- Pagination recommandée pour les grandes bibliothèques (à implémenter)

### Sécurité

- Tous les endpoints requièrent l'authentification admin
- Validation des inputs avec Zod
- Les couleurs sont validées (format hexadécimal)

### Limitations Actuelles

- Pas de pagination sur la liste des assets
- Pas de tri personnalisé
- Pas d'upload en masse via l'API
- Édition d'images non implémentée

---

## 📚 Références

- [Prisma Schema](../../apps/backend/prisma/schema.prisma)
- [Asset Tags Service](../../apps/backend/src/modules/admin/asset-tags/asset-tags.service.ts)
- [Assets Service](../../apps/backend/src/modules/admin/assets/assets.service.ts)
- [Migration](../../apps/backend/prisma/migrations/20260119023851_add_asset_tags_and_versions/)

---

**Dernière mise à jour:** 2026-01-19
**Statut:** ✅ Backend Complet | ⏳ Frontend À Venir
**Version:** 2.0
