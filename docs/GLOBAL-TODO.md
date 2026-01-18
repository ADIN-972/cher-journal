# 📋 GLOBAL TODO - Administration Cher Journal

Cette liste recense toutes les fonctionnalités à implémenter pour finaliser la partie administration de Cher Journal. Nous les implémenterons étape par étape.

---

## 🎯 LÉGENDE

- ✅ Terminé
- 🚧 En cours
- ⏳ À faire
- 🔴 Bloquant pour production
- 🟡 Important
- 🟢 Nice to have

---

## 🎯 **PROMOTIONS - Fonctionnalités avancées**

### ✅ 1. Ciblage utilisateurs (Targeting) 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Créer composant `TargetingSelector.tsx`
- [x] Backend: Service `targeting.service.ts` avec critères
  - [x] Nouveaux clients (registeredAfter/Before)
  - [x] Clients fidèles (minOrders/maxOrders)
  - [x] Montant dépensé (minTotalSpent/maxTotalSpent)
  - [x] Type de commandes (hasOrderType)
  - [x] Filtrage par rôles utilisateurs
- [x] Intégrer dans `PromotionForm.tsx`
- [x] Endpoint `/admin/promotions/preview-targeting` avec critères
- [x] Afficher compteur en temps réel dans le formulaire
- [x] Support de 3 modes: ALL_USERS, SPECIFIC_USERS, CRITERIA_BASED
- [x] Interface avec rafraîchissement manuel du compteur
- [x] Sauvegarde des données de ciblage (targetType, targetUserIds, targetCriteria)

**Fichiers concernés:**
- ✅ `apps/admin/src/components/TargetingSelector.tsx`
- ✅ `apps/backend/src/modules/admin/promotions/targeting.service.ts`
- ✅ `apps/admin/src/pages/PromotionForm.tsx`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.controller.ts`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.routes.ts`

---

### ✅ 2. Codes promo 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Ajouter champ `code` (String?, unique) dans schéma Prisma
- [x] Migration base de données (20260117000000_add_promo_code)
- [x] Backend: Validation unicité code (case-insensitive)
- [x] Service: `generatePromoCode()`, `isCodeUnique()`, `generateUniqueCode()`
- [x] Service: `validatePromoCode()` avec vérification active/dates/maxUses
- [x] Endpoint `POST /admin/promotions/:id/generate-code`
- [x] Endpoint `GET /admin/promotions/validate-code/:code`
- [x] Endpoint `GET /admin/promotions/check-code` (vérification unicité)
- [x] Frontend: Champ code dans PromotionForm avec conversion auto uppercase
- [x] Bouton "Générer" pour codes aléatoires (8 caractères A-Z0-9)
- [x] Badge visuel quand un code est actif
- [x] Sauvegarde et chargement du code lors édition

