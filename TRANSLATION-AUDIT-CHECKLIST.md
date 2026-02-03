# Translation Audit Checklist

**Last Updated**: 2026-02-02
**Purpose**: Track translation status of all React components and pages across admin and web apps

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Admin Components** | 57 | 🔄 In Progress |
| **Admin Pages** | 27 | 🔄 In Progress |
| **Web Components** | 37 | 🔄 In Progress |
| **Web Pages** | 12 | 🔄 In Progress |
| **Total Files** | **133** | **🔄 In Progress** |

---

## ADMIN APP - COMPONENTS

### Status Legend
- ✅ Reviewed & Fully Translated
- ⚠️ Partial (Some hardcoded text found)
- ❌ Needs Complete Review
- 🔄 In Progress

| # | Component | Status | Notes |
|---|-----------|--------|-------|
| 1 | ActionButton.tsx | ❌ | Generic button component - may have hardcoded labels |
| 2 | AddEntitlementModal.tsx | ❌ | Modal - needs review |
| 3 | AssetFilters.tsx | ⚠️ | Partially translated (has loading text) |
| 4 | AssetVersionHistory.tsx | ⚠️ | Partially translated (has loading text) |
| 5 | AssignPromoModal.tsx | ❌ | Modal - needs review |
| 6 | BookPreview.tsx | ❌ | Preview component - may have hardcoded text |
| 7 | BookPreviewV2.tsx | ❌ | Updated preview component - needs review |
| 8 | BulkEditChapterModal.tsx | ❌ | Modal - likely has hardcoded text |
| 9 | BulkEditTitlesDrawer.tsx | ❌ | Drawer - needs review |
| 10 | BulkEditVolumeModal.tsx | ❌ | Modal - likely has hardcoded text |
| 11 | BulkTextImportModal.tsx | ❌ | Modal - needs review |
| 12 | ChapterAccessSummary.tsx | ❌ | Summary component - needs review |
| 13 | ChapterForm.tsx | ✅ | Recently updated with genres translation - mostly done |
| 14 | ChapterImageGallery.tsx | ⚠️ | Partially translated (loading text) |
| 15 | ChapterStats.tsx | ❌ | Stats component - needs review |
| 16 | ChapterSummary.tsx | ✅ | Recently updated with genres translation |
| 17 | ChapterView.tsx | ❌ | Display component - needs review |
| 18 | ConfirmDialog.tsx | ❌ | Dialog component - may have hardcoded text |
| 19 | ContextMenu.tsx | ❌ | Context menu - likely needs translation |
| 20 | DragDropOverlay.tsx | ⚠️ | Partially translated (has display text) |
| 21 | DuplicateManager.tsx | ❌ | Manager component - needs review |
| 22 | FloatingActionButton.tsx | ❌ | Button component - needs review |
| 23 | GroupButton.tsx | ❌ | Button group - needs review |
| 24 | HistoryTimeline.tsx | ❌ | Timeline - needs review |
| 25 | ImageGallery.tsx | ❌ | Gallery - needs review |
| 26 | ImageUpload.example.tsx | ❌ | Example file - review if used |
| 27 | ImageUpload.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Error messages, placeholders, titles (see audit report) |
| 28 | LanguageSwitcher.tsx | ✅ | Language selection component |
| 29 | Layout.tsx | ⚠️ | Main layout - may have hardcoded navigation text |
| 30 | Modal.tsx | ❌ | Base modal component - may have hardcoded text |
| 31 | PricingLayout.tsx | ⚠️ | Partially translated (has title) |
| 32 | PromotionCard.tsx | ❌ | Card component - needs review |
| 33 | PromotionOverallImpact.tsx | ❌ | Impact display - needs review |
| 34 | PurchaseDistributionChart.tsx | ⚠️ | Chart - likely has data labels |
| 35 | PurchaseStatistics.tsx | ❌ | Stats display - needs review |
| 36 | PurchaseTimeline.tsx | ⚠️ | Timeline - may have hardcoded text |
| 37 | PurchaseTimelineChart.tsx | ⚠️ | Chart - likely has labels/tooltips |
| 38 | RefundManagement.tsx | ❌ | Management component - needs review |
| 39 | RevenueEvolutionChart.tsx | ⚠️ | Chart - likely has labels |
| 40 | SalesDistributionChart.tsx | ⚠️ | Chart - likely has labels |
| 41 | SchedulePublicationDrawer.tsx | ❌ | Drawer - needs review |
| 42 | SegmentedToggle.tsx | ❌ | Toggle component - may have hardcoded text |
| 43 | SmartTableGrid.tsx | ⚠️ | Table grid - may have hardcoded column headers |
| 44 | TableGrid.example.tsx | ❌ | Example file - review if used |
| 45 | TableGrid.tsx | ⚠️ | Table - may have hardcoded headers/labels |
| 46 | TagManager.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Many strings (see audit report) |
| 47 | TargetingSelector.tsx | ❌ | Selector - needs review |
| 48 | ToggleButton.tsx | ❌ | Button component - needs review |
| 49 | UserCard.tsx | ❌ | Card component - needs review |
| 50 | UserFilters.tsx | ❌ | Filter component - needs review |
| 51 | VolumeCard.tsx | ❌ | Card component - needs review |
| 52 | VolumeCardV2.tsx | ❌ | Updated card - needs review |
| 53 | VolumePerspectiverDrawer.tsx | ⚠️ | Drawer - may have hardcoded text |
| 54 | VolumeView.tsx | ❌ | View component - needs review |

