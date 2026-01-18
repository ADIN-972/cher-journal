-- ════════════════════════════════════════════════════════════════════════
-- Commandes SQL pour tester le système de publication
-- ════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. CONSULTATION - Voir l'état actuel
-- ─────────────────────────────────────────────────────────────────────────

-- Voir tous les volumes avec leur statut et programmation
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

-- Voir uniquement les volumes programmés
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  c.title as chapter_title,
  CASE
    WHEN v."scheduledFor" <= NOW() THEN 'Date passée ✅'
    WHEN v."scheduledFor" > NOW() THEN 'Date future ⏰'
  END as etat_date
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v."scheduledFor" IS NOT NULL
ORDER BY v."scheduledFor" ASC;

-- Voir les volumes par statut
SELECT
  status,
  COUNT(*) as count
FROM volumes
GROUP BY status;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. TEST 5 - Programmer des volumes DRAFT/IN_PROGRESS
-- ─────────────────────────────────────────────────────────────────────────

-- Trouver des volumes DRAFT disponibles
SELECT id, title, status, "chapterId"
FROM volumes
WHERE status = 'DRAFT'
LIMIT 5;

-- Après programmation via l'interface, vérifier qu'ils sont passés à IN_PROGRESS
-- Remplacer [ID] par l'ID d'un volume programmé
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID]';
-- Attendu: status = 'IN_PROGRESS', scheduledFor != null, publishedAt = null

-- ─────────────────────────────────────────────────────────────────────────
-- 3. TEST 8a - Annuler une programmation (volume PUBLISHED)
-- ─────────────────────────────────────────────────────────────────────────

-- Trouver un volume PUBLISHED avec scheduledFor
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE status = 'PUBLISHED' AND "scheduledFor" IS NOT NULL
LIMIT 1;

-- Après annulation via l'interface, vérifier
-- Remplacer [ID] par l'ID du volume
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID]';
-- Attendu: status = 'PUBLISHED' (inchangé), scheduledFor = null, publishedAt défini

-- ─────────────────────────────────────────────────────────────────────────
-- 4. TEST 8b - Annuler une programmation (volume IN_PROGRESS)
-- ─────────────────────────────────────────────────────────────────────────

-- Trouver un volume IN_PROGRESS avec scheduledFor
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE status = 'IN_PROGRESS' AND "scheduledFor" IS NOT NULL
LIMIT 1;

-- Après annulation via l'interface, vérifier
-- Remplacer [ID] par l'ID du volume
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes
WHERE id = '[ID]';
-- Attendu: status = 'DRAFT', scheduledFor = null, publishedAt = null

-- ─────────────────────────────────────────────────────────────────────────
-- 5. TESTS 9-11 - Préparation pour test du cron
-- ─────────────────────────────────────────────────────────────────────────

-- Créer des volumes de test avec différentes configurations

-- Volume DRAFT avec date passée (devrait être publié par le cron)
UPDATE volumes
SET
  status = 'DRAFT',
  "scheduledFor" = NOW() - INTERVAL '1 hour',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_DRAFT]';

-- Volume IN_PROGRESS avec date passée (devrait être publié par le cron)
UPDATE volumes
SET
  status = 'IN_PROGRESS',
  "scheduledFor" = NOW() - INTERVAL '1 hour',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_IN_PROGRESS]';

-- Volume PUBLISHED avec date passée (NE devrait PAS être republié)
UPDATE volumes
SET
  status = 'PUBLISHED',
  "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID_VOLUME_PUBLISHED]';

-- Volume IN_PROGRESS avec date future (NE devrait PAS être publié)
UPDATE volumes
SET
  status = 'IN_PROGRESS',
  "scheduledFor" = NOW() + INTERVAL '1 day',
  "publishedAt" = NULL
WHERE id = '[ID_VOLUME_FUTURE]';

-- Vérifier les volumes éligibles pour publication (ce que le cron devrait traiter)
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  v."publishedAt"
FROM volumes v
WHERE v."scheduledFor" <= NOW()
  AND v.status != 'PUBLISHED';
-- Ces volumes devraient être publiés par le cron

-- ─────────────────────────────────────────────────────────────────────────
-- 6. TESTS 12-14 - Accès lecteur
-- ─────────────────────────────────────────────────────────────────────────

-- Volumes accessibles au lecteur (logique complète)
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  c.title as chapter_title
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v.status = 'PUBLISHED'
  AND (
    v."scheduledFor" IS NULL
    OR v."scheduledFor" <= NOW()
  )
ORDER BY c.title, v."volumeNumber";

-- Volumes VISIBLES mais NON LISIBLES (PUBLISHED avec scheduledFor futur)
SELECT
  v.id,
  v."volumeNumber",
  v.title,
  v.status,
  v."scheduledFor",
  c.title as chapter_title
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v.status = 'PUBLISHED'
  AND v."scheduledFor" > NOW()
ORDER BY v."scheduledFor";

-- ─────────────────────────────────────────────────────────────────────────
-- 7. UTILITAIRES - Manipulation pour les tests
-- ─────────────────────────────────────────────────────────────────────────

-- Réinitialiser un volume pour refaire les tests
UPDATE volumes
SET
  status = 'DRAFT',
  "scheduledFor" = NULL,
  "publishedAt" = NULL
WHERE id = '[ID]';

-- Créer une date de test dans le passé (1 heure)
UPDATE volumes
SET "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = '[ID]';

-- Créer une date de test dans le futur (1 jour)
UPDATE volumes
SET "scheduledFor" = NOW() + INTERVAL '1 day'
WHERE id = '[ID]';

-- Mettre un volume en PUBLISHED avec une date future (pour tester visibilité sans accès)
UPDATE volumes
SET
  status = 'PUBLISHED',
  "publishedAt" = NOW(),
  "scheduledFor" = NOW() + INTERVAL '2 days'
WHERE id = '[ID]';

-- ─────────────────────────────────────────────────────────────────────────
-- 8. VÉRIFICATION - Statistiques
-- ─────────────────────────────────────────────────────────────────────────

-- Statistiques globales
SELECT
  'Total volumes' as categorie,
  COUNT(*) as count
FROM volumes
UNION ALL
SELECT
  'Status: ' || status,
  COUNT(*)
FROM volumes
GROUP BY status
UNION ALL
SELECT
  'Avec scheduledFor',
  COUNT(*)
FROM volumes
WHERE "scheduledFor" IS NOT NULL
UNION ALL
SELECT
  'PUBLISHED + scheduledFor futur',
  COUNT(*)
FROM volumes
WHERE status = 'PUBLISHED' AND "scheduledFor" > NOW();

-- Volumes programmés groupés par date
SELECT
  DATE("scheduledFor") as date_publication,
  COUNT(*) as nombre_volumes,
  STRING_AGG(v.title, ', ') as titres
FROM volumes v
WHERE "scheduledFor" IS NOT NULL
GROUP BY DATE("scheduledFor")
ORDER BY DATE("scheduledFor");
