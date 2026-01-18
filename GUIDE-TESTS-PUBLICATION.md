# Guide de Tests - Système de Publication

## Tests manuels à effectuer

### Test 5: Programmer des volumes DRAFT/IN_PROGRESS

**Objectif:** Vérifier que le statut passe à IN_PROGRESS lors de la programmation

**Procédure:**
1. Ouvrir le drawer de programmation
2. Sélectionner un chapitre qui contient des volumes DRAFT
3. Sélectionner un ou plusieurs volumes DRAFT
4. Choisir une date future
5. Programmer

**Vérification dans la base de données:**
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE status = 'IN_PROGRESS';
```

**Résultat attendu:**
- Les volumes programmés ont `status = 'IN_PROGRESS'`
- Ils ont une `scheduledFor` définie
- Ils n'ont PAS de `publishedAt`

---

### Test 8: Annuler une programmation

#### Test 8a: Annuler un volume PUBLISHED

**Procédure:**
1. Programmer un volume PUBLISHED (avec une date future)
2. Dans le calendrier, cliquer sur "Annuler" pour ce volume
3. Confirmer l'annulation

**Vérification:**
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status = 'PUBLISHED'` (inchangé)
- `scheduledFor = NULL`
- `publishedAt` reste défini

#### Test 8b: Annuler un volume IN_PROGRESS

**Procédure:**
1. Programmer un volume DRAFT (qui passera à IN_PROGRESS)
2. Dans le calendrier, cliquer sur "Annuler"
3. Confirmer l'annulation

**Vérification:**
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status = 'DRAFT'` (retour à l'état initial)
- `scheduledFor = NULL`
- `publishedAt = NULL`

---

### Test 9-11: Publication automatique (Cron)

**Objectif:** Tester le processus de publication automatique

**Préparation:**
1. Programmer plusieurs volumes :
   - 1 volume DRAFT avec `scheduledFor` dans le passé
   - 1 volume IN_PROGRESS avec `scheduledFor` dans le passé
   - 1 volume PUBLISHED avec `scheduledFor` dans le passé
   - 1 volume IN_PROGRESS avec `scheduledFor` dans le futur

**Exécution manuelle du cron:**
```typescript
// Dans un script de test ou directement dans le backend
import { schedulingService } from './scheduling.service';

async function testCron() {
  const due = await schedulingService.getDueForPublication();
  console.log('Chapitres à publier:', due.chapters);
  console.log('Volumes à publier:', due.volumes);

  // Publier chaque volume
  for (const volume of due.volumes) {
    await schedulingService.publishVolume(volume.id);
    console.log(`Volume ${volume.id} publié`);
  }

  // Publier chaque chapitre
  for (const chapter of due.chapters) {
    await schedulingService.publishChapter(chapter.id);
    console.log(`Chapitre ${chapter.id} publié`);
  }
}
```

**Vérifications:**

1. **getDueForPublication ne retourne QUE les éléments non-PUBLISHED:**
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE "scheduledFor" <= NOW()
AND status != 'PUBLISHED';
```

2. **Après exécution, vérifier les volumes publiés:**
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE status = 'PUBLISHED'
ORDER BY "publishedAt" DESC
LIMIT 10;
```

**Résultats attendus:**
- Volume DRAFT avec scheduledFor passé → `status = 'PUBLISHED'`, `publishedAt` défini, `scheduledFor = NULL`
- Volume IN_PROGRESS avec scheduledFor passé → `status = 'PUBLISHED'`, `publishedAt` défini, `scheduledFor = NULL`
- Volume PUBLISHED avec scheduledFor passé → **NON TRAITÉ** (reste inchangé)
- Volume IN_PROGRESS avec scheduledFor futur → **NON TRAITÉ** (reste inchangé)

---

### Tests 12-14: Côté Lecteur (Reader)

**Objectif:** Vérifier que la logique d'accès respecte les règles de publication

**Préparation:**
1. Créer 3 volumes PUBLISHED :
   - Volume A: `scheduledFor = NULL`
   - Volume B: `scheduledFor` = date dans le futur
   - Volume C: `scheduledFor` = date dans le passé

**Code de test pour le reader:**
```typescript
// Dans reader.service.ts ou un script de test
async function testVolumeAccess(chapterId: string, volumeNumber: number) {
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
    console.log('Volume non accessible');
    return null;
  }

  console.log('Volume accessible:', volume.title);
  return volume;
}
```

**Vérifications:**

1. **Volume A (scheduledFor = null):**
   - Doit être retourné ✅
   - Lisible immédiatement

2. **Volume B (scheduledFor futur):**
   - Ne doit PAS être retourné ❌
   - Message: "Volume non accessible"

3. **Volume C (scheduledFor passé):**
   - Doit être retourné ✅
   - Lisible

---

## Commandes SQL utiles

### Voir tous les volumes avec leur statut
```sql
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  v."publishedAt",
  c.title as chapter_title
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
ORDER BY c.title, v."volumeNumber";
```

### Voir les volumes programmés
```sql
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  c.title as chapter_title
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v."scheduledFor" IS NOT NULL
ORDER BY v."scheduledFor" ASC;
```

### Réinitialiser un volume pour les tests
```sql
UPDATE volumes
SET
  status = 'DRAFT',
  "scheduledFor" = NULL,
  "publishedAt" = NULL
WHERE id = '[ID_DU_VOLUME]';
```

### Créer une date de test dans le passé
```sql
UPDATE volumes
SET "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID_DU_VOLUME]';
```

### Créer une date de test dans le futur
```sql
UPDATE volumes
SET "scheduledFor" = NOW() + INTERVAL '1 day'
WHERE id = '[ID_DU_VOLUME]';
```