---

## ADMIN APP - PAGES

| # | Page | Status | Notes |
|---|------|--------|-------|
| 1 | AuditLogs.tsx | ❌ | Audit page - needs review |
| 2 | BundleForm.tsx | ⚠️ | **FOUND HARDCODED TEXT IN ENGLISH** - Error messages, placeholders (see audit report) |
| 3 | Bundles.tsx | ❌ | Bundle list - needs review |
| 4 | ChapterDetail.tsx | ⚠️ | Detail page - partially translated |
| 5 | ChapterPricesPage.tsx | ❌ | Pricing page - needs review |
| 6 | Chapters.tsx | ✅ | Chapter list - uses translations |
| 7 | Dashboard.tsx | ⚠️ | Dashboard - may have hardcoded labels |
| 8 | Login.tsx | ⚠️ | Login page - likely has hardcoded text |
| 9 | OrderDetail.tsx | ❌ | Order detail - needs review |
| 10 | Orders.tsx | ❌ | Orders list - needs review |
| 11 | PriceForm.tsx | ❌ | Form - needs review |
| 12 | PriceHistoryPage.tsx | ⚠️ | History page - may have hardcoded text |
| 13 | PriceSchemasPage.tsx | ❌ | Schema page - needs review |
| 14 | PricesPage.tsx | ⚠️ | Pricing page - may have hardcoded text |
| 15 | PromotionForm.tsx | ❌ | Form - needs review |
| 16 | Promotions.tsx | ❌ | Promotions list - needs review |
| 17 | PromotionsPage.tsx | ❌ | Alternative promotions page - needs review |
| 18 | PublishingCalendar.tsx | ❌ | Calendar - needs review |
| 19 | Register.tsx | ❌ | Registration page - needs review |
| 20 | Reviews.tsx | ❌ | Reviews page - needs review |
| 21 | Settings.tsx | ❌ | Settings page - needs review |
| 22 | SystemConfig.tsx | ❌ | System config - needs review |
| 23 | UserActivityLog.tsx | ❌ | Activity log - needs review |
| 24 | UserDetail.tsx | ❌ | User detail - needs review |
| 25 | UserDetailImproved.tsx | ❌ | Improved user detail - needs review |
| 26 | Users.tsx | ❌ | Users list - needs review |
| 27 | VolumeForm.tsx | ❌ | Form - needs review |

