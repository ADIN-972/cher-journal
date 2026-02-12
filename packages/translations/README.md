# @cher-journal/translations

Shared translation files for all Cher Journal applications (Admin, Web, Backend, Mobile, etc.)

## Overview

This package centralizes all translation files used across the Cher Journal platform. Instead of maintaining separate translation files in each app, all translations are managed in one place for consistency and ease of maintenance.

## Structure

```
packages/translations/
├── locales/
│   ├── en/
│   │   └── common.json         # English translations
│   └── fr/
│       └── common.json         # French translations
├── src/
│   └── index.ts                # Type definitions and helpers
├── package.json
└── README.md                   # This file
```

## Supported Languages

- **English** (`en`) - Default
- **Français** (`fr`)

## Usage

### For Web/Admin Apps (Frontend)

Load translations from the public path:

```typescript
// Fetch from /locales/{lang}/common.json
const response = await fetch(`/locales/${lang}/common.json`);
const translations = await response.json();
```

### For Backend (Node.js)

Import the package and use helper functions:

```typescript
import { getTranslationPath, SUPPORTED_LANGUAGES } from '@cher-journal/translations';

// Get path to translation file
const path = getTranslationPath('en');
// → './locales/en/common.json'

// Get all supported languages
console.log(SUPPORTED_LANGUAGES); // ['en', 'fr']
```

### For Type Safety

Use TypeScript types for translation keys:

```typescript
import type { TranslationKeys, Language } from '@cher-journal/translations';

type Translations = Record<Language, TranslationKeys>;
```

## Translation Keys Structure

Translations are organized by feature/page:

### Categories

- **navigation** - Navigation menu items
- **header** - Header components
- **home** - Home page
- **catalog** - Catalog/browse section
- **chapter** - Story/chapter details
- **library** - User library
- **reader** - Reading interface
- **account** - User account
- **purchase** - Purchase/checkout
- **auth** - Authentication
- **errors** - Error messages
- **common** - Shared/generic text
- **messages** - Status messages

### Example Keys

```json
{
  "navigation": {
    "home": "Home",
    "catalog": "Catalog",
    "library": "My Library"
  },
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## Adding New Translations

### 1. Add to English File

Edit `locales/en/common.json`:

```json
{
  "feature": {
    "new_key": "New translation"
  }
}
```

### 2. Add to French File

Edit `locales/fr/common.json`:

```json
{
  "feature": {
    "new_key": "Nouvelle traduction"
  }
}
```

### 3. Use in App

```typescript
const { t } = useTranslation();
return <div>{t('feature.new_key')}</div>;
```

### 4. Verify

```bash
npm run verify:translations
```

## Key Features

### ✅ Centralized Management
- Single source of truth for all translations
- Consistent terminology across apps
- Easy to maintain and update

### ✅ Multi-Language Support
- English and French included
- Easy to add new languages
- Language detection and persistence

### ✅ Type Safety
- TypeScript types for translation keys
- IDE autocomplete support
- Compile-time key validation

### ✅ Interpolation Support
- Dynamic values in translations
- Example: `"Unlock in {{time}}"` → `"Unlock in 2 hours"`

### ✅ Verification
- Unified verification script
- Checks both Admin and Web
- Reports missing/unused keys

## Integration with Apps

### Web App (`apps/web`)

```typescript
// In apps/web/src/lib/i18n.ts
async function loadTranslations(lang: Language) {
  const response = await fetch(`/locales/${lang}/common.json`);
  return response.json();
}

// Files served from public/:
// apps/web/public/locales/{lang}/common.json
```

### Admin App (`apps/admin`)

Similar setup - translations served from public directory.

### Backend API

```typescript
import { getTranslationPath, DEFAULT_LANGUAGE } from '@cher-journal/translations';

