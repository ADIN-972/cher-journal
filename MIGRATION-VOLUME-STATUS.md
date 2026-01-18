# Migration: Ajout du statut pour les volumes

## Contexte
Les volumes n'avaient pas de champ `status` contrairement aux chapitres. Cette migration ajoute un enum `VolumeStatus` et un champ `status` au modèle `Volume`.

## Changements Prisma Schema

### 1. Ajout de l'enum VolumeStatus
```prisma
enum VolumeStatus {
  DRAFT
  IN_PROGRESS
  PUBLISHED
}
```

### 2. Ajout du champ status au modèle Volume
```prisma
model Volume {
  // ... autres champs
  status               VolumeStatus    @default(DRAFT)
  // ... autres champs
}
```

## Migration SQL à exécuter

Lorsque la base de données sera accessible, exécuter :

```bash
cd apps/backend
npx prisma migrate dev --name add_volume_status
```

Ou créer manuellement la migration SQL :

```sql
-- CreateEnum
CREATE TYPE "VolumeStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'PUBLISHED');

-- AlterTable
ALTER TABLE "volumes" ADD COLUMN "status" "VolumeStatus" NOT NULL DEFAULT 'DRAFT';

-- Mettre à jour les volumes existants
-- Les volumes avec publishedAt != null deviennent PUBLISHED
UPDATE "volumes" SET "status" = 'PUBLISHED' WHERE "publishedAt" IS NOT NULL;

-- Les volumes avec scheduledFor != null mais sans publishedAt deviennent IN_PROGRESS
UPDATE "volumes" SET "status" = 'IN_PROGRESS'
WHERE "scheduledFor" IS NOT NULL AND "publishedAt" IS NULL;
```

## Régénération du client Prisma

Après la migration, régénérer le client Prisma :

```bash
cd apps/backend
npx prisma generate
```

## Logique de publication

### Règles de visibilité et d'accessibilité

**Pour les CHAPITRES :**
- `status = PUBLISHED` → Visible dans la bibliothèque
- `status = PUBLISHED` + `scheduledFor = null` → Lisible immédiatement
- `status = PUBLISHED` + `scheduledFor > now` → Visible mais pas encore lisible
- `status = PUBLISHED` + `scheduledFor <= now` → Visible et lisible

**Pour les VOLUMES :**
- `status = PUBLISHED` → Visible dans la liste des volumes du chapitre
- `status = PUBLISHED` + `scheduledFor = null` → Lisible immédiatement
- `status = PUBLISHED` + `scheduledFor > now` → Visible mais pas encore lisible
- `status = PUBLISHED` + `scheduledFor <= now` → Visible et lisible

**Important :**
- Un chapitre PUBLISHED peut avoir des volumes DRAFT/IN_PROGRESS/PUBLISHED
- Les utilisateurs verront le chapitre mais seulement les volumes PUBLISHED seront visibles
- **Un volume PUBLISHED peut avoir une date de publication programmée** (`scheduledFor`)
  - Cela permet de rendre un volume visible mais pas encore lisible jusqu'à une date donnée
  - Le statut reste PUBLISHED mais l'accès à la lecture est contrôlé par `scheduledFor`

### Programmation des volumes publiés

Il est maintenant possible de programmer une date de publication pour un volume déjà PUBLISHED.
Cas d'usage : Un volume est publié (visible dans la liste) mais on veut retarder son accès à la lecture.

**Comportement :**
- Lors de la programmation d'un volume PUBLISHED : le statut reste PUBLISHED
- Lors de la programmation d'un volume DRAFT/IN_PROGRESS : le statut passe à IN_PROGRESS
- Le cron de publication automatique ne traite QUE les volumes avec status != PUBLISHED

## Modifications du code

