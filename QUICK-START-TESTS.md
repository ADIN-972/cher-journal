# 🚀 Démarrage Rapide - Tests du Système de Publication

Guide rapide pour tester le système de publication des chapitres et volumes.

---

## ⚡ Exécution Rapide (Méthode Automatique)

### Windows (PowerShell)
```powershell
cd apps/backend
.\run-all-tests.ps1
```

### Linux/Mac (Bash)
```bash
cd apps/backend
chmod +x run-all-tests.sh
./run-all-tests.sh
```

Le script exécute automatiquement:
1. ✅ Test de la publication automatique (cron)
2. ✅ Test de l'accès lecteur

---

## 🔧 Exécution Manuelle

Si vous préférez exécuter les tests individuellement:

### Test 1: Publication Automatique
```bash
cd apps/backend
npx tsx test-cron.ts
```

**Ce que ça teste:**
- Liste les volumes programmés
- Identifie ceux qui doivent être publiés
- Vérifie que les volumes PUBLISHED ne sont pas republiés

### Test 2: Accès Lecteur
```bash
cd apps/backend
npx tsx test-reader-access.ts
```

**Ce que ça teste:**
- Volumes accessibles (PUBLISHED + scheduledFor passé ou null)
- Volumes non accessibles (scheduledFor futur)
- Logique complète du reader service

---

## 📊 Résultats Attendus

### ✅ Tests Réussis

Vous devriez voir:
```
✅ Test cron terminé avec succès
✅ Test accès lecteur terminé avec succès
✅ Tous les tests sont passés avec succès!
```

### ❌ Tests Échoués

Si un test échoue, vérifiez:
1. **Base de données accessible?**
   ```bash
   npm run prisma:studio
   ```

2. **Migrations appliquées?**
   ```bash
   npm run prisma:migrate status
   ```

3. **Types Prisma à jour?**
   ```bash
   npm run prisma:generate
   ```

---

## 🧪 Tests via l'Interface Admin

Après avoir validé les scripts, testez via l'interface:

1. **Démarrer le serveur:**
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Ouvrir l'interface admin:**
   ```
   http://localhost:5174/admin/publishing-calendar
   ```

3. **Tester les fonctionnalités:**
   - ✅ Programmer un volume
   - ✅ Voir le calendrier
   - ✅ Annuler une programmation
   - ✅ Vérifier le regroupement par chapitre
   - ✅ Tester le repliement/dépliement

---

## 📝 Tests Manuels (SQL)

Pour tester avec SQL:

```bash
# Se connecter à la base
psql -U [USER] -d [DATABASE]

# Voir tous les volumes programmés
SELECT v.title, v.status, v."scheduledFor", c.title as chapter
FROM volumes v
JOIN chapters c ON v."chapterId" = c.id
WHERE v."scheduledFor" IS NOT NULL
ORDER BY v."scheduledFor";

# Voir les volumes accessibles au lecteur
SELECT v.title, v.status, v."scheduledFor"
FROM volumes v
WHERE v.status = 'PUBLISHED'
  AND (v."scheduledFor" IS NULL OR v."scheduledFor" <= NOW());
```

Plus de commandes dans `apps/backend/TEST-SQL-COMMANDS.sql`

---

## 🎯 Checklist de Validation

- [ ] Script `test-cron.ts` s'exécute sans erreur
- [ ] Script `test-reader-access.ts` s'exécute sans erreur
- [ ] Calendrier de publication s'affiche correctement
- [ ] Peut programmer un volume DRAFT (passe à IN_PROGRESS)
- [ ] Peut programmer un volume PUBLISHED (reste PUBLISHED)
- [ ] Peut annuler une programmation
- [ ] Les volumes avec date future ne sont pas accessibles côté lecteur
- [ ] Les volumes avec date passée sont accessibles côté lecteur

---

## 📚 Documentation Complète

Pour plus de détails:

| Fichier | Description |
|---------|-------------|
| `TEST-COMPLETE-GUIDE.md` | Guide complet avec 15 tests détaillés |
| `READER-IMPLEMENTATION.md` | Détails de l'implémentation côté lecteur |
| `IMPLEMENTATION-COMPLETE.md` | Résumé complet de l'implémentation |
| `apps/backend/README-TESTS.md` | Documentation des scripts de test |
| `GUIDE-TESTS-PUBLICATION.md` | Procédures de test backend |

---

## 🐛 Problèmes Courants

### "Cannot find module 'prisma'"
```bash
cd apps/backend
npm install
```

### "Database connection error"
Vérifier que PostgreSQL est démarré et accessible.

### "VolumeStatus is not defined"
```bash
cd apps/backend
npm run prisma:generate
```

### "No volumes found"
Vérifier qu'il y a des volumes dans la base:
```sql
SELECT COUNT(*) FROM volumes;
```

---

## ✅ Prochaines Étapes

Une fois tous les tests validés:

1. **Tests d'intégration** - Tester via l'API REST
2. **Tests de charge** - Vérifier les performances
3. **Configuration du cron** - Mettre en place en production
4. **Monitoring** - Configurer les alertes
5. **Documentation utilisateur** - Expliquer aux utilisateurs finaux

---

## 💡 Astuces

### Créer des données de test rapidement

```sql
-- Créer un volume de test avec date passée
UPDATE volumes
SET status = 'IN_PROGRESS',
    "scheduledFor" = NOW() - INTERVAL '1 hour'
WHERE id = (SELECT id FROM volumes WHERE status = 'DRAFT' LIMIT 1);

-- Créer un volume de test avec date future
UPDATE volumes
SET status = 'PUBLISHED',
    "scheduledFor" = NOW() + INTERVAL '1 day'
WHERE id = (SELECT id FROM volumes WHERE status = 'PUBLISHED' LIMIT 1);
```

### Réinitialiser un volume

```sql
UPDATE volumes
SET status = 'DRAFT',
    "scheduledFor" = NULL,
    "publishedAt" = NULL
WHERE id = '[ID]';
```

---

## 🎉 Félicitations!

Si tous les tests passent, votre système de publication est opérationnel! 🚀

Le système permet maintenant:
- ✅ Gestion des statuts (DRAFT, IN_PROGRESS, PUBLISHED)
- ✅ Programmation flexible des publications
- ✅ Publication automatique via cron
- ✅ Contrôle d'accès côté lecteur
- ✅ Interface intuitive avec calendrier

---

**Besoin d'aide?** Consultez `TEST-COMPLETE-GUIDE.md` pour des instructions détaillées.