// Get path for backend usage
const translationPath = getTranslationPath('en');
```

## File Locations

### Shared Package
- `packages/translations/locales/en/common.json` - English translations (source)
- `packages/translations/locales/fr/common.json` - French translations (source)

### App Public Folders
- `apps/web/public/locales/en/common.json` - Copied from package
- `apps/web/public/locales/fr/common.json` - Copied from package
- `apps/admin/public/locales/en/common.json` - Copied from package
- `apps/admin/public/locales/fr/common.json` - Copied from package

## Workflow

### Before Commit

1. **Update Translations**
   - Add/modify keys in both `en/common.json` and `fr/common.json`
   - Keep terminology consistent

2. **Use in Code**
   - Wrap text with `t()` function
   - Use proper key naming: `feature.action`

3. **Verify Completeness**
   ```bash
   npm run verify:translations
   ```

4. **Test Both Languages**
   - Switch language in app
   - Verify rendering in both EN and FR

5. **Commit**
   ```bash
   git commit -m "feat: Add translations for [feature]

   - Added keys to packages/translations/locales/{en,fr}/common.json
   - Integrated translations in [app] components
   - Verified with npm run verify:translations"
   ```

## Best Practices

### DO ✅
- Update BOTH en and fr files simultaneously
- Use descriptive, hierarchical key names
- Group related translations by feature
- Use snake_case for all keys
- Run verification before committing
- Keep terminology consistent across languages

### DON'T ❌
- Hardcode strings in components
- Forget to translate to all languages
- Use inconsistent key naming
- Create overly generic keys
- Skip verification
- Translate brand names or proper nouns

## Translation Coverage

Current coverage: **500+ keys**

### Categories
- Admin Panel features
- Web App features
- Shared UI components
- Error messages
- Common actions

## Commands

### Verify Translations
```bash
npm run verify:translations
```
Scans both Admin and Web apps for:
- Missing translations
- Unused keys
- Coverage percentage

### View Translation Stats
```bash
# Count translations
wc -l packages/translations/locales/en/common.json

# View structure
jq keys packages/translations/locales/en/common.json
```

## Adding a New Language

To add a new language (e.g., Spanish):

1. **Create files**
   ```
   packages/translations/locales/es/common.json
   ```

2. **Copy English structure**
   - Start from `locales/en/common.json`
   - Translate all values to target language

3. **Update index.ts**
   ```typescript
   export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'es'];

   export const LANGUAGE_INFO = {
     // ... existing
     es: {
       name: 'Español',
       code: 'es',
       direction: 'ltr',
     },
   };
   ```

4. **Update apps**
   - Copy files to `apps/web/public/locales/es/common.json`
   - Copy files to `apps/admin/public/locales/es/common.json`

5. **Verify**
   ```bash
   npm run verify:translations
   ```

## Troubleshooting

### Translation Not Found
- Check JSON syntax in translation files
- Verify key name matches exactly (case-sensitive)
- Ensure key exists in BOTH en and fr files

### Language Not Switching
- Check browser localStorage
- Verify language persistence
- Check app refresh behavior

### Missing Keys in Verification
- Add key to both `en/common.json` and `fr/common.json`
- Use consistent naming convention
- Run verification again

## Performance

- Translation files loaded once at app startup
- Cached in React Context
- No runtime parsing overhead
- Minimal bundle size impact (~15KB for all languages)
- localStorage used for language persistence

## Support

For issues or questions about translations:

1. Check `WEB-TRANSLATIONS-GUIDE.md` for frontend usage
2. Review `WEB-APP-TRANSLATION-SETUP.md` for setup
3. See `TRANSLATIONS-VERIFICATION.md` for verification details
4. Run `npm run verify:translations` to identify issues

## Contributing

When adding new translations:

1. Follow the structure and naming conventions
2. Ensure both languages are complete
3. Test in both EN and FR
4. Run verification before commit
5. Keep consistency with existing terminology

## License

MIT

---

**Last Updated**: 2026-02-01
**Version**: 1.0.0
**Status**: Active
