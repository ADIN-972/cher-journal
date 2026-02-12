# Translation Audit Report - Cher Journal i18n

## Executive Summary
Complete audit of hardcoded strings (non-translated text) in Admin and Web applications.
Found 50+ hardcoded French strings that need to be translated.

## Admin App - Hardcoded Strings Found

### Layout.tsx (15 strings)
- Line 46: "Avis Lecteurs" → navigation.reviews
- Line 52: "Avis Lecteurs" → navigation.reviews
- Line 53: "Promotions" → navigation.promotions
- Line 54: "Bundles" → navigation.bundles
- Line 55: "Tarification" → navigation.pricing
- Line 56: "Tarification V2" → navigation.pricing_v2
- Line 58: "Configuration Système" → navigation.system_config
- Line 81: "Administration" → header.admin_subtitle
- Line 123: "Chapitres et volumes" → navigation.chapters_subtitle
- Line 149: "Calendrier de Publication" → navigation.calendar_subtitle
- Line 207: "Avis Lecteurs" → navigation.reviews
- Line 224: "Promotions" → navigation.promotions
- Line 241: "Bundles" → navigation.bundles
- Line 258: "Tarifs V1" → navigation.pricing_v1
- Line 277: "Tarification V2" → navigation.pricing_v2
- Line 278: "Schemas & Audit" → navigation.pricing_v2_subtitle
- Line 297: "Logs d'Audit" → navigation.audit_logs
- Line 335: "Configuration" → navigation.system_config
- Line 336: "Système" → navigation.system_config_subtitle
- Line 388: "Bienvenue dans votre espace d'administration" → layout.welcome_message
- Line 399: "Rechercher..." → common.search_placeholder
- Line 418-419: Theme toggle titles → layout.theme_dark / layout.theme_light
- Line 464: "Administrateur" → header.admin
- Line 481: "Paramètres" → account.settings
- Line 484: "Configuration du compte" → account.settings_subtitle
- Line 515: "Mode Debug Interface" → debug.interface_mode
- Line 518: "Activé" / "Désactivé" → common.enabled / common.disabled

### App.tsx (1 string)
- Line 46: "Chargement..." → common.loading

### Login.tsx (7 strings)
- Line 24: t("login.success_message") - needs key in JSON
- Line 26: t("login.error_message") - needs key in JSON
- Line 53: "Bienvenue dans l'administration" → login.welcome_subtitle
- Line 134: "Se souvenir de moi" → auth.remember_me
- Line 140: "Mot de passe oublié?" → auth.forgot_password
- Line 179: "Pas encore de compte?" → auth.no_account_yet
- Line 183: "Créer un compte" → auth.create_account
- Line 191: "Compte de test" → login.test_account_title
- Line 196: "admin@cherjournal.com" (email - exclude)
- Line 201: "admin123" (password - exclude)

### Register.tsx (8 strings)
- Lines 35-59: Validation error messages need keys
- Line 36: "Le prénom est obligatoire." → register.first_name_required
- Line 43: "Le nom est obligatoire." → register.last_name_required
- Line 90: "Faible" → register.password_weak
- Line 96: "Moyen" → register.password_medium
- Line 106: "Fort" → register.password_strong

### Chapters.tsx (1 string)
- Line 121: t("messages.error.load_chapters") - needs key

### Components with Hardcoded "Chargement..."
- AssetFilters.tsx: "Chargement des tags..."
- AssetVersionHistory.tsx: "Chargement des versions..."
- ChapterImageGallery.tsx: "Chargement des images..."
- TableGrid.tsx: "Chargement..."
- TagManager.tsx: "Chargement des tags..."
- VolumePerspectiverDrawer.tsx: "Chargement..."
- RefundManagement.tsx: "Créer un remboursement"
- AssetVersionHistory.tsx: "Créer une nouvelle version"
- TagManager.tsx: "Modifier le tag" / "Créer un nouveau tag"
- PricingLayout.tsx: "Gestion de la Tarification"

### Components with Product Names
- PurchaseDistributionChart.tsx: "Bundles" (used as label)
- PurchaseStatistics.tsx: "Packs/Bundles"
- PurchaseTimelineChart.tsx: "Bundles"
- RevenueEvolutionChart.tsx: "Bundles"
- SalesDistributionChart.tsx: "Bundles"