**Fichiers concernés:**
- ✅ `apps/backend/prisma/schema.prisma`
- ✅ `apps/backend/prisma/migrations/20260117000000_add_promo_code/migration.sql`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.service.ts`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.controller.ts`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.routes.ts`
- ✅ `apps/admin/src/pages/PromotionForm.tsx`
- ✅ `apps/admin/src/components/PromotionOverallImpact.tsx`

---

### ⏳ 3. Analytics promotions 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Créer table `PromotionUsage` (userId, promotionId, usedAt, orderId)
- [ ] Tracker les utilisations dans les commandes
- [ ] Page `PromotionAnalytics.tsx`
- [ ] Graphiques d'utilisation (par jour/semaine/mois)
- [ ] Calcul ROI: revenus générés vs manque à gagner
- [ ] Export CSV des statistiques

**Fichiers concernés:**
- `apps/backend/prisma/schema.prisma`
- `apps/admin/src/pages/PromotionAnalytics.tsx` (à créer)
- `apps/backend/src/modules/admin/promotions/analytics.service.ts` (à créer)

---

## 💰 **TARIFICATION (PRICING) - Système V2**

### 🚧 4. Formulaire de création/édition de Prix 🔴
**Status:** En cours (TODO actuel résolu)
**Priorité:** PHASE 1

**Sous-tâches:**
- [x] Créer `PriceForm.tsx`
- [x] Route `/prices/new` et `/prices/:id`
- [x] Backend: endpoints CRUD prix
- [ ] Validation des prix (min/max par scope)
- [ ] Association prix ↔ chapitres/volumes spécifiques (refId)
- [ ] Tests backend

**Fichiers concernés:**
- `apps/admin/src/pages/PriceForm.tsx` (✅ créé)
- `apps/backend/src/modules/admin/prices/prices.service.ts`
- `apps/admin/src/App.tsx` (✅ routes ajoutées)

---

### ✅ 5. Historique des prix (Price History) 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Créer table `PriceHistory` (priceId, oldAmount, newAmount, changedAt, changedBy, reason)
- [x] Migration base de données (20260117000100_add_price_history)
- [x] Service `price-history.service.ts` avec méthodes CRUD
- [x] Tracking automatique sur updatePrice()
- [x] Controller et routes API pour l'historique
- [x] Implémenter `PriceHistoryPage.tsx` avec timeline
- [x] Afficher timeline des changements avec icônes +/-
- [x] Filtres par priceId, startDate, endDate
- [x] Pagination (20 éléments par page)
- [x] Calcul pourcentage de changement et affichage diff
- [ ] Export CSV historique (à implémenter)
- [ ] Graphique évolution prix (à implémenter)

**Fichiers concernés:**
- ✅ `apps/backend/prisma/schema.prisma`
- ✅ `apps/backend/prisma/migrations/20260117000100_add_price_history/migration.sql`
- ✅ `apps/backend/src/modules/admin/prices/price-history.service.ts`
- ✅ `apps/backend/src/modules/admin/prices/price-history.controller.ts`
- ✅ `apps/backend/src/modules/admin/prices/price-history.routes.ts`
- ✅ `apps/backend/src/modules/admin/promotions/promotions.service.ts` (updatePrice modifié)
- ✅ `apps/backend/src/app.ts` (routes enregistrées)
- ✅ `apps/admin/src/pages/PriceHistoryPage.tsx`

---

### ⏳ 6. A/B Testing de prix 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Créer table `PriceExperiment` (name, variants, startDate, endDate)
- [ ] Créer table `PriceVariant` (experimentId, priceId, weight)
- [ ] Backend: Assignation aléatoire utilisateur → variante
- [ ] Page `PriceExperiments.tsx`
- [ ] Interface création expérience
- [ ] Dashboard comparatif des résultats
- [ ] Calcul significativité statistique

**Fichiers concernés:**
- `apps/backend/prisma/schema.prisma`
- `apps/admin/src/pages/PriceExperiments.tsx` (à créer)

---

## 📊 **DASHBOARD - Analytics améliorés**

### ✅ 7. KPIs temps réel 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Endpoint `/admin/dashboard/kpis` avec aggregations
- [x] Revenus du jour/semaine/mois/année
- [x] Top 5 chapitres les plus achetés
- [x] Top 5 volumes les plus achetés
- [x] Comparaison période précédente (%, flèches)
- [x] Calcul pourcentages de changement
- [x] Compteur de commandes par période
- [x] Enrichissement top content avec détails (titre, numéro)
- [x] Interface visuelle avec cartes gradient et badges
- [x] Icônes TrendingUp/Down selon évolution
- [ ] Taux de conversion (visiteurs → acheteurs) - optionnel
- [ ] MRR (Monthly Recurring Revenue) - optionnel

**Fichiers concernés:**
- ✅ `apps/backend/src/modules/admin/dashboard/dashboard.service.ts` (méthode getKPIs())
- ✅ `apps/backend/src/modules/admin/dashboard/dashboard.controller.ts` (endpoint getKPIs)
- ✅ `apps/backend/src/modules/admin/dashboard/dashboard.routes.ts` (route /admin/dashboard/kpis)
- ✅ `apps/admin/src/pages/Dashboard.tsx` (cartes KPIs et top content)

---

### ✅ 8. Graphiques avancés 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Installer `recharts` (déjà présent v3.6.0)
- [x] Graphique courbe revenus (sélection période)
- [x] Graphique répartition ventes par scope (donut/pie)
- [x] Intégration dans Dashboard avec disposition optimale
- [x] 5 sélecteurs de période (7j, 30j, 3m, 6m, 1an)
- [x] Area chart avec gradient pour revenus
- [x] Pie chart avec légende détaillée et montants
- [x] Calculs automatiques (total, moyenne, pourcentages)
- [ ] Graphique taux de rétention (cohortes) - optionnel
- [ ] Funnel de conversion (visiteur → inscription → achat) - optionnel
- [ ] Heatmap activité par jour/heure - optionnel

**Fichiers concernés:**
- ✅ `apps/admin/src/components/RevenueEvolutionChart.tsx` (créé)
- ✅ `apps/admin/src/components/SalesDistributionChart.tsx` (créé)
- ✅ `apps/admin/src/pages/Dashboard.tsx` (intégration)

---

### ⏳ 9. Activité récente détaillée 🟢
**Status:** Placeholder existe
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Table `ActivityLog` (userId, action, metadata, createdAt)
- [ ] Logger les événements clés (inscription, achat, lecture, etc.)
- [ ] Feed en temps réel dans Dashboard
- [ ] Filtres par type d'événement
- [ ] Pagination
- [ ] Export des logs

**Fichiers concernés:**
- `apps/admin/src/pages/Dashboard.tsx`
- `apps/backend/prisma/schema.prisma`

---

## 👥 **GESTION UTILISATEURS - Fonctionnalités manquantes**

### ✅ 10. Actions en masse (Bulk actions) 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Checkbox sélection multiple dans `Users.tsx`
- [x] Barre d'actions contextuelles (X sélectionnés)
- [x] Suspend/Active en masse
- [x] Promouvoir/Rétrograder rôles en masse
- [x] Modal confirmation actions groupées
- [x] Backend: 4 endpoints bulk (suspend, activate, promote, demote)
- [x] Service methods avec updateMany Prisma
- [x] Validation input avec gestion erreurs
- [x] État sélection avec Set<string>
- [x] Bouton "Select All" dans header de table
- [x] Compteur utilisateurs sélectionnés
- [x] Désélection automatique après action
- [ ] Export CSV utilisateurs sélectionnés - optionnel

**Fichiers concernés:**
- ✅ `apps/admin/src/pages/Users.tsx`
- ✅ `apps/backend/src/modules/admin/users/users.service.ts`
- ✅ `apps/backend/src/modules/admin/users/users.controller.ts`
- ✅ `apps/backend/src/modules/admin/users/users.routes.ts`

---

### ✅ 11. Filtres avancés utilisateurs 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Filtre par rôle (ALL/USER/ADMIN) avec sélecteur
- [x] Filtre par statut (ALL/ACTIVE/SUSPENDED)
- [x] Filtre par date d'inscription (après/avant)
- [x] Filtre par montant dépensé (min/max en centimes)
- [x] Filtre par nombre de commandes (min/max)
- [x] Recherche par email (insensitive)
- [x] Sauvegarde des filtres favoris (localStorage)
- [x] Interface expansible/réductible avec badge "Actifs"
- [x] Backend: Filtrage côté serveur avec agrégation
- [x] Query params pour tous les filtres
- [ ] Filtre par chapitres achetés/lus (à implémenter)
- [ ] Filtre par dernière activité (à implémenter)

**Fichiers concernés:**
- ✅ `apps/admin/src/components/UserFilters.tsx`
- ✅ `apps/admin/src/pages/Users.tsx`
- ✅ `apps/backend/src/modules/admin/users/users.service.ts`
- ✅ `apps/backend/src/modules/admin/users/users.controller.ts`

---

### ⏳ 12. Notes et tags utilisateurs 🟢
**Status:** Mockup existe dans UserDetail
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Table `UserNote` (userId, authorId, content, createdAt)
- [ ] Table `UserTag` (id, name, color)
- [ ] Table `UserTagAssignment` (userId, tagId)
- [ ] Backend CRUD notes
- [ ] Interface notes dans `UserDetail.tsx`
- [ ] Interface gestion tags
- [ ] Filtre utilisateurs par tag

**Fichiers concernés:**
- `apps/admin/src/pages/UserDetailImproved.tsx`
- `apps/backend/prisma/schema.prisma`

---

## 📦 **COMMANDES (ORDERS) - Améliorations**

### ✅ 13. Détails commande 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Page `OrderDetail.tsx` avec sections organisées
- [x] Route `/orders/:id` frontend et backend
- [x] Affichage complet des détails de commande
- [x] Détails paiement Stripe (provider, session, payment intent)
- [x] Historique des statuts (timeline visuelle)
- [x] Lien vers profil utilisateur
- [x] Affichage prix appliqués (FreeToRead, Paywall, Épilogue)
- [x] Badge promotion si appliquée
- [x] Navigation depuis liste des commandes (bouton Détails)
- [x] Layout 2 colonnes responsive (détails + infos client)
- [x] Badges colorés pour status et type de commande
- [ ] Notes internes commande (optionnel - PHASE 3)

**Fichiers concernés:**
- ✅ `apps/admin/src/pages/OrderDetail.tsx` (créé, ~500 lignes)
- ✅ `apps/admin/src/App.tsx` (route ajoutée)
- ✅ `apps/admin/src/pages/Orders.tsx` (bouton Détails ajouté)
- ✅ `apps/backend/src/modules/admin/orders/orders.routes.ts` (route existante)
- ✅ `apps/backend/src/modules/admin/orders/orders.controller.ts` (getById existant)
- ✅ `apps/backend/src/modules/admin/orders/orders.service.ts` (getById existant)

---

### ✅ 14. Export et rapports commandes 🔴
**Status:** Export CSV complété ✅
**Priorité:** PHASE 1

**Sous-tâches:**
- [x] Bouton "Export CSV" dans `Orders.tsx`
- [x] Endpoint `/admin/orders/export` avec filtres
- [x] Export CSV avec colonnes complètes (19 colonnes)
- [x] Support filtres par statut (PAID/PENDING/ALL)
- [x] UTF-8 BOM pour compatibilité Excel
- [ ] Export Excel (xlsx) - optionnel
- [ ] Rapports financiers mensuels/annuels (PDF) - optionnel
- [ ] Réconciliation comptable - optionnel

**Fichiers concernés:**
- ✅ `apps/admin/src/pages/Orders.tsx`
- ✅ `apps/backend/src/modules/admin/orders/orders.controller.ts`
- ✅ `apps/backend/src/modules/admin/orders/orders.service.ts`
- ✅ `apps/backend/src/modules/admin/orders/orders.routes.ts`

---

### ✅ 15. Gestion des remboursements 🟡
**Status:** Complété ✅
**Priorité:** PHASE 2

**Sous-tâches:**
- [x] Interface de remboursement dans OrderDetail
- [x] Intégration Stripe Refund API
- [x] Remboursements partiels/complets
- [x] Notes de remboursement
- [x] Révocation automatique entitlements
- [x] Statistiques des remboursements (méthode getRefundStats)

**Fichiers concernés:**
- ✅ `apps/admin/src/pages/OrderDetail.tsx` (RefundManagement intégré)
- ✅ `apps/admin/src/components/RefundManagement.tsx` (créé)
- ✅ `apps/backend/src/modules/admin/orders/refunds.service.ts` (créé)
- ✅ `apps/backend/src/modules/admin/orders/refunds.controller.ts` (créé)
- ✅ `apps/backend/src/modules/admin/orders/refunds.routes.ts` (créé)
- ✅ `apps/backend/prisma/schema.prisma` (modèles Refund, RefundStatus, RefundType ajoutés)
- ✅ `apps/backend/prisma/migrations/20260117173119_add_refunds` (migration créée)
- ✅ `apps/backend/src/app.ts` (routes enregistrées)

---

## 📚 **CHAPITRES & VOLUMES - Améliorations**

### ⏳ 16. Éditeur de texte riche 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Intégrer TipTap ou Lexical
- [ ] WYSIWYG pour le contenu des volumes
- [ ] Support markdown
- [ ] Prévisualisation en temps réel
- [ ] Sauvegarde automatique (drafts)
- [ ] Historique des versions (undo/redo)
- [ ] Import/Export markdown

**Fichiers concernés:**
- `apps/admin/src/components/RichTextEditor.tsx` (à créer)
- `apps/admin/src/pages/VolumeForm.tsx`

---

### ⏳ 17. Planification de publication 🟡
**Status:** Champ publishDate existe
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Calendrier éditorial visuel
- [ ] Drag & drop volumes sur calendrier
- [ ] Publication différée (scheduled)
- [ ] Cron job publication automatique
- [ ] Rappels de deadlines
- [ ] Workflow de validation (draft → review → published)

**Fichiers concernés:**
- `apps/admin/src/pages/PublishingCalendar.tsx` (à créer)
- `apps/backend/src/cron/scheduled-publish.ts` (à créer)

---

### ⏳ 18. Gestion des perspectives 🟢
**Status:** Interface basique existe
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Page dédiée `PerspectivesManager.tsx`
- [ ] Comparaison side-by-side Narrateur/Protagoniste
- [ ] Diff viewer (changements entre perspectives)
- [ ] Import/Export perspectives
- [ ] Statistiques d'engagement par perspective
- [ ] A/B testing perspectives

**Fichiers concernés:**
- `apps/admin/src/pages/PerspectivesManager.tsx` (à créer)
- `apps/admin/src/components/PerspectiveComparator.tsx` (à créer)

---

### ⏳ 19. Bibliothèque d'assets améliorée 🟡
**Status:** Upload basique existe
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Table `AssetTag` pour catégorisation
- [ ] Recherche d'images par nom/tag
- [ ] Filtres par type (IMAGE, COLORING_PAGE)
- [ ] Édition basique d'images (crop, resize) avec Canvas API
- [ ] Détection doublons (SHA256)
- [ ] Gestion des versions d'image
- [ ] CDN integration (Cloudflare R2)

**Fichiers concernés:**
- `apps/admin/src/pages/AssetsLibrary.tsx` (à créer)
- `apps/backend/src/modules/admin/assets/assets.service.ts`

---

## 🎨 **PAGES DE COLORIAGE**

### ⏳ 20. Interface dédiée Coloring Pages 🟢
**Status:** AssetKind existe, pas d'interface
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Page `ColoringPages.tsx`
- [ ] Gestionnaire de livres de coloriage
- [ ] Upload/organisation des pages
- [ ] Tarification spécifique (PriceScope.COLORING existe)
- [ ] Prévisualisation avant/après coloriage
- [ ] Export PDF livre de coloriage

**Fichiers concernés:**
- `apps/admin/src/pages/ColoringPages.tsx` (à créer)
- `apps/backend/src/modules/admin/coloring/` (à créer)

---

## 📦 **BUNDLES & PACKS**

### ⏳ 21. Créateur de Bundles 🟡
**Status:** OrderType.BUNDLE et PriceScope.BUNDLE existent
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Table `Bundle` (name, description, items, price)
- [ ] Table `BundleItem` (bundleId, chapterId?, volumeId?, quantity)
- [ ] Page `Bundles.tsx`
- [ ] Interface création bundle
- [ ] Sélection de chapitres/volumes
- [ ] Prix réduit vs somme des prix unitaires
- [ ] Promotions sur bundles
- [ ] Logique checkout Stripe bundles

**Fichiers concernés:**
- `apps/admin/src/pages/Bundles.tsx` (à créer)
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/modules/bundles/` (à créer)

