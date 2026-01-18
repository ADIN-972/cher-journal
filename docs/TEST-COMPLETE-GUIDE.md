# Guide de Test Complet - Système de Publication

## 📋 Vue d'ensemble

Ce guide couvre tous les tests nécessaires pour valider le système de publication des chapitres et volumes.

---

## 🛠️ Préparation

### 1. Installer les dépendances

```bash
cd apps/backend
npm install
```

### 2. S'assurer que la base de données est accessible

```bash
# Tester la connexion
npm run prisma:studio
```

---

## 🧪 Tests Backend (Admin)

### Test 1: Programmer un volume DRAFT

**Objectif:** Vérifier que le statut passe à IN_PROGRESS lors de la programmation

**Étapes:**
1. Trouver un volume DRAFT:
```sql
SELECT id, title, status, "chapterId"
FROM volumes
WHERE status = 'DRAFT'
LIMIT 1;
```

2. Via l'interface admin, programmer ce volume pour demain

3. Vérifier dans la base:
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status` = 'IN_PROGRESS'
- `scheduledFor` != null
- `publishedAt` = null

---

### Test 2: Programmer un volume PUBLISHED

**Objectif:** Vérifier que le statut reste PUBLISHED lors de la programmation

**Étapes:**
1. Trouver un volume PUBLISHED:
```sql
SELECT id, title, status, "chapterId"
FROM volumes
WHERE status = 'PUBLISHED'
LIMIT 1;
```

2. Via l'interface admin, programmer ce volume pour dans 2 jours

3. Vérifier dans la base:
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status` = 'PUBLISHED' (inchangé)
- `scheduledFor` != null
- `publishedAt` != null (inchangé)

---

### Test 3: Calendrier de publication

**Objectif:** Vérifier l'affichage du calendrier

**Étapes:**
1. Aller sur `/publishing-calendar`
2. Vérifier que les volumes programmés apparaissent
3. Vérifier le regroupement par chapitre
4. Tester le repliement/dépliement

**Résultat attendu:**
- Les volumes sont groupés par chapitre
- Le bouton "Tout déplier / Tout replier" fonctionne
- Les dates sont affichées correctement
- Les statuts sont affichés (DRAFT, IN_PROGRESS, PUBLISHED)

---

### Test 4: Annuler une programmation (volume PUBLISHED)

**Objectif:** Vérifier que le statut PUBLISHED est préservé

**Étapes:**
1. Programmer un volume PUBLISHED
2. Dans le calendrier, cliquer sur "Annuler"
3. Vérifier dans la base:
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status` = 'PUBLISHED' (inchangé)
- `scheduledFor` = null
- `publishedAt` != null (inchangé)

---

### Test 5: Annuler une programmation (volume IN_PROGRESS)

**Objectif:** Vérifier que le statut retourne à DRAFT

**Étapes:**
1. Programmer un volume DRAFT (qui passe à IN_PROGRESS)
2. Dans le calendrier, cliquer sur "Annuler"
3. Vérifier dans la base:
```sql
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID_DU_VOLUME]';
```

**Résultat attendu:**
- `status` = 'DRAFT'
- `scheduledFor` = null
- `publishedAt` = null

---

## 🤖 Tests du Cron (Publication Automatique)

### Test 6: Préparation des données de test

**Créer 4 volumes de test avec différentes configurations:**

```sql
-- Volume 1: DRAFT avec date passée (devrait être publié)
UPDATE volumes
SET
  status = 'DRAFT',
  "scheduledFor" = NOW() - INTERVAL '1 hour',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_1]';

-- Volume 2: IN_PROGRESS avec date passée (devrait être publié)
UPDATE volumes
SET
  status = 'IN_PROGRESS',
  "scheduledFor" = NOW() - INTERVAL '1 hour',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_2]';

-- Volume 3: PUBLISHED avec date passée (NE devrait PAS être republié)
UPDATE volumes
SET
  status = 'PUBLISHED',
  "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID_VOLUME_3]';

-- Volume 4: IN_PROGRESS avec date future (NE devrait PAS être publié)
UPDATE volumes
SET
  status = 'IN_PROGRESS',
  "scheduledFor" = NOW() + INTERVAL '1 day',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_4]';
