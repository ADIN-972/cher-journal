# Web App Translations Guide

## Setup

### 1. Translation Files Location

```
apps/web/
├── public/
│   └── locales/
│       ├── en/
│       │   └── common.json      # English translations
│       └── fr/
│           └── common.json      # French translations
```

### 2. Creating the i18n Hook

Create `apps/web/src/lib/i18n.ts`:

```typescript
import { useCallback } from 'react';

// Load translations
const loadTranslations = async (lang: string) => {
  const response = await fetch(`/locales/${lang}/common.json`);
  return response.json();
};

interface TranslationFunction {
  (key: string, defaultValue?: string): string;
  (key: string, params: Record<string, any>): string;
}

export function useTranslation(): { t: TranslationFunction } {
  const [language, setLanguage] = React.useState<'en' | 'fr'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'en' | 'fr') || 'en';
  });

  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const t: TranslationFunction = useCallback((key: string, params?: any) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key; // Fallback to key name if not found
    }

    // Simple interpolation: {{count}} → params.count
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return String(params[paramKey] || '');
      });
    }

    return value;
  }, [translations]);

  return { t };
}

export function useLanguage() {
  const [language, setLanguage] = React.useState<'en' | 'fr'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'en' | 'fr') || 'en';
  });

  const changeLanguage = useCallback((lang: 'en' | 'fr') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  return { language, changeLanguage };
}
```

### 3. Usage in Components

```typescript
import { useTranslation } from '@/lib/i18n';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <button>{t('common.explore')}</button>
    </div>
  );
}
```

## Translation Keys Structure

### Home Page
```
home.title              → "Cher Journal"
home.subtitle           → "Discover sensual stories"
home.featured           → "Featured Stories"
home.latest             → "Latest Releases"
home.popular            → "Most Read"
```

### Catalog
```
catalog.title           → "Catalog"
catalog.search          → "Search"
catalog.filter          → "Filter"
catalog.sort            → "Sort by"
catalog.no_results      → "No stories found"
```

### Chapter/Story
```
chapter.title           → "Story"
chapter.volumes         → "Volumes"
chapter.start_reading   → "Start Reading"
chapter.locked          → "Locked"
chapter.unlock_in       → "Unlock in {{time}}"
```

### Library (My Library)
```
library.title           → "My Library"
library.owned           → "Owned Stories"
library.reading         → "Currently Reading"
library.completed       → "Completed"
```

### Reader
```
reader.title            → "Reader"
reader.font_size        → "Font Size"
reader.theme            → "Theme"
reader.next_chapter     → "Next Chapter"
reader.previous_chapter → "Previous Chapter"
```

### Authentication
```
auth.login              → "Login"
auth.register           → "Register"
auth.email              → "Email"
auth.password           → "Password"
auth.login_success      → "Login successful"
```

### Account
```
account.title           → "My Account"
account.profile         → "Profile"
account.email           → "Email"
account.change_password → "Change Password"
```

### Common
```
common.loading          → "Loading..."
common.error            → "Error"
common.save             → "Save"
common.cancel           → "Cancel"
common.delete           → "Delete"
common.search           → "Search"
```

## Adding New Translations

### Step 1: Identify the Key
Determine the category and key name:
- `pages.catalog.search` for catalog search text
- `components.header.language` for header language selector
- `common.loading` for generic loading message

### Step 2: Add to English File
File: `apps/web/public/locales/en/common.json`

```json
{
  "catalog": {
    "search": "Search"
  }
}
```

### Step 3: Add to French File
File: `apps/web/public/locales/fr/common.json`

```json
{
  "catalog": {
    "search": "Rechercher"
  }
}
```

### Step 4: Use in Component
```typescript
const { t } = useTranslation();
return <input placeholder={t('catalog.search')} />;
```

### Step 5: Verify
```bash
npm run verify:translations
```

## Naming Conventions

### Format
Use `snake_case` for all keys with dot notation for nesting.

**Good**:
```
catalog.sort_by_newest
chapter.unlock_in_hours
common.loading
```

**Bad**:
```
catalogSortByNewest
ChapterUnlockInHours
COMMON_LOADING
```

