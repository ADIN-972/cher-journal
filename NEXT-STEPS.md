# Prochaines étapes - Système de Publication

## ✅ Terminé (Commit 716281f)

### Migration et Backend
- [x] Enum `VolumeStatus` créé
- [x] Champ `status` ajouté aux volumes
- [x] 75 volumes existants migrés vers PUBLISHED
- [x] Programmation flexible des chapitres/volumes PUBLISHED
- [x] Service de scheduling complet avec cron

### Interface Admin
- [x] Drawer de programmation avec sélection flexible
- [x] Calendrier de publication groupé par chapitre
- [x] Système de repliement/dépliement
- [x] Affichage des statuts et dates

### Documentation
- [x] Guide de migration complet
- [x] Documentation de la fonctionnalité
- [x] Guide de tests détaillé
- [x] Résumé de session

## 🔄 Tests en cours

### À tester manuellement

**Test 5: Programmer un volume DRAFT**
```sql
-- Trouver un volume DRAFT
SELECT id, title, status FROM volumes WHERE status = 'DRAFT' LIMIT 1;

-- Après programmation via l'interface, vérifier:
SELECT id, title, status, "scheduledFor" FROM volumes WHERE id = '[ID]';
-- Attendu: status = 'IN_PROGRESS', scheduledFor != null
```

**Test 8: Annuler une programmation**

a) Volume PUBLISHED programmé:
```sql
-- Vérifier avant annulation
SELECT id, title, status, "scheduledFor", "publishedAt" FROM volumes WHERE id = '[ID]';

-- Après annulation via interface:
-- Attendu: status = 'PUBLISHED' (inchangé), scheduledFor = null
```

b) Volume IN_PROGRESS programmé:
```sql
-- Après annulation:
-- Attendu: status = 'DRAFT', scheduledFor = null
```

**Tests 9-11: Publication automatique (Cron)**

Créer un script de test `apps/backend/test-cron.ts`:
```typescript
import { schedulingService } from './src/modules/admin/scheduling/scheduling.service';

async function testPublicationCron() {
  console.log('=== Test Publication Automatique ===\n');

  // 1. Obtenir les éléments à publier
  const due = await schedulingService.getDueForPublication();
  console.log(`Chapitres à publier: ${due.chapters.length}`);
  console.log(`Volumes à publier: ${due.volumes.length}\n`);

  // 2. Afficher les détails
  due.volumes.forEach(v => {
    console.log(`Volume ${v.volumeNumber}: ${v.title}`);
    console.log(`  Status: ${v.status}`);
    console.log(`  ScheduledFor: ${v.scheduledFor}`);
  });

  // 3. Publier (décommenter après vérification)
  /*
  for (const volume of due.volumes) {
    await schedulingService.publishVolume(volume.id);
    console.log(`✅ Volume ${volume.id} publié`);
  }
  */
}

testPublicationCron().catch(console.error);
```

Exécuter:
```bash
cd apps/backend
npx tsx test-cron.ts
```

## ✅ Implémenté - Côté Lecteur

### Fichiers modifiés:

1. **`apps/backend/src/modules/reader/reader/reader.service.ts`**
2. **`apps/backend/src/modules/reader/reader/reader.controller.ts`**
3. **`apps/backend/src/modules/reader/catalog/catalog.service.ts`**
4. **`apps/backend/src/modules/reader/library/library.service.ts`**

Voir le fichier **`READER-IMPLEMENTATION.md`** pour les détails complets.

### Exemple de modification dans `reader.service.ts`:

```typescript
async getVolume(
  chapterId: string,
  volumeNumber: number,
  perspective: Perspective
) {
  const volume = await prisma.volume.findFirst({
    where: {
      chapterId,
      volumeNumber,
      status: 'PUBLISHED', // ✅ Doit être publié
      OR: [
        { scheduledFor: null }, // ✅ Sans date → lisible
        { scheduledFor: { lte: new Date() } } // ✅ Date passée → lisible
      ]
    },
    include: {
      illustrationAsset: true,
      versions: {
        where: { perspective },
        include: {
          illustrationAsset: true,
        },
      },
    },
  });

  if (!volume) {
    throw new Error('VOLUME_NOT_AVAILABLE');
  }

  return this.serializeVolume(volume);
}
```

**Modifier la méthode `listChapters()` :**

```typescript
async listChapters() {
  const chapters = await prisma.chapter.findMany({
    where: {
      status: 'PUBLISHED', // ✅ Chapitres publiés seulement
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
      ]
    },
    include: {
      coverAsset: true,
      volumes: {
        where: {
          status: 'PUBLISHED', // ✅ Volumes publiés seulement
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } }
          ]
        },
        orderBy: { volumeNumber: 'asc' },
      },
    },
  });

  return chapters.map(ch => this.serializeChapter(ch));
}
```

