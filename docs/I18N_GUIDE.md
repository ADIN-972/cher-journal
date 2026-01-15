# i18n System - Documentation & Guidelines

## Overview

The Cher Journal admin panel uses a custom i18n (internationalization) system that supports multiple languages with fallback to English. Currently supported languages:
- **English** (en)
- **Français** (fr)

## Architecture

### Components

1. **I18nProvider** (`src/lib/i18n.tsx`)
   - React Context provider that loads and manages translations
   - Stores language preference in localStorage
   - Provides `useI18n` hook for components

2. **LanguageSwitcher** (`src/components/LanguageSwitcher.tsx`)
   - Dropdown button in header to switch languages
   - Persists selection to localStorage

3. **Translation Files** (`public/locales/[lang]/common.json`)
   - JSON files with all UI strings
   - Organized by feature (navigation, chapters, users, etc.)
   - Keys use dot notation for nesting

## Usage

### In Components

```typescript
import { useI18n } from "../lib/i18n";

export function MyComponent() {
  const { t, language } = useI18n();
  
  return <button>{t("common.save")}</button>;
}
```

### Adding a New Translation Key

1. Add the key to BOTH `public/locales/en/common.json` and `public/locales/fr/common.json`
2. Use dot notation for nested keys: `"chapters.no_chapters"`
3. Run verification: `npm run i18n:check`

### Key Naming Convention

- Use **snake_case** for keys
- Organize by feature in top-level categories:
  - `navigation.*` - Navigation elements
  - `chapters.*` - Chapter-related strings
  - `users.*` - User-related strings
  - `orders.*` - Order-related strings
  - `common.*` - Common, reusable strings
  - `header.*` - Header elements

Example:
```json
{
  "chapters": {
    "title": "Chapters",
    "no_chapters": "No chapters at this time",
    "confirm_delete": "Are you sure?"
  }
}
```

## Translation Verification Agent

### Purpose
Ensures all translation keys are present in both EN and FR files.

### Running the Agent
```bash
npm run i18n:check
```

### Output
The agent will:
- List all translation files found
- Check each language has all required keys
- Report missing keys by language
- Exit with code 0 (success) or 1 (failure)

### Example Output
```
🔍 i18n Translation Verification Agent

============================================================

📄 Checking common.json...
   Found 45 keys in en/common.json
   ✅ FR: All keys present

============================================================
✅ All translations are complete!
```

## File Structure

```
apps/admin/
├── public/
│   └── locales/
│       ├── en/
│       │   └── common.json
│       └── fr/
│           └── common.json
├── src/
│   ├── lib/
│   │   └── i18n.tsx          (Provider + Hook)
│   ├── components/
│   │   └── LanguageSwitcher.tsx
│   └── main.tsx              (Wrapped with I18nProvider)
└── scripts/
    └── verify-i18n.ts        (Verification Agent)
```

## Setup Instructions

### Initial Setup
1. Wrap your app with `I18nProvider` in `main.tsx`:
```typescript
import { I18nProvider } from './lib/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </I18nProvider>
);
```

2. Add `LanguageSwitcher` to your header (already done in Layout.tsx)

### Adding a New Translation File
1. Create `public/locales/en/[file].json`
2. Create `public/locales/fr/[file].json` with identical keys
3. Update i18nProvider to load the new file (optional, can use common.json)

## Important Notes

- **Default language** is French (fr)
- **Fallback language** is English (en)
- **localStorage key** for language preference: `language`
- **Missing keys** return the key itself as a fallback
- **Performance** - Translations are loaded once on app startup
- **Static hosting** - Translation files are served from `public/` directory

## Future Enhancements

- [ ] Add more languages (Spanish, German, etc.)
- [ ] Create extraction tool to find untranslated hardcoded strings
- [ ] Support for plural forms and interpolation
- [ ] Dynamic loading of translation files (vs pre-loaded)
- [ ] Server-side rendering support

## Troubleshooting

### Translations not loading
- Check that translation files exist in `public/locales/[lang]/common.json`
- Verify JSON is valid (use JSON linter)
- Check browser console for 404 errors

### Language not persisting
- Clear localStorage and refresh
- Check `localStorage.getItem('language')` in console
- Verify browser allows localStorage

### Verification fails
- Run `npm run i18n:check` to find missing keys
- Add missing keys to both EN and FR files
- Ensure key names match exactly (case-sensitive)

