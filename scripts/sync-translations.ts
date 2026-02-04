import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const packageTranslationsDir = join(rootDir, 'packages/translations/locales');
const apps = ['admin', 'web'];
const languages = ['en', 'fr'];

console.log('🌍 Synchronizing translations from shared package...\n');

let syncedCount = 0;

apps.forEach((app) => {
  languages.forEach((lang) => {
    const srcFile = join(packageTranslationsDir, lang, 'common.json');
    const destDir = join(rootDir, `apps/${app}/public/locales/${lang}`);
    const destFile = join(destDir, 'common.json');

    try {
      mkdirSync(destDir, { recursive: true });
      copyFileSync(srcFile, destFile);
      console.log(`✅ ${app}/${lang}: Synced`);
      syncedCount++;
    } catch (error) {
      console.error(`❌ ${app}/${lang}: Failed to sync`, error instanceof Error ? error.message : error);
    }
  });
});

console.log(`\n✨ Translation sync complete! (${syncedCount}/${apps.length * languages.length} files synced)`);
console.log('\n📝 Remember: Always modify translations in packages/translations, not in individual apps!\n');