### Other Pages
- AuditLogs.tsx: Various UI strings
- Bundles.tsx: Various UI strings
- OrderDetail.tsx: Various UI strings
- PriceSchemasPage.tsx: Various UI strings
- PricesPage.tsx: Various UI strings
- Promotions.tsx / PromotionsPage.tsx: Various UI strings
- Reviews.tsx: Various UI strings
- Settings.tsx: Various UI strings
- SystemConfig.tsx: Various UI strings
- UserDetailImproved.tsx: Various UI strings

## Web App
Currently has minimal hardcoded strings (already using i18n extensively).

## Translation Keys to Add

### Common
- common.loading → "Loading..." / "Chargement..."
- common.enabled → "Enabled" / "Activé"
- common.disabled → "Disabled" / "Désactivé"
- common.search_placeholder → "Search..." / "Rechercher..."

### Navigation
- navigation.reviews → "Reviews" / "Avis"
- navigation.promotions → "Promotions" / "Promotions"
- navigation.bundles → "Bundles" / "Bundles"
- navigation.pricing → "Pricing" / "Tarification"
- navigation.pricing_v1 → "Pricing V1" / "Tarifs V1"
- navigation.pricing_v2 → "Pricing V2" / "Tarification V2"
- navigation.pricing_v2_subtitle → "Schemas & Audit" / "Schémas & Audit"
- navigation.system_config → "System Config" / "Configuration Système"
- navigation.audit_logs → "Audit Logs" / "Journaux d'Audit"
- navigation.chapters_subtitle → "Chapters and Volumes" / "Chapitres et volumes"
- navigation.calendar_subtitle → "Publishing Calendar" / "Calendrier de Publication"
- navigation.system_config_subtitle → "System" / "Système"

### Header
- header.admin_subtitle → "Administration" / "Administration"

### Layout
- layout.welcome_message → "Welcome to your admin space" / "Bienvenue dans votre espace d'administration"
- layout.theme_dark → "Switch to dark mode" / "Passer en mode sombre"
- layout.theme_light → "Switch to light mode" / "Passer en mode clair"

### Login
- login.welcome_subtitle → "Welcome to administration" / "Bienvenue dans l'administration"
- login.test_account_title → "Test Account" / "Compte de test"

### Auth
- auth.remember_me → "Remember me" / "Se souvenir de moi"
- auth.forgot_password → "Forgot password?" / "Mot de passe oublié ?"
- auth.no_account_yet → "Don't have an account yet?" / "Pas encore de compte ?"
- auth.create_account → "Create an account" / "Créer un compte"

### Register
- register.password_weak → "Weak" / "Faible"
- register.password_medium → "Medium" / "Moyen"
- register.password_strong → "Strong" / "Fort"

### Messages
- messages.error.load_chapters → "Failed to load chapters" / "Erreur lors du chargement des chapitres"

### Components
- components.asset_filters.loading_tags → "Loading tags..." / "Chargement des tags..."
- components.asset_version_history.loading_versions → "Loading versions..." / "Chargement des versions..."
- components.asset_version_history.create_new_version → "Create new version" / "Créer une nouvelle version"
- components.chapter_image_gallery.loading_images → "Loading images..." / "Chargement des images..."
- components.tag_manager.loading_tags → "Loading tags..." / "Chargement des tags..."
- components.tag_manager.edit_tag → "Edit tag" / "Modifier le tag"
- components.tag_manager.create_new_tag → "Create new tag" / "Créer un nouveau tag"
- components.refund_management.create_refund → "Create refund" / "Créer un remboursement"
- components.pricing_layout.title → "Pricing Management" / "Gestion de la Tarification"
- components.volume_perspective_drawer.loading → "Loading..." / "Chargement..."

## Implementation Plan

1. Add all missing translation keys to JSON files (EN and FR)
2. Update each component to import and use useI18n
3. Replace hardcoded strings with t() calls
4. Test all strings display correctly in both languages
5. Run npm run verify:translations to ensure completeness

## Statistics
- Admin App files with hardcoded strings: 26 files
- Web App files with hardcoded strings: 3 files
- Total hardcoded strings identified: 50+
- Translation keys to create: 40+
- Files to modify: 29+