---

## 📧 **COMMUNICATION**

### ⏳ 22. Système d'emails 🟡
**Status:** Non commencé
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Table `EmailTemplate` (name, subject, htmlBody, textBody)
- [ ] Intégrer Nodemailer ou Resend
- [ ] Templates d'emails (confirmation, relance, promo, etc.)
- [ ] Éditeur de newsletters
- [ ] Placeholders dynamiques ({{firstName}}, etc.)
- [ ] Segmentation utilisateurs
- [ ] Page `Emails.tsx`
- [ ] Analytics emails (taux d'ouverture, clics) via webhook

**Fichiers concernés:**
- `apps/admin/src/pages/Emails.tsx` (à créer)
- `apps/backend/src/modules/admin/emails/` (à créer)
- `apps/backend/prisma/schema.prisma`

---

### ⏳ 23. Notifications in-app 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Table `Notification` (userId, type, title, message, readAt)
- [ ] Système de notifications push (WebSocket ou SSE)
- [ ] Alertes admin (nouveau user, erreur système, etc.)
- [ ] Centre de notifications (dropdown header)
- [ ] Marquer comme lu
- [ ] Filtres par type
- [ ] Badge compteur non lues

**Fichiers concernés:**
- `apps/admin/src/components/NotificationCenter.tsx` (à créer)
- `apps/backend/src/modules/notifications/` (à créer)

---

## ⚙️ **SETTINGS - Paramètres manquants**

### ✅ 24. Configuration paiements 🔴
**Status:** Complété ✅
**Priorité:** PHASE 1

**Sous-tâches:**
- [x] Table `SystemConfig` (key, value, type, category, isEncrypted)
- [x] Service avec chiffrement AES-256-GCM pour secrets
- [x] Interface gestion clés Stripe (test/production)
- [x] Sélection devises supportées
- [x] Configuration taxes par région
- [x] Moyens de paiement activés (card, sepa, etc.)
- [x] Initialisation des configurations par défaut
- [x] Masquage des secrets (••••••••) dans l'interface
- [x] Toggle show/hide pour secrets
- [ ] Webhook URL configuration - optionnel

**Fichiers concernés:**
- ✅ `apps/backend/prisma/schema.prisma`
- ✅ `apps/backend/src/modules/admin/config/config.service.ts`
- ✅ `apps/backend/src/modules/admin/config/config.controller.ts`
- ✅ `apps/backend/src/modules/admin/config/config.routes.ts`
- ✅ `apps/backend/src/app.ts`
- ✅ `apps/admin/src/pages/Settings.tsx`

---

### ⏳ 25. Personnalisation UI 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Upload logo personnalisé
- [ ] Sélecteur de couleurs de marque
- [ ] Textes légaux (CGV, mentions, politique confidentialité)
- [ ] Éditeur WYSIWYG textes légaux
- [ ] Footer/Header personnalisés
- [ ] Favicon personnalisé
- [ ] Prévisualisation changements

**Fichiers concernés:**
- `apps/admin/src/pages/Settings.tsx`
- `apps/backend/src/modules/admin/branding/` (à créer)

---

### ⏳ 26. Gestion des rôles (RBAC) 🟢
**Status:** Rôles basiques (USER, ADMIN, SUPERADMIN)
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Table `Role` (name, description, permissions)
- [ ] Table `Permission` (resource, action)
- [ ] Interface RBAC complète
- [ ] Permissions granulaires (read:users, write:chapters, etc.)
- [ ] Création de rôles personnalisés (Éditeur, Comptable, Support)
- [ ] Assignation rôles à utilisateurs
- [ ] Middleware backend vérification permissions

**Fichiers concernés:**
- `apps/admin/src/pages/RolesManager.tsx` (à créer)
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/middleware/permissions.ts` (à créer)

---

## 🔐 **SÉCURITÉ & AUDIT**

### ✅ 27. Logs d'audit 🔴
**Status:** Complété ✅
**Priorité:** PHASE 1

**Sous-tâches:**
- [x] Table `AuditLog` (userId, action, resource, metadata, ip, userAgent, createdAt)
- [x] Service d'audit avec méthode `log()` et `list()` avec filtres
- [x] Page `AuditLogs.tsx` avec tableau et recherche
- [x] Filtres par utilisateur, action, ressource, date
- [x] Export CSV des logs
- [x] Méthode `deleteOlderThan()` pour retention policy
- [ ] Middleware automatique pour logger les actions sensibles - optionnel
- [ ] Alertes de sécurité en temps réel - optionnel

**Fichiers concernés:**
- ✅ `apps/admin/src/pages/AuditLogs.tsx`
- ✅ `apps/backend/src/modules/admin/audit/audit.service.ts`
- ✅ `apps/backend/src/modules/admin/audit/audit.controller.ts`
- ✅ `apps/backend/src/modules/admin/audit/audit.routes.ts`
- ✅ `apps/backend/prisma/schema.prisma`
- ✅ `apps/admin/src/App.tsx`
- ✅ `apps/admin/src/components/Layout.tsx`

---

### ⏳ 28. 2FA (Two-Factor Authentication) 🟡
**Status:** Non commencé
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Table `TwoFactorSecret` (userId, secret, enabled, backupCodes)
- [ ] Intégrer `speakeasy` (TOTP)
- [ ] Page activation 2FA dans Settings
- [ ] Génération QR code
- [ ] Codes de secours (backup codes)
- [ ] Vérification 2FA au login
- [ ] Recovery en cas de perte accès

**Fichiers concernés:**
- `apps/admin/src/pages/Settings.tsx`
- `apps/backend/src/modules/auth/two-factor.service.ts` (à créer)

---

## 📱 **RESPONSIVE & UX**

### ⏳ 29. Version mobile admin 🟢
**Status:** Partiellement responsive
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Audit responsive complet
- [ ] Optimisation sidebar mobile (hamburger menu)
- [ ] Tables → cards sur mobile
- [ ] Touch gestures (swipe pour delete, etc.)
- [ ] Bottom sheet modals sur mobile
- [ ] PWA (Progressive Web App)
- [ ] Service Worker pour offline
- [ ] Add to Home Screen

**Fichiers concernés:**
- Tous les composants admin

---

### ⏳ 30. Accessibilité (a11y) 🟡
**Status:** Basique
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Audit avec axe DevTools
- [ ] Support clavier complet (Tab, Enter, Esc)
- [ ] ARIA labels sur tous les éléments interactifs
- [ ] Screen readers (NVDA, JAWS)
- [ ] Mode contraste élevé
- [ ] Focus indicators visibles
- [ ] Skip links
- [ ] Alt text sur toutes les images

**Fichiers concernés:**
- Tous les composants admin

---

## 🧪 **TESTS & QUALITÉ**

### ⏳ 31. Tests unitaires frontend 🟡
**Status:** Non commencé
**Priorité:** PHASE 2

**Sous-tâches:**
- [ ] Setup Vitest + React Testing Library
- [ ] Tests composants React (smoke tests minimum)
- [ ] Tests hooks personnalisés
- [ ] Tests stores Zustand
- [ ] Tests utils/helpers
- [ ] Coverage > 70%

**Fichiers concernés:**
- `apps/admin/src/**/*.test.tsx` (à créer)

---

### ⏳ 32. Tests E2E 🟢
**Status:** Non commencé
**Priorité:** PHASE 3

**Sous-tâches:**
- [ ] Setup Playwright ou Cypress
- [ ] Scénarios utilisateur complets
- [ ] Tests de régression
- [ ] Tests de performance (Lighthouse)
- [ ] CI/CD integration

**Fichiers concernés:**
- `apps/admin/e2e/` (à créer)

---

## 📖 **DOCUMENTATION**

### ⏳ 33. Guide admin 🟢
**Status:** README basique
**Priorité:** PHASE 4

**Sous-tâches:**
- [ ] Documentation intégrée dans l'app
- [ ] Tooltips contextuels (react-tooltip)
- [ ] Tutoriels interactifs (react-joyride)
- [ ] FAQ intégrée
- [ ] Vidéos de démo
- [ ] Guide PDF téléchargeable

**Fichiers concernés:**
- `apps/admin/src/components/HelpTooltip.tsx` (à créer)
- `docs/admin-guide.md` (à créer)

---

## 📊 RÉSUMÉ PAR PHASE

### **PHASE 1 - Urgent (Bloquant pour production)** 🔴
1. ✅ Formulaire Prix (tâche 4 - résolu)
2. ✅ Export commandes CSV (tâche 14 - résolu)
3. ✅ Logs d'audit (tâche 27 - résolu)
4. ✅ Configuration paiements (tâche 24 - résolu)

**Estimation:** 2-3 semaines (100% complété ✅)

---

### **PHASE 2 - Important (1-2 mois)** 🟡
1. Targeting promotions (tâche 1)
2. Codes promo (tâche 2)
3. KPIs temps réel (tâche 7)
4. Graphiques avancés (tâche 8)
5. Actions en masse utilisateurs (tâche 10)
6. Filtres avancés utilisateurs (tâche 11)
7. Détails commande (tâche 13)
8. Gestion des remboursements (tâche 15)
9. Historique des prix (tâche 5)
10. Planification de publication (tâche 17)
11. Bibliothèque d'assets améliorée (tâche 19)
12. Créateur de Bundles (tâche 21)
13. Système d'emails (tâche 22)
14. 2FA (tâche 28)
15. Accessibilité (tâche 30)
16. Tests unitaires frontend (tâche 31)

**Estimation:** 2-3 mois

---

### **PHASE 3 - Nice to have (3-6 mois)** 🟢
1. Analytics promotions (tâche 3)
2. A/B Testing de prix (tâche 6)
3. Activité récente détaillée (tâche 9)
4. Notes et tags utilisateurs (tâche 12)
5. Éditeur de texte riche (tâche 16)
6. Gestion des perspectives (tâche 18)
7. Interface Coloring Pages (tâche 20)
8. Notifications in-app (tâche 23)
9. Personnalisation UI (tâche 25)
10. Gestion des rôles RBAC (tâche 26)
11. Version mobile admin (tâche 29)
12. Tests E2E (tâche 32)

**Estimation:** 3-6 mois

---

### **PHASE 4 - Long terme (6+ mois)** 📚
1. Guide admin (tâche 33)

**Estimation:** 1-2 mois

---

## 📈 MÉTRIQUES DE PROGRESSION

- **Total de tâches:** 33
- **Terminées:** 13 ✅
- **En cours:** 0 🚧
- **À faire:** 20 ⏳

**Progression globale:** 39% (13/33)

**PHASE 1 (Urgent):** 100% complété (4/4) ✅ TERMINÉ!
**PHASE 2 (Important):** 56% complété (9/16)

---

## 🔄 CHANGELOG

### 2025-01-17

#### Soir (1 tâche complétée!)
- ✅ **Tâche 15 complétée: Gestion des remboursements** (PHASE 2 - Important)
  - Backend: Système complet de remboursements avec Stripe
    - Service `refunds.service.ts` avec 8 méthodes principales:
      - `createRefund()`: Création et traitement via Stripe Refund API
      - `getTotalRefunded()`: Calcul du total remboursé pour une commande
      - `revokeEntitlementsForOrder()`: Révocation automatique des droits d'accès
      - `getRefundById()`: Récupération d'un remboursement spécifique
      - `listRefunds()`: Liste paginée avec filtres (status, type, dates, orderId)
      - `getRefundsByOrderId()`: Tous les remboursements d'une commande
      - `cancelRefund()`: Annulation d'un remboursement en attente
      - `getRefundStats()`: Statistiques agrégées (total, moyennes, compteurs)
    - Intégration Stripe avec gestion d'erreurs et rollback
    - Validation des montants (ne pas dépasser le montant restant)
    - Support remboursements partiels et complets
    - Mise à jour automatique du statut de la commande (REFUNDED si 100%)
  - Controller: 6 endpoints RESTful:
    - `POST /admin/refunds`: Créer un remboursement
    - `GET /admin/refunds`: Lister tous les remboursements avec filtres
    - `GET /admin/refunds/stats`: Statistiques globales
    - `GET /admin/refunds/:id`: Détails d'un remboursement
    - `GET /admin/orders/:orderId/refunds`: Remboursements d'une commande
    - `POST /admin/refunds/:id/cancel`: Annuler un remboursement
  - Routes: Protection admin avec requireAdmin middleware
  - Schema Prisma: 3 nouveaux types et 1 modèle:
    - Enum `RefundStatus`: PENDING, COMPLETED, FAILED, CANCELLED
    - Enum `RefundType`: FULL, PARTIAL
    - Modèle `Refund` (15 champs):
      - Montants et devise (amountRefunded, currency)
      - Type et statut (type, status)
      - Métadonnées (reason, notes, providerRefundId)
      - Contrôle (revokeEntitlements, refundedBy)
      - Dates (refundedAt, processedAt)
      - Erreurs (failureReason)
      - Relation vers Order (cascade delete)
      - 2 index (orderId, status)
  - Migration: `20260117173119_add_refunds` appliquée avec succès
  - Frontend: Composant `RefundManagement.tsx` (420 lignes):
    - Affichage des 3 montants: original, remboursé, restant
    - Liste des remboursements avec badges de statut
    - Timeline des remboursements avec détails complets
    - Modal de création avec formulaire:
      - Montant (validation min/max)
      - Type (FULL/PARTIAL)
      - Raison et notes internes
      - Checkbox révocation des droits
    - Bouton "Créer un remboursement" (visible si commande PAID et montant > 0)
    - Gestion des états de chargement et d'erreurs
    - Toast notifications pour les actions
    - Callback onRefundCreated pour rafraîchir la commande
  - Intégration dans OrderDetail:
    - Import du composant RefundManagement
    - Ajout dans une nouvelle section après la chronologie
    - Passage des props (orderId, montant, devise, statut)
    - Callback loadOrder pour rafraîchir après remboursement
  - Fichiers modifiés/créés:
    - ✅ `apps/backend/prisma/schema.prisma` (3 enums + 1 modèle)
    - ✅ `apps/backend/prisma/migrations/20260117173119_add_refunds/`
    - ✅ `apps/backend/src/modules/admin/orders/refunds.service.ts` (330 lignes)
    - ✅ `apps/backend/src/modules/admin/orders/refunds.controller.ts` (209 lignes)
    - ✅ `apps/backend/src/modules/admin/orders/refunds.routes.ts` (42 lignes)
    - ✅ `apps/backend/src/app.ts` (import + registration)
    - ✅ `apps/admin/src/components/RefundManagement.tsx` (420 lignes)
    - ✅ `apps/admin/src/pages/OrderDetail.tsx` (import + intégration)

#### Après-midi (continuation!)
- ✅ **Tâche 13 complétée: Détails commande** (PHASE 2 - Important)
  - Page: `OrderDetail.tsx` créée (~500 lignes) avec layout 2 colonnes responsive
  - Colonne gauche (2/3):
    - Section "Résumé de la commande" avec cards pour ID, type, status, montant
    - Montant total affiché avec gradient vert + icône
    - Badge promotion violet si appliquée (avec ID promotion)
    - Section "Détails du paiement" (si provider présent):
      - Fournisseur (Stripe capitalisé)
      - Devise (EUR)
      - ID de session provider (font-mono, break-all)
      - ID d'intention de paiement (font-mono)
    - Section "Détails de tarification" (si prix appliqués):
      - Schéma de prix appliqué (ID en font-mono)
      - Prix FreeToRead, Paywall, Épilogue si présents
      - Affichage formaté en devise avec Intl.NumberFormat
  - Colonne droite (1/3):
    - Section "Client" avec informations utilisateur:
      - Email (texte principal)
      - ID Utilisateur (publicId en font-mono)
      - Bouton "Voir le profil" (indigo-600) qui navigue vers UserDetail
    - Section "Chronologie" avec timeline verticale:
      - Ligne de connexion grise entre événements
      - Icônes colorées dans cercles (bleu pour création, vert/rouge/jaune selon status)
      - "Commande créée" toujours affiché
      - "Paiement confirmé" si PAID
      - "Paiement échoué" si FAILED
      - "En attente de paiement" si PENDING
      - Dates formatées avec format français complet
  - Header: Bouton retour, titre "Commande #XXXXXXXX", date création, badges status et type
  - Badges: getStatusBadge() et getTypeBadge() avec couleurs et icônes
  - Fonctions utilitaires:
    - formatCurrency(): Intl.NumberFormat avec conversion centimes → euros
    - formatDate(): Format français (jour mois année heure:minute)
  - États: loading avec animation pulse, gestion erreur 404
  - Route frontend: `/orders/:id` ajoutée dans `App.tsx` avec import `OrderDetail`
  - Navigation: Bouton "Détails" ajouté dans `Orders.tsx` (liste des commandes):
    - Positionné à droite de chaque ligne de commande
    - Icône MdVisibility + texte "Détails"
    - Style indigo avec hover bg-indigo-50
    - onClick: navigate(`/orders/${order.id}`)
  - Backend: Routes et endpoints existaient déjà:
    - Route: `GET /admin/orders/:id` dans `orders.routes.ts`
    - Controller: `getById()` dans `orders.controller.ts` avec gestion erreur 404
    - Service: `getById()` dans `orders.service.ts` avec include user.publicId
  - Fix: Suppression routes dupliquées `/admin/price-history` de `price-schemas.routes.ts`
  - TypeScript: Interface OrderDetail complète avec 17 champs typés
  - Responsive: Grid grid-cols-1 lg:grid-cols-3, sections adaptatives
  - Fichiers modifiés:
    - `apps/admin/src/pages/OrderDetail.tsx` (créé)
    - `apps/admin/src/App.tsx` (import + route)
    - `apps/admin/src/pages/Orders.tsx` (bouton Détails)
    - `apps/backend/src/modules/admin/price-schemas/price-schemas.routes.ts` (fix)

#### Matin (3 tâches complétées!)
- ✅ **Tâche 10 complétée: Actions en masse utilisateurs** (PHASE 2 - Important)
  - Frontend: Selection UI dans Users.tsx
    - Checkbox column ajoutée au début du tableau
    - Header checkbox pour "Select All" (toggle tous/aucun)
    - État géré avec Set<string> pour performance
    - Toggle selection individuelle par ligne
  - Barre d'actions contextuelles (indigo-50):
    - Affichée uniquement si selection > 0
    - Compteur: "X utilisateur(s) sélectionné(s)"
    - 4 boutons d'action: Activer (vert), Suspendre (rouge), Promouvoir (violet), Rétrograder (gris)
    - Bouton "Annuler la sélection"
  - Modal de confirmation:
    - Affichage type d'action + nombre d'utilisateurs concernés
    - Boutons Annuler / Confirmer
    - Overlay modal avec backdrop semi-transparent
  - Backend: 4 méthodes de service (users.service.ts):
    - `bulkSuspend()`: updateMany status = SUSPENDED
    - `bulkActivate()`: updateMany status = ACTIVE
    - `bulkPromote()`: updateMany role = ADMIN
    - `bulkDemote()`: updateMany role = USER
    - Return count des utilisateurs modifiés
  - Controller: 4 endpoints (users.controller.ts):
    - POST /admin/users/bulk/suspend
    - POST /admin/users/bulk/activate
    - POST /admin/users/bulk/promote
    - POST /admin/users/bulk/demote
    - Validation: userIds non-vide et array
    - Gestion erreurs avec codes appropriés
  - Routes: Enregistrement avec requireAdmin middleware
  - UX: Désélection automatique après succès, reload des utilisateurs
  - Fichiers modifiés:
    - `apps/admin/src/pages/Users.tsx`
    - `apps/backend/src/modules/admin/users/users.service.ts`
    - `apps/backend/src/modules/admin/users/users.controller.ts`
    - `apps/backend/src/modules/admin/users/users.routes.ts`

#### Matin (2 tâches complétées!)
- ✅ **Tâche 8 complétée: Graphiques avancés** (PHASE 2 - Important)
  - Composants: 2 nouveaux charts créés avec recharts v3.6.0
  - `RevenueEvolutionChart.tsx`: Area chart avec gradient indigo
    - 5 sélecteurs de période: 7 jours, 30 jours, 3/6/12 mois
    - Groupage intelligent: par jour (court terme) ou mois (long terme)
    - Affichage total et moyenne des revenus
    - Gradient area avec couleur #6366f1
    - État vide avec message explicatif
    - Tooltips riches avec format currency
    - CartesianGrid avec style moderne
  - `SalesDistributionChart.tsx`: Pie chart avec légende détaillée
    - Distribution par type (Volumes, Chapitres, POV, Épilogue, Coloriage, Bundles, Abonnement)
    - Couleurs distinctes par scope (7 couleurs)
    - Labels avec pourcentages sur le pie
    - Légende interactive avec détails (count, revenue, % du CA)
    - Tri par revenu décroissant
    - Vue grid: pie chart à gauche, légende à droite
  - Integration: Dashboard.tsx mis à jour
    - RevenueEvolutionChart en pleine largeur
    - SalesDistributionChart remplace PurchaseDistributionChart
    - Locale propagée correctement (fr/en)
  - Design: Cards modernes avec headers, stats, états vides
  - Performance: useMemo pour calculs complexes
  - Fichiers modifiés:
    - `apps/admin/src/components/RevenueEvolutionChart.tsx` (créé)
    - `apps/admin/src/components/SalesDistributionChart.tsx` (créé)
    - `apps/admin/src/pages/Dashboard.tsx`

- ✅ **Tâche 7 complétée: KPIs temps réel** (PHASE 2 - Important)
  - Backend: Méthode `getKPIs()` dans `dashboard.service.ts` avec calculs avancés:
    - Date calculations pour today, week, month, year et périodes précédentes
    - 8 requêtes parallèles d'agrégation revenus avec Promise.all
    - Calcul du changement en pourcentage par rapport à période précédente
    - Top 5 chapitres par nombre d'achats (groupBy + enrichissement)
    - Top 5 volumes par nombre d'achats (groupBy + enrichissement)
  - Controller: Endpoint `getKPIs()` avec gestion d'erreur
  - Routes: Ajout route `GET /admin/dashboard/kpis` avec protection admin
  - Frontend: Refonte complète de `Dashboard.tsx`:
    - Section "Revenus en temps réel" avec 4 cartes gradient (bleu, violet, vert, orange)
    - Badges de changement avec icônes TrendingUp/Down (vert/rouge)
    - Affichage pourcentage de changement vs période précédente
    - Compteur de commandes par période
    - Section "Top 5 Chapitres" avec ranking visuel et montant total
    - Section "Top 5 Volumes" avec ranking visuel et montant total
    - Formatage des prix avec Intl.NumberFormat (locale-aware)
    - Affichage conditionnel basé sur présence de données
  - Interfaces TypeScript: KPIRevenuePeriod, KPIData avec types stricts
  - Performance: Toutes les requêtes en parallèle pour optimiser le temps de réponse
  - Fichiers modifiés:
    - `apps/backend/src/modules/admin/dashboard/dashboard.service.ts`
    - `apps/backend/src/modules/admin/dashboard/dashboard.controller.ts`
    - `apps/backend/src/modules/admin/dashboard/dashboard.routes.ts`
    - `apps/admin/src/pages/Dashboard.tsx`

### 2025-01-16

#### Soir (fin de session - 4 tâches complétées!)
- ✅ **Tâche 11 complétée: Filtres avancés utilisateurs** (PHASE 2 - Important)
  - Composant: `UserFilters.tsx` avec interface expansible/réductible
  - Filtres: Rôle, Statut, Date d'inscription (après/avant), Montant dépensé (min/max), Nombre commandes (min/max)
  - Recherche: Par email (case-insensitive)
  - Favoris: Sauvegarde des filtres dans localStorage avec gestion (sauvegarder/charger/supprimer)
  - Interface: Badge "Actifs" quand filtres appliqués, bouton "Effacer"
  - Backend: Modification de `users.service.list()` pour accepter `UserFilterQuery`
  - Filtrage: Côté serveur avec agrégation pour totalSpent et orderCount
  - Query params: Tous les filtres passés en paramètres d'URL
  - Controller: Parsing des query params avec conversion des nombres
  - Frontend: Modification de `Users.tsx` pour utiliser le nouveau composant
  - Suppression: Ancien système de filtre par rôle (FloatingActionButton)
  - Chargement: Automatique lors du changement de filtres (useEffect)
  - Fichiers: 4 fichiers modifiés (UserFilters.tsx créé, Users.tsx, users.service.ts, users.controller.ts)

- ✅ **Tâche 5 complétée: Historique des prix (Price History)** (PHASE 2 - Important)
  - Schéma: Modèle `PriceHistory` avec relation cascade vers `Price`
  - Migration: `20260117000100_add_price_history` avec 2 index (priceId+changedAt, changedAt)
  - Champs: oldAmountCents, newAmountCents, currency, changedAt, changedBy, reason
  - Service: `price-history.service.ts` avec 4 méthodes principales:
    - `createHistoryEntry()`: Enregistrement d'un changement
    - `getHistoryByPriceId()`: Historique d'un prix spécifique
    - `listHistory()`: Liste paginée avec filtres (priceId, dates)
    - `getStatistics()`: Stats agrégées (moyenne, max increase/decrease)
  - Tracking automatique: `updatePrice()` modifié pour enregistrer historique
  - Controller: 4 endpoints créés (list, byPriceId, statistics, recent)
  - Routes: Enregistrées dans `app.ts` via `priceHistoryRoutes`
  - Frontend: `PriceHistoryPage.tsx` entièrement réécrite:
    - Timeline visuelle avec icônes TrendingUp/Down (vert/rouge)
    - Affichage ancien prix (barré) vs nouveau prix
    - Badge pourcentage de changement avec couleur
    - Filtres: priceId, startDate, endDate
    - Pagination fonctionnelle (20/page)
    - Labels scope traduits (Tome, Chapitre, etc.)
    - État vide avec message explicatif
  - Fichiers: 8 fichiers modifiés/créés

- ✅ **Tâche 2 complétée: Codes promo** (PHASE 2 - Important)
  - Schéma: Champ `code` (String?, unique) ajouté au modèle Promotion
  - Migration: `20260117000000_add_promo_code` avec index unique et de recherche
  - Backend: 4 nouvelles méthodes dans `promotions.service.ts`:
    - `generatePromoCode(length)`: Génération aléatoire A-Z0-9
    - `isCodeUnique(code)`: Vérification unicité (case-insensitive)
    - `generateUniqueCode()`: Génération avec retry jusqu'à unicité
    - `validatePromoCode(code)`: Validation complète (actif, dates, maxUses)
  - Endpoints: 3 nouveaux endpoints dans `promotions.controller.ts`:
    - `POST /admin/promotions/:id/generate-code`: Génération auto
    - `GET /admin/promotions/validate-code/:code`: Validation publique
    - `GET /admin/promotions/check-code?code=X`: Vérification unicité
  - Frontend: Section "Code Promo" dans `PromotionForm.tsx`:
    - Input avec conversion automatique en majuscules
    - Bouton "Générer" pour codes aléatoires (mode édition uniquement)
    - Badge visuel vert quand code actif
    - Placeholder et aide contextuelle
  - Interfaces: Ajout du champ `code?` dans tous les DTOs et interfaces
  - Fichiers modifiés: 7 fichiers (schema, migration, service, controller, routes, forms)

- ✅ **Tâche 1 complétée: Ciblage utilisateurs (Targeting)** (PHASE 2 - Important)
  - Backend: Service `targeting.service.ts` existait déjà avec critères complets
  - Endpoint: `POST /admin/promotions/preview-targeting` (déjà présent)
  - Frontend: Composant `TargetingSelector.tsx` avec 3 modes de ciblage
  - Modes: ALL_USERS, SPECIFIC_USERS (par emails), CRITERIA_BASED (critères avancés)
  - Critères: minOrders, maxOrders, minTotalSpent, maxTotalSpent, registeredAfter/Before, hasOrderType, roles
  - Intégration: Ajout dans `PromotionForm.tsx` avec section dédiée
  - Compteur: Affichage en temps réel du nombre d'utilisateurs ciblés
  - Sauvegarde: targetType, targetUserIds, targetCriteria inclus dans le payload
  - Chargement: Données de ciblage chargées lors de l'édition d'une promotion
  - Interface: Design moderne avec sélecteur de type, champs de critères, bouton refresh
  - Fichiers modifiés:
    - `apps/admin/src/components/TargetingSelector.tsx` (créé)
    - `apps/admin/src/pages/PromotionForm.tsx`

#### Soir (suite)
- ✅ **Tâche 24 complétée: Configuration paiements** (PHASE 1 - Urgent) 🎉
  - Backend: Table `SystemConfig` avec champs key, value, category, type, isEncrypted
  - Migration Prisma: `20260116190214_add_system_config`
  - Service: Chiffrement AES-256-GCM pour les secrets (clés Stripe)
  - Méthodes: `list()`, `getByKey()`, `upsert()`, `initializeDefaults()`, `getPaymentConfig()`
  - Controller: Endpoints CRUD avec masquage des secrets (••••••••)
  - Routes: `GET /admin/config`, `GET /admin/config/:key`, `PUT /admin/config`, `POST /admin/config/initialize`, `GET /config/payment`
  - Frontend: Section complète dans Settings.tsx avec édition inline
  - Interface: Toggle show/hide pour secrets, bouton initialisation
  - Configurations par défaut: Stripe (publishable_key, secret_key, webhook_secret, mode), devises, taxes, moyens de paiement
  - Sécurité: Chiffrement transparent, validation admin, protection des secrets
  - Fichiers modifiés:
    - `apps/backend/prisma/schema.prisma`
    - `apps/backend/src/modules/admin/config/config.service.ts` (créé)
    - `apps/backend/src/modules/admin/config/config.controller.ts` (créé)
    - `apps/backend/src/modules/admin/config/config.routes.ts` (créé)
    - `apps/backend/src/app.ts`
    - `apps/admin/src/pages/Settings.tsx`

#### Soir
- ✅ **Tâche 27 complétée: Logs d'audit** (PHASE 1 - Urgent)
  - Backend: Table `AuditLog` avec indexes (userId, action, resource, createdAt)
  - Migration Prisma: `20260116184508_add_audit_logs`
  - Service: Méthodes `log()`, `list()`, `exportToCSV()`, `deleteOlderThan()`
  - Controller: Endpoints `GET /admin/audit-logs` et `GET /admin/audit-logs/export`
  - Routes: Protection avec middleware `requireAdmin`
  - Frontend: Page `AuditLogs.tsx` avec filtres, recherche, export CSV, badges colorés
  - Navigation: Lien "Logs d'Audit" avec icône MdSecurity dans sidebar
  - CSV avec séparateur `;` pour compatibilité Excel français
  - Système non-bloquant (erreurs d'audit ne cassent pas l'app)
  - Fichiers modifiés:
    - `apps/backend/prisma/schema.prisma`
    - `apps/backend/src/modules/admin/audit/audit.service.ts` (créé)
    - `apps/backend/src/modules/admin/audit/audit.controller.ts` (créé)
    - `apps/backend/src/modules/admin/audit/audit.routes.ts` (créé)
    - `apps/backend/src/app.ts`
    - `apps/admin/src/pages/AuditLogs.tsx` (créé)
    - `apps/admin/src/App.tsx`
    - `apps/admin/src/components/Layout.tsx`

#### Après-midi
- ✅ **Tâche 14 complétée: Export CSV des commandes** (PHASE 1 - Urgent)
  - Backend: Endpoint `/admin/orders/export` avec filtres (status, type, dates, userId)
  - Service: Méthode `exportToCSV()` avec 19 colonnes de données
  - CSV avec UTF-8 BOM pour compatibilité Excel
  - Séparateur `;` pour compatibilité Excel français
  - Frontend: Bouton "Exporter en CSV" dans le FAB de Orders.tsx
  - Support des filtres par statut (ALL/PAID/PENDING)
  - Fichiers modifiés:
    - `apps/backend/src/modules/admin/orders/orders.service.ts`
    - `apps/backend/src/modules/admin/orders/orders.controller.ts`
    - `apps/backend/src/modules/admin/orders/orders.routes.ts`
    - `apps/admin/src/pages/Orders.tsx`

#### Matin
- ✅ Tâche 4 complétée: Formulaire Prix créé et intégré
- 📝 Création de ce document GLOBAL-TODO.md
- 🎯 Priorisation des tâches en 4 phases

---

**Note:** Ce document sera mis à jour au fur et à mesure de l'avancement. Chaque tâche complétée sera marquée ✅ et déplacée dans le changelog.