### Frontend (SchedulePublicationDrawer.tsx)
- ✅ Ajout du champ `status` à l'interface `Volume`
- ✅ Chapitres publiés ne sont plus grisés (leurs volumes peuvent ne pas l'être)
- ✅ Affichage du badge "Publié" pour les chapitres avec `status = PUBLISHED`
- ✅ **Tous les volumes sont maintenant sélectionnables**, même ceux déjà PUBLISHED
- ✅ Affichage du statut des volumes avec badge
- ✅ Affichage de la date programmée pour les volumes qui en ont une

### Backend (scheduling.service.ts)
- ✅ Import de `VolumeStatus` depuis Prisma
- ✅ Mise à jour du statut des volumes vers `IN_PROGRESS` lors de la programmation
- ✅ Mise à jour du statut vers `PUBLISHED` lors de la publication automatique
- ✅ Retour au statut `DRAFT` lors de l'annulation de programmation
- ✅ Vérification du statut au lieu de `publishedAt` pour la validation

## Fichiers modifiés

1. `apps/backend/prisma/schema.prisma`
   - Ajout enum `VolumeStatus`
   - Ajout champ `status` au modèle `Volume`

2. `apps/backend/src/modules/admin/scheduling/scheduling.service.ts`
   - Import `VolumeStatus`
   - Mise à jour de toutes les méthodes manipulant les volumes
   - Mise à jour de l'interface `ScheduledItem` pour accepter `VolumeStatus`
   - Ajout du champ `status` dans les volumes retournés
   - **Autorisation de programmer des volumes PUBLISHED** (leur statut reste PUBLISHED)
   - `getDueForPublication()` filtre maintenant sur `status != PUBLISHED` au lieu de `publishedAt = null`
   - `getScheduledItems()` retourne tous les éléments avec `scheduledFor != null` (même ceux déjà PUBLISHED)

3. `apps/backend/src/modules/admin/chapters/chapters.service.ts`
   - Ajout explicite du champ `status` dans `serializeVolume()`
   - Ajout du champ `status` dans la méthode `list()`

4. `apps/backend/src/modules/admin/volumes/volumes.service.ts`
   - Ajout explicite du champ `status` dans `serializeVolume()`

5. `packages/types/src/index.ts`
   - Ajout du champ `status` à l'interface `Volume`
   - Ajout du champ `scheduledFor` à l'interface `Volume`

6. `apps/admin/src/components/SchedulePublicationDrawer.tsx`
   - Ajout `status` à l'interface `Volume`
   - **Tous les volumes sont maintenant sélectionnables**, quel que soit leur statut
   - Affichage de la date de publication programmée pour les volumes qui en ont une
   - Affichage des badges de statut ("Publié", "Programmé")

## ✅ Migration effectuée avec succès

**Date:** 2026-01-18

**Résultats:**
- ✅ Enum `VolumeStatus` créé (DRAFT, IN_PROGRESS, PUBLISHED)
- ✅ Colonne `status` ajoutée à la table `volumes` avec valeur par défaut DRAFT
- ✅ 75 volumes existants mis à jour vers le statut PUBLISHED
- ✅ 5 volumes restants conservent le statut DRAFT
- ✅ Client Prisma régénéré
- ✅ Fichier seed mis à jour pour créer des volumes avec statut PUBLISHED

**Distribution des statuts:**
- DRAFT: 5 volumes
- PUBLISHED: 75 volumes
- IN_PROGRESS: 0 volumes (sera utilisé pour les volumes programmés)

## Tests à effectuer

### Tests de l'interface de programmation

1. ✅ Vérifier que les chapitres PUBLISHED sont cliquables dans le drawer
   - **Résultat:** Les chapitres PUBLISHED ne sont plus grisés et peuvent être sélectionnés

2. ✅ Vérifier que les volumes (tous statuts) sont sélectionnables
   - **Résultat:** Tous les volumes DRAFT/IN_PROGRESS/PUBLISHED sont sélectionnables

3. ✅ Programmer un chapitre PUBLISHED
   - **Résultat:** Le chapitre garde son statut PUBLISHED et reçoit une scheduledFor

4. ✅ Programmer des volumes PUBLISHED
   - **Résultat:** Les volumes gardent leur statut PUBLISHED et reçoivent une scheduledFor

5. ⏳ Programmer des volumes DRAFT/IN_PROGRESS
   - **Attendu:** Le statut doit passer à IN_PROGRESS

### Tests du calendrier de publication

6. ✅ Vérifier que les éléments programmés s'affichent dans le calendrier
   - **Résultat:** Affichage groupé par chapitre avec système de repliement

7. ✅ Vérifier les dates de publication
   - **Résultat:** Les dates s'affichent correctement pour chaque élément

8. ⏳ Annuler une programmation
   - **Attendu:** Pour un chapitre/volume PUBLISHED → garde son statut mais perd sa scheduledFor
   - **Attendu:** Pour un chapitre/volume IN_PROGRESS → retour au statut DRAFT

### Tests de la publication automatique (cron)

9. ⏳ Simuler la publication automatique (processScheduledPublications)
   - **Attendu:** Seuls les éléments avec `status != PUBLISHED` et `scheduledFor <= now` sont traités

10. ⏳ Vérifier qu'un volume IN_PROGRESS devient PUBLISHED
    - **Attendu:** Le statut passe à PUBLISHED et publishedAt est défini

11. ⏳ Vérifier qu'un volume déjà PUBLISHED n'est PAS re-publié
    - **Attendu:** Le cron ignore les volumes avec `status = PUBLISHED`

### Tests côté lecteur (à effectuer)

12. ⏳ Vérifier qu'un volume PUBLISHED avec scheduledFor > now n'est pas lisible
    - **Attendu:** Volume visible dans la liste mais pas accessible à la lecture

13. ⏳ Vérifier qu'un volume PUBLISHED avec scheduledFor <= now est lisible
    - **Attendu:** Volume visible et accessible à la lecture

14. ⏳ Vérifier qu'un volume PUBLISHED sans scheduledFor est lisible immédiatement
    - **Attendu:** Volume visible et accessible à la lecture