### Tests côté lecteur

Créer `apps/backend/test-reader-access.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testReaderAccess() {
  console.log('=== Test Accès Lecteur ===\n');

  // Test 1: Volume PUBLISHED sans scheduledFor
  const volumeA = await prisma.volume.findFirst({
    where: {
      status: 'PUBLISHED',
      scheduledFor: null,
    }
  });
  console.log('✅ Volume A (PUBLISHED, scheduledFor=null):', volumeA?.title);

  // Test 2: Volume PUBLISHED avec scheduledFor futur
  const volumeB = await prisma.volume.findFirst({
    where: {
      status: 'PUBLISHED',
      scheduledFor: { gt: new Date() }
    }
  });
  console.log('❌ Volume B (PUBLISHED, scheduledFor>now):', volumeB?.title);

  // Test 3: Volume PUBLISHED avec scheduledFor passé
  const volumeC = await prisma.volume.findFirst({
    where: {
      status: 'PUBLISHED',
      scheduledFor: { lte: new Date() }
    }
  });
  console.log('✅ Volume C (PUBLISHED, scheduledFor<=now):', volumeC?.title);

  // Test avec la logique complète
  const accessibleVolumes = await prisma.volume.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } }
      ]
    }
  });

  console.log(`\n📚 Volumes accessibles: ${accessibleVolumes.length}`);
}

testReaderAccess().catch(console.error);
```

## 🎨 Améliorations futures (optionnel)

1. **Notifications automatiques**
   - Email aux abonnés X jours avant la publication d'un volume
   - Notification push pour les nouveaux volumes disponibles

2. **Calendrier visuel**
   - Vue calendrier mensuel avec les dates de publication
   - Timeline interactive des sorties à venir

3. **Preview mode**
   - Permettre aux admins de prévisualiser les volumes programmés
   - Lien de partage temporaire pour les bêta-testeurs

4. **Statistiques de publication**
   - Graphique de l'historique des publications
   - Analyse de l'impact des dates de sortie sur les ventes

5. **Republication**
   - Permettre de re-programmer la date d'un volume déjà publié
   - Historique des dates de publication

## 📋 Checklist finale

- [ ] Exécuter les tests manuels (Test 1-5)
- [x] Implémenter la logique côté lecteur
- [x] Créer les scripts de test (test-cron.ts, test-reader-access.ts)
- [ ] Exécuter les tests automatiques
- [ ] Tester l'accès depuis l'interface lecteur
- [ ] Vérifier les performances avec beaucoup de volumes programmés
- [ ] Documenter l'API de scheduling pour les développeurs
- [ ] Créer un job cron dans le système de production
- [ ] Mettre en place des alertes pour les publications échouées

## 🔗 Fichiers de référence

- `MIGRATION-VOLUME-STATUS.md` - Guide de migration et tests
- `FEATURE-SCHEDULED-PUBLISHED-VOLUMES.md` - Documentation de la fonctionnalité
- `GUIDE-TESTS-PUBLICATION.md` - Procédures de test détaillées
- `READER-IMPLEMENTATION.md` - ✅ Implémentation côté lecteur (NOUVEAU)
- `TEST-COMPLETE-GUIDE.md` - ✅ Guide complet de tests (NOUVEAU)
- `RESUME-SESSION.md` - Résumé complet de la session

## 🧪 Scripts de test disponibles

- `apps/backend/test-cron.ts` - ✅ Tester la publication automatique (cron)
- `apps/backend/test-reader-access.ts` - ✅ Tester l'accès lecteur
- `apps/backend/TEST-SQL-COMMANDS.sql` - ✅ Commandes SQL utiles

## 💡 Commandes utiles

**Voir les volumes programmés:**
```sql
SELECT v.title, v.status, v."scheduledFor", c.title as chapter
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v."scheduledFor" IS NOT NULL
ORDER BY v."scheduledFor";
```

**Créer un volume de test programmé:**
```sql
INSERT INTO volumes (id, "chapterId", "volumeNumber", title, status, "scheduledFor")
VALUES (
  gen_random_uuid(),
  '[ID_CHAPITRE]',
  999,
  'Volume de Test',
  'IN_PROGRESS',
  NOW() + INTERVAL '1 hour'
);
```

**Simuler une date dans le passé:**
```sql
UPDATE volumes
SET "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID]';
```