```

---

### Test 7: Exécuter le script de test du cron

```bash
cd apps/backend
npx tsx test-cron.ts
```

**Vérifier l'output:**
- Le script doit lister tous les volumes avec scheduledFor
- Il doit identifier uniquement les volumes DRAFT et IN_PROGRESS avec date passée
- Les volumes PUBLISHED ne doivent PAS être dans la liste à publier

**Pour exécuter réellement la publication:**
1. Ouvrir `test-cron.ts`
2. Décommenter la section de publication
3. Relancer le script
4. Vérifier les résultats dans la base

**Résultats attendus après publication:**

```sql
-- Volume 1: Devrait être PUBLISHED
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes WHERE id = '[ID_VOLUME_1]';
-- Attendu: status = 'PUBLISHED', scheduledFor = null, publishedAt != null

-- Volume 2: Devrait être PUBLISHED
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes WHERE id = '[ID_VOLUME_2]';
-- Attendu: status = 'PUBLISHED', scheduledFor = null, publishedAt != null

-- Volume 3: Devrait être INCHANGÉ
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes WHERE id = '[ID_VOLUME_3]';
-- Attendu: status = 'PUBLISHED', scheduledFor = NOW() - 1h (inchangé)

-- Volume 4: Devrait être INCHANGÉ
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes WHERE id = '[ID_VOLUME_4]';
-- Attendu: status = 'IN_PROGRESS', scheduledFor = future (inchangé)
```

---

## 📖 Tests Côté Lecteur

### Test 8: Préparer les données de test

```sql
-- Créer 3 volumes de test
-- Volume A: PUBLISHED sans scheduledFor (accessible)
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NULL, "publishedAt" = NOW()
WHERE id = '[ID_VOLUME_A]';

-- Volume B: PUBLISHED avec scheduledFor futur (NON accessible)
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NOW() + INTERVAL '1 day', "publishedAt" = NOW()
WHERE id = '[ID_VOLUME_B]';

-- Volume C: PUBLISHED avec scheduledFor passé (accessible)
UPDATE volumes
SET status = 'PUBLISHED', "scheduledFor" = NOW() - INTERVAL '1 hour', "publishedAt" = NOW()
WHERE id = '[ID_VOLUME_C]';
```

---

### Test 9: Exécuter le script de test d'accès lecteur

```bash
cd apps/backend
npx tsx test-reader-access.ts
```

**Vérifier l'output:**
- Les volumes PUBLISHED sans scheduledFor doivent être listés comme accessibles
- Les volumes PUBLISHED avec scheduledFor futur ne doivent PAS être accessibles
- Les volumes PUBLISHED avec scheduledFor passé doivent être accessibles
- Le résumé final doit afficher le bon nombre de volumes accessibles

---

### Test 10: Tester les endpoints API

**Test 10a: Volume accessible**

```bash
# Tester l'accès à un volume PUBLISHED sans scheduledFor
curl -X GET "http://localhost:5174/api/reader/volume-version?chapterId=[ID]&volumeNumber=1&perspective=PROTAGONIST" \
  -H "Authorization: Bearer [TOKEN]"
```

**Résultat attendu:** 200 OK avec les données du volume

---

**Test 10b: Volume non accessible (scheduledFor futur)**

```bash
# Tester l'accès à un volume PUBLISHED avec scheduledFor futur
curl -X GET "http://localhost:5174/api/reader/volume-version?chapterId=[ID]&volumeNumber=2&perspective=PROTAGONIST" \
  -H "Authorization: Bearer [TOKEN]"
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VOLUME_NOT_AVAILABLE",
    "message": "Volume is not available yet or not published"
  }
}
```

---

**Test 10c: Liste des chapitres**

```bash
curl -X GET "http://localhost:5174/api/reader/catalog/chapters" \
  -H "Authorization: Bearer [TOKEN]"
```

**Vérifications:**
- Seuls les chapitres PUBLISHED avec scheduledFor passé ou null apparaissent
- Le compteur de volumes ne compte que les volumes accessibles

---

**Test 10d: Détails d'un chapitre**

```bash
curl -X GET "http://localhost:5174/api/reader/catalog/chapter/[ID]" \
  -H "Authorization: Bearer [TOKEN]"
```

**Vérifications:**
- La liste des volumes ne contient que les volumes accessibles
- Les volumes avec scheduledFor futur n'apparaissent pas

---

**Test 10e: Bibliothèque utilisateur**

```bash
curl -X GET "http://localhost:5174/api/reader/library" \
  -H "Authorization: Bearer [TOKEN]"
