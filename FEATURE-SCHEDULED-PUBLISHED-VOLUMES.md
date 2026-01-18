# Fonctionnalité : Programmation des chapitres et volumes publiés

## Contexte

Avant cette modification, il n'était pas possible de programmer une date de publication pour un chapitre ou volume déjà `PUBLISHED`. Cette limitation empêchait un cas d'usage important : rendre un contenu visible dans la liste mais différer son accès à la lecture.

## Changement apporté

Il est maintenant possible de définir une `scheduledFor` (date de publication programmée) pour **tous les chapitres et volumes**, qu'ils soient `DRAFT`, `IN_PROGRESS` ou `PUBLISHED`.

## Cas d'usage

### Scénario 1 : Volume non publié
Un volume avec `status = DRAFT` ou `IN_PROGRESS` peut être programmé pour publication automatique.

**Comportement :**
- Le volume passe à `status = IN_PROGRESS` lors de la programmation
- À la date programmée, le cron automatique le met à `status = PUBLISHED` et `publishedAt = now`
- Le volume devient alors visible ET lisible

### Scénario 2 : Volume déjà publié avec date différée
Un volume avec `status = PUBLISHED` peut recevoir une `scheduledFor` pour différer son accès.

**Comportement :**
- Le volume reste à `status = PUBLISHED` lors de la programmation
- Le volume est **visible** dans la liste des volumes du chapitre
- Le volume n'est **pas encore lisible** tant que `scheduledFor > now`
- À partir de la date programmée, le volume devient **lisible**
- Le cron automatique ne touche PAS à ce volume (car déjà `PUBLISHED`)

**Exemple concret :**
```
Volume 5 - "Le grand réveil"
- status: PUBLISHED
- publishedAt: 2026-01-15 10:00
- scheduledFor: 2026-02-01 00:00

→ Visible dans la liste depuis le 15/01
→ Lisible seulement à partir du 01/02
```

## Logique d'accessibilité

### Pour un volume PUBLISHED

**Visible dans la liste :**
```typescript
volume.status === 'PUBLISHED'
```

**Lisible (accessible) :**
```typescript
volume.status === 'PUBLISHED' && (
  volume.scheduledFor === null ||
  new Date(volume.scheduledFor) <= new Date()
)
```

## Modifications du code

### Backend (`scheduling.service.ts`)

**Avant :**
```typescript
if (chapter.publishedAt) {
  throw new Error('Chapter is already published');
}
if (volume.publishedAt) {
  throw new Error('Volume is already published');
}
```

**Après :**
```typescript
// Allow scheduling even for published chapters/volumes
status: chapter.status === ChapterStatus.PUBLISHED
  ? ChapterStatus.PUBLISHED
  : ChapterStatus.IN_PROGRESS

status: volume.status === VolumeStatus.PUBLISHED
  ? VolumeStatus.PUBLISHED
  : VolumeStatus.IN_PROGRESS
```

**Filtrage pour publication automatique :**
```typescript
// Avant
where: { scheduledFor: { lte: now }, publishedAt: null }

// Après
where: { scheduledFor: { lte: now }, status: { not: VolumeStatus.PUBLISHED } }
```

### Frontend (`SchedulePublicationDrawer.tsx`)

**Avant :**
```typescript
disabled={isPublished}
onClick={() => {
  if (!isPublished) {
    toggleVolumeSelection(volume.id);
  }
}}
```

**Après :**
```typescript
// Tous les volumes sont sélectionnables
onClick={() => toggleVolumeSelection(volume.id)}
```

**Affichage de la date programmée :**
```typescript
{hasScheduledDate && (
  <span>• Prévu le {formatDate(volume.scheduledFor)}</span>
)}
```

## Impact sur le lecteur (reader)

Le code côté lecteur doit vérifier les deux conditions pour autoriser la lecture :

```typescript
// Dans reader.service.ts
async getVolume(chapterId: string, volumeNumber: number) {
  const volume = await prisma.volume.findFirst({
    where: {
      chapterId,
      volumeNumber,
      status: 'PUBLISHED',
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
      ]
    }
  });

  if (!volume) {
    throw new Error('VOLUME_NOT_AVAILABLE');
  }

  return volume;
}
```

## Avantages

1. **Plus de flexibilité** : Permet de créer du suspense en montrant qu'un nouveau volume existe sans le rendre lisible immédiatement
2. **Calendrier de publication** : Facilite la gestion d'un calendrier de sortie régulier
3. **Marketing** : Les lecteurs voient les volumes à venir et peuvent anticiper leur sortie
4. **Cohérence** : Tous les volumes suivent la même logique de programmation

## Tests recommandés

1. ✅ Créer un volume DRAFT et le programmer → Devrait passer à IN_PROGRESS
2. ✅ Créer un volume PUBLISHED et le programmer → Devrait rester PUBLISHED
3. ✅ Vérifier que le cron ne publie QUE les volumes non-PUBLISHED
4. ✅ Vérifier qu'un volume PUBLISHED avec `scheduledFor > now` n'est pas lisible
5. ✅ Vérifier qu'un volume PUBLISHED avec `scheduledFor <= now` est lisible
6. ✅ Vérifier qu'un volume PUBLISHED sans `scheduledFor` est lisible immédiatement
