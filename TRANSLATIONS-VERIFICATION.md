# Translation Verification System

## Purpose
This system automatically scans all UI components (Pages and Components) to ensure every translatable string is properly translated in both English and French locales.

## How It Works

### Run Translation Verification
After completing a feature that includes UI changes:

```bash
npm run verify:translations
```

This will:
1. 🔍 Scan all `.tsx` and `.ts` files in `pages/` and `components/` directories
2. 📋 Extract all translation keys (format: `t('key')` or `t("key")`)
3. ✅ Verify each key exists in both `en/common.json` and `fr/common.json`
4. ⚠️ Identify unused translation keys
5. 📊 Generate comprehensive report

## What Gets Checked

### Translation Keys Extraction
The script finds all text wrapped with the `t()` function:

```tsx
// ✅ These are detected:
<h1>{t('pages.dashboard.title')}</h1>
<button>{t('buttons.save')}</button>
<p>{t('common.description')}</p>

// ❌ These are NOT detected (not using t() function):
<h1>Dashboard</h1>
<button>Save</button>
```

### Structure
Translation files are organized by namespace:

```
apps/admin/public/locales/
├── en/
│   └── common.json
└── fr/
    └── common.json
```

Example structure in `common.json`:

```json
{
  "pages": {
    "dashboard": {
      "title": "Dashboard",
      "subtitle": "Manage your content"
    }
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## Sample Output

```
🌍 Translation Verification

📱 Verifying Admin Panel

  Found 45 component files
  Found 120 unique translation keys

  ❌ Missing Translations: 3
     Key: buttons.delete
     File: src/pages/Orders.tsx:145
     Missing in: fr (Français)

     Key: pages.users.confirmDelete
     File: src/components/UserModal.tsx:78
     Missing in: en (English)

     Key: messages.error.network
     File: src/pages/Dashboard.tsx:234
     Missing in: en (English), fr (Français)

  ⚠️  Unused Keys: 5
     English: pages.old.title, dialogs.archived.message... (+3)
     Français: pages.legacy.subtitle, modals.deprecated.text... (+2)

📱 Verifying Web App

  Found 32 component files
  Found 87 unique translation keys

  ✅ All used keys are translated!

📊 Overall Summary

✅ Complete: 207 / ⚠️  Partial: 3 / Total: 210
❌ Missing in English: 1
❌ Missing in Français: 2
⚠️  Unused translation keys: 5

⚠️ Translation issues found. See details above.
```

## Adding New Translations

### 1. Use Translation Key in Component
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('pages.mypage.heading')}</h1>;
}
```

### 2. Add to Translation Files

**apps/admin/public/locales/en/common.json:**
```json
{
  "pages": {
    "mypage": {
      "heading": "My Page Title"
    }
  }
}
```

**apps/admin/public/locales/fr/common.json:**
```json
{
  "pages": {
    "mypage": {
      "heading": "Titre de ma page"
    }
  }
}
```

### 3. Verify with Script
```bash
npm run verify:translations
```

## Key Naming Conventions

Follow these conventions for translation keys:

- **Pages**: `pages.pageName.elementType`
  - Example: `pages.dashboard.title`, `pages.users.subtitle`

- **Components**: `components.componentName.text`
  - Example: `components.header.logo`, `components.modal.close`

- **Buttons**: `buttons.actionName`
  - Example: `buttons.save`, `buttons.cancel`, `buttons.delete`

- **Messages**: `messages.type.key`
  - Example: `messages.error.notFound`, `messages.success.saved`

- **Common**: `common.word`
  - Example: `common.loading`, `common.search`, `common.filter`

## Integration with Development Workflow

### After Each Feature with UI Changes
1. Complete the feature implementation
2. Wrap all text with `t()` function
3. Add keys to **both** `en/common.json` and `fr/common.json`
4. Run verification:
   ```bash
   npm run verify:translations
   ```
5. If tests pass: ✅ Feature is translatable
6. If tests fail: Add missing translations

### Pre-Commit Checklist
- [ ] All UI text uses `t()` function
- [ ] All translation keys in components
- [ ] Keys exist in `en/common.json`
- [ ] Keys exist in `fr/common.json`
- [ ] `npm run verify:translations` passes

## Troubleshooting

### "Found 0 component files"
Make sure files exist in:
- `apps/admin/src/pages/**/*.tsx`
- `apps/admin/src/components/**/*.tsx`
- `apps/web/src/pages/**/*.tsx`
- `apps/web/src/components/**/*.tsx`

### "Missing translations" for existing keys
The script couldn't find the key in the translation file:
1. Check JSON syntax in `common.json`
2. Verify key path matches exactly (case-sensitive)
3. Ensure all nested objects are defined

### "Unused translation keys" warnings
Translation keys exist but aren't used in components:
1. Search the codebase for the key
2. If truly unused, delete from translation files
3. If still needed, check `t()` function call format

## Extending Verification

To add more apps or customize key extraction, edit `verify-translations.ts`:

```typescript
// Add new app to verification
await verifyApp(webPath, 'Web App');

// Customize key detection pattern (line 30)
const regex = /t\(['"`]([a-zA-Z0-9_.]+)['"`]\)/g;
```

## Examples in Codebase

See these files for good translation practices:
- `apps/admin/src/pages/Dashboard.tsx`
- `apps/admin/src/components/Layout.tsx`
- `apps/admin/public/locales/en/common.json`
- `apps/admin/public/locales/fr/common.json`