```

**Vérifications:**
- Les volumes programmés dans le futur n'apparaissent pas
- Les volumes accessibles sont correctement listés

---

## 📊 Tableau de Suivi des Tests

| # | Test | Statut | Notes |
|---|------|--------|-------|
| 1 | Programmer volume DRAFT | ⏳ | Status → IN_PROGRESS |
| 2 | Programmer volume PUBLISHED | ⏳ | Status reste PUBLISHED |
| 3 | Calendrier de publication | ⏳ | Affichage et UI |
| 4 | Annuler programmation PUBLISHED | ⏳ | Status préservé |
| 5 | Annuler programmation IN_PROGRESS | ⏳ | Status → DRAFT |
| 6 | Préparation données cron | ⏳ | 4 volumes de test |
| 7 | Exécution cron | ⏳ | Publication automatique |
| 8 | Préparation données lecteur | ⏳ | 3 volumes de test |
| 9 | Script test-reader-access.ts | ⏳ | Vérification logique |
| 10a | API: Volume accessible | ⏳ | 200 OK |
| 10b | API: Volume non accessible | ⏳ | 404 VOLUME_NOT_AVAILABLE |
| 10c | API: Liste chapitres | ⏳ | Filtrage correct |
| 10d | API: Détails chapitre | ⏳ | Volumes filtrés |
| 10e | API: Bibliothèque | ⏳ | Volumes accessibles |

---

## 🎯 Critères de Succès

### Backend Admin
✅ Les volumes DRAFT passent à IN_PROGRESS lors de la programmation
✅ Les volumes PUBLISHED conservent leur statut lors de la programmation
✅ Le calendrier affiche correctement les volumes programmés
✅ L'annulation préserve le statut PUBLISHED
✅ L'annulation retourne les volumes IN_PROGRESS à DRAFT

### Cron
✅ Seuls les volumes non-PUBLISHED avec date passée sont publiés
✅ Les volumes PUBLISHED ne sont jamais republiés
✅ Les volumes avec date future ne sont pas publiés

### Lecteur
✅ Seuls les volumes PUBLISHED avec scheduledFor passé ou null sont accessibles
✅ Les volumes avec scheduledFor futur ne sont pas visibles
✅ Les messages d'erreur sont clairs et appropriés
✅ La bibliothèque ne montre que les volumes accessibles

---

## 🚀 Exécution Rapide

Pour exécuter tous les tests rapidement:

```bash
# 1. Tests du cron
cd apps/backend
npx tsx test-cron.ts

# 2. Tests d'accès lecteur
npx tsx test-reader-access.ts

# 3. Vérification manuelle de l'interface
# - Ouvrir http://localhost:5174/admin/publishing-calendar
# - Tester la programmation
# - Tester l'annulation

# 4. Vérifier avec SQL
psql -U [USER] -d [DATABASE] -f TEST-SQL-COMMANDS.sql
```

---

## 📝 Notes Importantes

1. **Tokens d'authentification:** Pour les tests API, vous devez obtenir un token valide via l'endpoint de login

2. **IDs de test:** Remplacez tous les `[ID]` par des IDs réels de votre base de données

3. **Dates et heures:** Les tests avec des dates futures peuvent nécessiter d'attendre la date pour valider complètement

4. **Environnement:** Effectuez les tests sur un environnement de développement, jamais en production

5. **Sauvegarde:** Avant de modifier des données, faites une sauvegarde de votre base de données

---

## 🐛 Résolution de Problèmes

### Le cron ne publie pas les volumes

Vérifier:
- Le volume a bien `status != 'PUBLISHED'`
- La date `scheduledFor` est bien dans le passé
- Le service de scheduling fonctionne correctement

### Les volumes ne sont pas visibles côté lecteur

Vérifier:
- Le volume a bien `status = 'PUBLISHED'`
- La date `scheduledFor` est null ou dans le passé
- L'utilisateur a les bons droits (entitlements)

### Erreurs de type TypeScript

Vérifier:
- Les imports de `VolumeStatus` sont présents
- La génération Prisma est à jour: `npm run prisma:generate`

---

## ✅ Validation Finale

Une fois tous les tests passés, le système de publication est prêt pour:
- ✅ Gérer les statuts de volumes (DRAFT, IN_PROGRESS, PUBLISHED)
- ✅ Programmer des publications automatiques
- ✅ Contrôler l'accès aux volumes côté lecteur
- ✅ Afficher un calendrier de publication clair
- ✅ Préserver l'intégrité des données
