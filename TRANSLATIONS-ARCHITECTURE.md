# Translations Architecture - Centralized in Shared Package

## Overview

All translations are now centralized in a single location to eliminate duplication and ensure consistency across all applications (admin, web).

```
packages/translations/locales/
├── en/
│   └── common.json
└── fr/
    └── common.json
```

## How It Works

1. **Single Source of Truth**: `packages/translations/locales/{en,fr}/common.json`
2. **Apps Load from**: `/locales/{language}/common.json` (served from their public folders)
3. **Sync Script**: Copies files from package to app locales automatically

## Key Files

- **Package (Source)**: `packages/translations/locales/{en,fr}/common.json`
- **Admin App**: `apps/admin/public/locales/{en,fr}/common.json` (auto-synced)
- **Web App**: `apps/web/public/locales/{en,fr}/common.json` (auto-synced)
- **Sync Script**: `scripts/sync-translations.ts`

## Workflow for Developers

### When Adding/Modifying Translations

1. **Always** modify `packages/translations/locales/{language}/common.json`
2. Run sync script:
   ```bash
   npm run sync:translations
   ```
3. **Never** manually edit files in `apps/*/public/locales/`

### Before Deploying

1. Ensure all translations are in the package:
   ```bash
   npm run sync:translations
   ```
2. Commit the synced files:
   ```bash
   git add apps/*/public/locales/
   git commit -m "chore: sync translations"
   ```

## Translation Keys Structure

All keys follow dot notation. Examples:
- `auth.login.brand_name`
- `chapters_page.context.sort_az`
- `account.page_title`

## Benefits

✅ **No Duplication**: Changes in one place affect all apps
✅ **Consistency**: Same translations across admin and web
✅ **Single Maintenance**: Only manage in `packages/translations`
✅ **Predictable**: Clear source of truth

## Adding to Build Process (Optional)

To make sync automatic, add to your CI/CD or local git hooks:

```bash
npm run sync:translations
```

This ensures translations are always synchronized before builds.