### Categories
- `navigation.*` - Navigation items
- `header.*` - Header components
- `home.*` - Home page
- `catalog.*` - Catalog/browse
- `chapter.*` - Story/chapter details
- `library.*` - User library
- `reader.*` - Reading interface
- `account.*` - User account
- `auth.*` - Authentication
- `purchase.*` - Purchase flow
- `errors.*` - Error messages
- `common.*` - Shared/generic text

## Interpolation

For dynamic content, use `{{variable}}` syntax:

```json
{
  "chapter": {
    "chapter_number": "Chapter {{number}}",
    "unlock_in": "Unlock in {{time}}"
  }
}
```

Usage:
```typescript
t('chapter.chapter_number', { number: 5 })   // "Chapter 5"
t('chapter.unlock_in', { time: '23h 45m' })  // "Unlock in 23h 45m"
```

## Language Switching

```typescript
import { useLanguage } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <select value={language} onChange={(e) => changeLanguage(e.target.value as 'en' | 'fr')}>
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

## Verification

### Check Translation Completeness
```bash
npm run verify:translations
```

This will:
- ✅ Scan all components for `t('key')` calls
- ✅ Verify keys exist in both en and fr files
- ✅ Identify missing translations
- ✅ Identify unused keys
- ✅ Report coverage percentage

### Expected Output
```
🌍 Translation Verification

📱 Verifying Web App

  Found 32 component files
  Found 150 unique translation keys

  ✅ All used keys are translated!

📊 Overall Summary

✅ Complete: 150 / Total: 150

✨ All translations are complete and in use!
```

## Common Issues

### Issue: Key not found (shows key name instead)
**Cause**: Key missing from translation file
**Fix**: Add key to both `en/common.json` and `fr/common.json`

### Issue: Interpolation not working
**Pattern**: `t('key', { param: value })`
**Fix**: Check JSON key contains `{{param}}`

### Issue: Language not persisting
**Cause**: localStorage not being saved
**Fix**: Ensure `localStorage.setItem('language', lang)` is called

### Issue: Verification reports unused keys
**Cause**: Key in JSON but not used in any component
**Fix**: Either add `t('key')` to components or delete from JSON

## Best Practices

### DO ✅
- Always add keys to BOTH en and fr files simultaneously
- Use descriptive, hierarchical key names
- Group related translations by feature/page
- Use interpolation for dynamic content
- Run verification before committing
- Use consistency in terminology

### DON'T ❌
- Don't hardcode strings in JSX
- Don't forget translations for any language
- Don't use inconsistent key naming
- Don't create overly generic key names
- Don't commit without running verification
- Don't translate brand names or proper nouns

## Integration with Workflow

### Before Committing Web Changes
```bash
# 1. Ensure all text uses t()
# 2. Add keys to both en/common.json and fr/common.json
# 3. Run verification
npm run verify:translations

# 4. Check output for any missing keys
# ✅ All used keys are translated!
```

### Feature Development Checklist
- [ ] All UI text wrapped with `t()`
- [ ] Keys added to `en/common.json`
- [ ] Keys added to `fr/common.json`
- [ ] `npm run verify:translations` passes
- [ ] Language switch tested
- [ ] Both en and fr read correctly

## File Structure

```typescript
// ✅ CORRECT - Uses i18n
function LoginForm() {
  const { t } = useTranslation();
  return (
    <form>
      <label>{t('auth.email')}</label>
      <input placeholder={t('auth.email')} />
      <button>{t('auth.login')}</button>
    </form>
  );
}

// ❌ WRONG - Hardcoded text
function LoginForm() {
  return (
    <form>
      <label>Email</label>
      <input placeholder="Email" />
      <button>Login</button>
    </form>
  );
}
```

## Resources

- **Translation Files**: `apps/web/public/locales/{lang}/common.json`
- **i18n Hook**: `apps/web/src/lib/i18n.ts`
- **Verification Script**: `npm run verify:translations`
- **Documentation**: This guide + TRANSLATIONS-VERIFICATION.md

## Support

For translation issues:
1. Check this guide for patterns
2. Review existing translations in common.json
3. Run `npm run verify:translations` to find issues
4. See TRANSLATIONS-VERIFICATION.md for detailed help

---

**Last Updated**: 2026-02-01
**Status**: Active
**Coverage**: Admin Panel + Web App
