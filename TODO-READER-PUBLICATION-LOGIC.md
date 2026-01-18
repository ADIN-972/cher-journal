# TODO: Logique de publication côté lecteur

## Contexte

Après l'ajout du statut pour les volumes, il faut vérifier que la logique côté lecteur (reader) respecte bien les règles de publication :

1. Un volume n'est **visible** que si `status = PUBLISHED`
2. Un volume n'est **lisible** que si `status = PUBLISHED` ET (`scheduledFor = null` OU `scheduledFor <= now`)
3. Un chapitre n'est **visible** que si `status = PUBLISHED`
4. Un chapitre n'est **lisible** que si `status = PUBLISHED` ET (`scheduledFor = null` OU `scheduledFor <= now`)

## Fichiers à vérifier et modifier

### 1. `apps/backend/src/modules/reader/reader/reader.service.ts`

Vérifier les méthodes suivantes :
- `listChapters()` - Doit filtrer les chapitres avec `status = PUBLISHED`
- `getChapterByPublicId()` - Doit vérifier le statut et scheduledFor
- `getVolume()` - Doit vérifier le statut et scheduledFor du volume

**Logique attendue pour les volumes :**
```typescript
where: {
  chapterId,
  volumeNumber,
  status: 'PUBLISHED',
  OR: [
    { scheduledFor: null },
    { scheduledFor: { lte: new Date() } }
  ]
}
```

### 2. `apps/backend/src/modules/reader/pricing/pricing.service.ts`

Vérifier que les calculs de prix ne prennent en compte que les volumes avec `status = PUBLISHED` (et éventuellement scheduledFor).

### 3. `apps/backend/src/modules/reader/wait/wait.service.ts`

Vérifier que le système de wait ne calcule que sur les volumes publiés.

## Tests à effectuer

1. ✅ Créer un chapitre avec statut DRAFT
   - Vérifier qu'il n'apparaît pas dans `listChapters()`

2. ✅ Créer un chapitre avec statut PUBLISHED
   - Vérifier qu'il apparaît dans `listChapters()`

3. ✅ Créer un volume avec statut DRAFT dans un chapitre PUBLISHED
   - Vérifier qu'il n'apparaît pas dans la liste des volumes

4. ✅ Créer un volume avec statut PUBLISHED + scheduledFor > now
   - Vérifier qu'il apparaît dans la liste mais n'est pas lisible

5. ✅ Créer un volume avec statut PUBLISHED + scheduledFor <= now
   - Vérifier qu'il est lisible

6. ✅ Créer un volume avec statut PUBLISHED + scheduledFor = null
   - Vérifier qu'il est lisible immédiatement

## Notes importantes

- **Ne pas casser la compatibilité** : Les volumes existants n'auront pas de statut avant la migration
- **Migration de données** : Tous les volumes avec `publishedAt != null` doivent recevoir `status = PUBLISHED`
- **Rétrocompatibilité** : Si possible, garder la vérification de `publishedAt` en plus du statut pendant une période de transition