---

## WEB APP - COMPONENTS

| # | Component | Status | Notes |
|---|-----------|--------|-------|
| 1 | account/AccountInfo.tsx | ❌ | Account info - needs review |
| 2 | account/ConnectedDevices.tsx | ❌ | Devices list - needs review |
| 3 | account/MyReviews.tsx | ⚠️ | Reviews - may have hardcoded text |
| 4 | account/Notifications.tsx | ❌ | Notifications - needs review |
| 5 | account/PaymentMethods.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Placeholders (see audit report) |
| 6 | account/Preferences.tsx | ❌ | Preferences - needs review |
| 7 | account/PurchaseHistory.tsx | ❌ | Purchase history - needs review |
| 8 | account/Subscription.tsx | ❌ | Subscription - needs review |
| 9 | account/SupportClaims.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Placeholders (see audit report) |
| 10 | Carousel.tsx | ❌ | Carousel - needs review |
| 11 | catalog/ChapterCard.tsx | ❌ | Card - needs review |
| 12 | catalog/VolumeList.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Empty state, labels (see audit report) |
| 13 | ChapterReviewDrawer.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Placeholder (see audit report) |
| 14 | common/ChapterCard.tsx | ❌ | Card - needs review |
| 15 | common/ChapterCover.tsx | ❌ | Cover - needs review |
| 16 | common/ErrorMessage.tsx | ❌ | Error display - needs review |
| 17 | common/Layout.tsx | ❌ | Layout - needs review |
| 18 | common/LayoutNew.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Placeholders (see audit report) |
| 19 | common/PlanCard.tsx | ❌ | Plan card - needs review |
| 20 | common/ProtectedRoute.tsx | ❌ | Route wrapper - may have text |
| 21 | common/ReviewStars.tsx | ❌ | Rating - needs review |
| 22 | common/ScrollToTop.tsx | ❌ | Scroll button - needs review |
| 23 | common/Toast.tsx | ⚠️ | Toast - may have hardcoded text |
| 24 | EndOfVolumeUI.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Many labels (see audit report) |
| 25 | LanguageSwitcher.tsx | ✅ | Language switcher |
| 26 | PricingSection.tsx | ❌ | Pricing section - needs review |
| 27 | PurchaseDrawer.tsx | ❌ | Purchase drawer - needs review |
| 28 | reader/PerspectiveSwitch.tsx | ❌ | Perspective - needs review |
| 29 | reader/ReadingSettings.tsx | ❌ | Settings - needs review |
| 30 | ReaderDrawer.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Alert messages (see audit report) |
| 31 | ReviewsList.tsx | ❌ | Reviews list - needs review |
| 32 | ReviewsSection.tsx | ❌ | Reviews section - needs review |
| 33 | Toast.tsx | ⚠️ | Toast - may have hardcoded text |
| 34 | WaitTimer.tsx | ❌ | Timer - needs review |

---

## WEB APP - PAGES

| # | Page | Status | Notes |
|---|------|--------|-------|
| 1 | Account.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Menu labels, welcome (see audit report) |
| 2 | ActiveTimers.tsx | ❌ | Timers list - needs review |
| 3 | Auth/Login.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Many labels (see audit report) |
| 4 | Auth/Register.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Many labels (see audit report) |
| 5 | Catalogue.tsx | ❌ | Catalog page - needs review |
| 6 | Chapter.tsx | ⚠️ | Chapter display - partially translated |
| 7 | Home.tsx | ⚠️ | **FOUND HARDCODED TEXT** - Entire page in French (see audit report) |
| 8 | HomeNew.tsx | ❌ | Alternative home - needs review |
| 9 | Landing.tsx | ❌ | Landing page - needs review |
| 10 | Library.tsx | ❌ | Library page - needs review |
| 11 | Profile.tsx | ❌ | Profile page - needs review |
| 12 | Reader.tsx | ❌ | Reader page - needs review |

