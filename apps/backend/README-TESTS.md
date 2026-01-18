# Scripts de Test - Système de Publication

Ce dossier contient des scripts de test pour valider le système de publication des chapitres et volumes.

## 📁 Fichiers Disponibles

### Scripts TypeScript
- **test-cron.ts** - Test de la publication automatique (cron)
- **test-reader-access.ts** - Test de l'accès lecteur

### Fichiers SQL
- **TEST-SQL-COMMANDS.sql** - Commandes SQL utiles pour tests manuels

## 🚀 Utilisation

### 1. Test de la Publication Automatique (Cron)

Ce script teste la logique du cron qui publie automatiquement les volumes programmés.

```bash
cd apps/backend
npx tsx test-cron.ts
```

**Ce que fait le script:**
1. Liste tous les volumes avec une `scheduledFor` définie
2. Identifie les volumes éligibles pour publication (status != PUBLISHED et date passée)
3. Vérifie que les volumes PUBLISHED ne sont pas dans la liste
4. (Optionnel) Exécute la publication automatique

**Pour exécuter réellement la publication:**
1. Ouvrir `test-cron.ts`
2. Décommenter la section de publication (ligne ~77)
3. Relancer le script

**Résultat attendu:**
- Les volumes DRAFT/IN_PROGRESS avec date passée sont listés
- Les volumes PUBLISHED sont ignorés (même avec date passée)
- Les volumes avec date future ne sont pas traités

---

### 2. Test de l'Accès Lecteur

Ce script teste la logique d'accès aux volumes côté lecteur.

```bash
cd apps/backend
npx tsx test-reader-access.ts
```

**Ce que fait le script:**
1. Trouve les volumes PUBLISHED sans scheduledFor (accessibles)
2. Trouve les volumes PUBLISHED avec scheduledFor futur (NON accessibles)
3. Trouve les volumes PUBLISHED avec scheduledFor passé (accessibles)
4. Simule la logique complète du reader.service.ts
5. Affiche un résumé détaillé

**Résultat attendu:**
- Volumes avec scheduledFor = null → Accessibles ✅
- Volumes avec scheduledFor futur → NON accessibles ❌
- Volumes avec scheduledFor passé → Accessibles ✅
- Résumé final avec le nombre total de volumes accessibles

---

### 3. Commandes SQL Manuelles

Pour exécuter des tests SQL manuels:

```bash
# Se connecter à la base de données
psql -U [USER] -d [DATABASE]

# Copier-coller les commandes depuis TEST-SQL-COMMANDS.sql
```

**Catégories de commandes disponibles:**

1. **Consultation** - Voir l'état actuel
   - Tous les volumes avec leur statut
   - Volumes programmés
   - Statistiques par statut

2. **Tests 5-8** - Préparation et vérification
   - Test 5: Programmer volumes DRAFT
   - Test 8a: Annuler programmation PUBLISHED
   - Test 8b: Annuler programmation IN_PROGRESS

3. **Tests 9-11** - Préparation pour le cron
   - Créer des volumes de test avec différentes configurations
   - Vérifier les volumes éligibles

4. **Tests 12-14** - Accès lecteur
   - Volumes accessibles au lecteur
   - Volumes visibles mais non lisibles

5. **Utilitaires** - Manipulation pour tests
   - Réinitialiser un volume
   - Créer des dates de test
   - Mettre en PUBLISHED avec date future

6. **Statistiques** - Vue d'ensemble
   - Compteurs globaux
   - Volumes programmés par date

---

## 📋 Scénarios de Test Recommandés

### Scénario 1: Publication Progressive

```sql
-- 1. Créer 3 volumes DRAFT
UPDATE volumes SET status = 'DRAFT', "scheduledFor" = NULL WHERE id IN ('[ID1]', '[ID2]', '[ID3]');

-- 2. Les programmer à des dates différentes
UPDATE volumes SET status = 'IN_PROGRESS', "scheduledFor" = NOW() - INTERVAL '2 days' WHERE id = '[ID1]';
UPDATE volumes SET status = 'IN_PROGRESS', "scheduledFor" = NOW() - INTERVAL '1 day' WHERE id = '[ID2]';
UPDATE volumes SET status = 'IN_PROGRESS', "scheduledFor" = NOW() + INTERVAL '1 day' WHERE id = '[ID3]';

-- 3. Exécuter le script de test cron
-- npx tsx test-cron.ts

-- Résultat attendu:
-- - Volume 1 et 2 sont éligibles pour publication
-- - Volume 3 n'est pas encore éligible
```

---

### Scénario 2: Volume Publié avec Accès Différé