---

## Priority Items (HIGH)

### Critical - English text in French admin:
- [ ] **BundleForm.tsx** - Lines 78, 115, 137, 141, 145, 149, 349, 369
  - Contains English error messages and validation text
  - Need French translations ASAP

### Critical - Web App Landing Pages:
- [ ] **Home.tsx** - Entire page hardcoded in French
- [ ] **Login.tsx** - All UI text hardcoded
- [ ] **Register.tsx** - All UI text hardcoded

### High Priority - Components with many hardcoded strings:
- [ ] **TagManager.tsx** - 30+ hardcoded strings
- [ ] **ImageUpload.tsx** - Error messages, titles, help text
- [ ] **Account.tsx** - Menu structure + welcome message

---

## Completed Tasks

### Translation Keys Already Added
✅ **Genre translations** (15 genres in EN/FR)
✅ **Chapter form translations**
✅ **Chapter detail modal translations**
✅ **Context menu translations**
✅ **View mode translations (card, list, calendar)**

### Components Already Updated
✅ **ChapterForm.tsx** - Using useGenreLabels() hook
✅ **ChapterSummary.tsx** - Using translated genre labels

---

## Translation Key Categories Needed

Based on audit, these key categories are missing:

### Admin Categories:
- `admin.tags.*` - Tag management (30+ keys)
- `admin.bundles.*` - Bundle management
- `admin.chapters.*` - Chapter management
- `admin.volumes.*` - Volume management
- `admin.users.*` - User management
- `admin.orders.*` - Order management
- `admin.promotions.*` - Promotion management
- `admin.uploads.*` / `upload.*` - File upload
- `admin.dashboard.*` - Dashboard
- `admin.pricing.*` - Pricing management
- `admin.reviews.*` - Review management
- `admin.audit.*` - Audit logs
- `admin.settings.*` - Settings
- `admin.calendar.*` - Publishing calendar
- `admin.refunds.*` - Refund management

### Web Categories:
- `auth.login.*` - Login page (20+ keys)
- `auth.register.*` - Register page (20+ keys)
- `account.*` - Account management (20+ keys)
- `account.menu.*` - Account menu items
- `volumes.*` - Volume display (10+ keys)
- `catalog.*` - Catalog section (10+ keys)
- `reader.*` - Reader features (20+ keys)
- `support.*` - Support/claims (5+ keys)
- `payment.*` - Payment methods (5+ keys)
- `home.*` - Home/landing page (20+ keys)
- `common.footer.*` - Footer text

---

## Implementation Plan

### Phase 1: Critical Fixes (English in Admin)
1. Fix BundleForm.tsx English text
2. Add admin bundle translation keys
3. Update BundleForm to use i18n

### Phase 2: Auth Pages (Web)
1. Add auth.login.* keys (20+ keys)
2. Add auth.register.* keys (20+ keys)
3. Update Login.tsx to use i18n
4. Update Register.tsx to use i18n

### Phase 3: Landing Page (Home)
1. Add home.* keys (20+ keys)
2. Update Home.tsx to use i18n

### Phase 4: Account Management
1. Add account.* keys (30+ keys)
2. Update Account.tsx, related components

### Phase 5: Tag Manager & Uploads
1. Add admin.tags.* keys (30+ keys)
2. Update TagManager.tsx, ImageUpload.tsx

### Phase 6: Remaining Components
1. Add remaining translation keys
2. Update all remaining components

---

## Notes

- Total estimated translation keys to add: **300-400+ keys**
- Priority: Fix English text in admin first
- Strategy: Batch components by similarity (e.g., all auth pages together)
- Keep translation keys organized by feature/page

---

**Generated**: 2026-02-02
**Status**: 🔄 In Progress - Start with HIGH priority items