```sql
-- 1. Prendre un volume PUBLISHED
UPDATE volumes
SET status = 'PUBLISHED',
    "publishedAt" = NOW(),
    "scheduledFor" = NOW() + INTERVAL '3 days'
WHERE id = '[ID]';

-- 2. Vérifier l'accès lecteur
-- npx tsx test-reader-access.ts

-- Résultat attendu:
-- - Le volume n'apparaît PAS dans les volumes accessibles
-- - Il apparaît dans la section "NON accessibles" avec raison "scheduledFor futur"

-- 3. Simuler que la date est passée
UPDATE volumes SET "scheduledFor" = NOW() - INTERVAL '1 hour' WHERE id = '[ID]';

-- 4. Vérifier à nouveau l'accès
-- npx tsx test-reader-access.ts

-- Résultat attendu:
-- - Le volume apparaît maintenant dans les volumes accessibles
```

---

### Scénario 3: Annulation de Programmation

```sql
-- 1. Volume PUBLISHED programmé
UPDATE volumes
SET status = 'PUBLISHED',
    "scheduledFor" = NOW() + INTERVAL '1 week'
WHERE id = '[ID]';

-- 2. Via l'interface admin, annuler la programmation

-- 3. Vérifier le résultat
SELECT id, title, status, "scheduledFor", "publishedAt"
FROM volumes WHERE id = '[ID]';

-- Résultat attendu:
-- - status = 'PUBLISHED' (inchangé)
-- - scheduledFor = null
-- - publishedAt toujours défini
```

---

## 🔍 Debugging

### Si les tests échouent

1. **Vérifier la connexion à la base:**
```bash
npm run prisma:studio
```

2. **Vérifier les migrations:**
```bash
npm run prisma:migrate status
```

3. **Régénérer les types Prisma:**
```bash
npm run prisma:generate
```

4. **Vérifier les données:**
```sql
SELECT status, COUNT(*) FROM volumes GROUP BY status;
SELECT COUNT(*) FROM volumes WHERE "scheduledFor" IS NOT NULL;
```

---

### Logs Détaillés

Pour voir plus de détails pendant l'exécution:

1. Dans `test-cron.ts`: Les console.log sont déjà en place
2. Dans `test-reader-access.ts`: Affichage détaillé par défaut
3. Pour les requêtes Prisma, ajouter:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## ⚠️ Notes Importantes

### Environnement de Test

- **Ne jamais exécuter ces scripts en production**
- Utiliser une base de données de développement ou de test
- Faire une sauvegarde avant les tests destructifs

### Données de Test

Les scripts ne modifient PAS les données par défaut:
- `test-cron.ts` - Mode lecture seule (décommenter pour publier)
- `test-reader-access.ts` - Lecture seule
- `TEST-SQL-COMMANDS.sql` - Exécution manuelle nécessaire

### Permissions

Vérifier que vous avez les permissions nécessaires:
- Lecture sur les tables `volumes`, `chapters`
- Écriture si vous décommentez les sections de modification

---

## 📊 Résultats Attendus

### Test Cron Réussi ✅

```
=== Test Publication Automatique ===

Total volumes avec scheduledFor: 10

📊 État avant publication automatique:
Volume 1: Titre exemple
  Status: IN_PROGRESS
  ScheduledFor: 2026-01-17T10:00:00Z
  Date passée: ✅ OUI

Volume 5: Autre titre
  Status: PUBLISHED
  ScheduledFor: 2026-01-17T12:00:00Z
  Date passée: ✅ OUI (mais sera ignoré)

🔍 Éléments éligibles pour publication:
Volumes à publier: 3
  - Volume 1: Titre exemple (IN_PROGRESS)
  - Volume 2: Deuxième volume (DRAFT)
  - Volume 3: Troisième volume (IN_PROGRESS)

✅ Vérification: 2 volume(s) PUBLISHED ne seront PAS republiés
```

---

### Test Reader Access Réussi ✅

```
=== Test Accès Lecteur ===

📚 Test 1: Volumes PUBLISHED sans scheduledFor
Trouvé 45 volume(s)
✅ Volume 1: Premier volume
   → ACCESSIBLE pour la lecture

📚 Test 2: Volumes PUBLISHED avec scheduledFor futur
Trouvé 3 volume(s)
❌ Volume 10: Volume à venir
   → NON ACCESSIBLE (date future)

📚 Test 4: Simulation logique complète
📊 Total volumes accessibles: 52

📖 Chapitre 1: 10 volume(s)
   ✅ Volume 1: Premier volume (scheduledFor = null)
   ✅ Volume 2: Deuxième volume (scheduledFor <= now)

═══════════════════════════════════════════════════════
📊 RÉSUMÉ
═══════════════════════════════════════════════════════
✅ Volumes accessibles: 52
❌ Volumes non accessibles: 8
```

---

## 🚀 Prochaines Étapes

Après avoir validé ces tests:

1. **Tests d'intégration** - Tester via l'API REST
2. **Tests frontend** - Tester l'interface utilisateur
3. **Tests de charge** - Vérifier les performances
4. **Déploiement** - Appliquer en production

Pour plus de détails, voir:
- `../../TEST-COMPLETE-GUIDE.md` - Guide complet de tous les tests
- `../../READER-IMPLEMENTATION.md` - Détails de l'implémentation
- `../../IMPLEMENTATION-COMPLETE.md` - Vue d'ensemble complète
