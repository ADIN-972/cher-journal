/**
 * Translation Verification Script
 * Verifies all UI text is properly translated in all locales
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

interface TranslationStatus {
  key: string;
  file: string;
  lineNumber?: number;
  locales: {
    en?: boolean;
    fr?: boolean;
  };
  status: 'MISSING' | 'PARTIAL' | 'COMPLETE';
}

interface TranslationReport {
  totalKeys: number;
  completeKeys: number;
  partialKeys: number;
  missingKeys: TranslationStatus[];
  unusedKeys: string[];
  enMissing: string[];
  frMissing: string[];
}

const report: TranslationReport = {
  totalKeys: 0,
  completeKeys: 0,
  partialKeys: 0,
  missingKeys: [],
  unusedKeys: [],
  enMissing: [],
  frMissing: []
};

async function getComponentFiles(appPath: string): Promise<string[]> {
  const patterns = [
    `${appPath}/src/pages/**/*.tsx`,
    `${appPath}/src/pages/**/*.ts`,
    `${appPath}/src/components/**/*.tsx`,
    `${appPath}/src/components/**/*.ts`
  ];

  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern);
    files.push(...matches);
  }
  return [...new Set(files)];
}

function extractTranslationKeys(fileContent: string, filePath: string): Map<string, number> {
  const keys = new Map<string, number>();
  // Match patterns: t('key'), t("key"), t(`key`), t('key.nested'), t("key.nested")
  const regex = /t\(['"`]([a-zA-Z0-9_.]+)['"`]\)/g;

  let match;
  let lineNumber = 1;
  for (let i = 0; i < fileContent.length; i++) {
    if (fileContent[i] === '\n') lineNumber++;
  }

  const lines = fileContent.split('\n');
  lineNumber = 0;
  for (const line of lines) {
    lineNumber++;
    const lineMatches = [...line.matchAll(regex)];
    for (const m of lineMatches) {
      const key = m[1];
      if (!keys.has(key)) {
        keys.set(key, lineNumber);
      }
    }
  }

  return keys;
}

function loadTranslationFile(locale: string, appPath: string): Record<string, any> {
  const filePath = path.join(appPath, 'public', 'locales', locale, 'common.json');
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    console.warn(chalk.yellow(`⚠️  Translation file not found: ${filePath}`));
    return {};
  }
}

function flattenTranslationObject(obj: Record<string, any>, prefix = ''): Set<string> {
  const keys = new Set<string>();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenTranslationObject(value, fullKey).forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

async function verifyApp(appPath: string, appName: string) {
  console.log(chalk.cyan.bold(`\n📱 Verifying ${appName}\n`));

  // Get all component files
  const files = await getComponentFiles(appPath);

  if (files.length === 0) {
    console.log(chalk.gray(`  No component files found in ${appPath}`));
    return;
  }

  console.log(chalk.gray(`  Found ${files.length} component files`));

  // Extract all translation keys from components
  const usedKeys = new Map<string, { file: string; line: number }>();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractTranslationKeys(content, file);

    for (const [key, line] of keys) {
      if (!usedKeys.has(key)) {
        usedKeys.set(key, { file: path.relative(appPath, file), line });
      }
    }
  }

  console.log(chalk.gray(`  Found ${usedKeys.size} unique translation keys\n`));

  // Load translation files
  const enTranslations = loadTranslationFile('en', appPath);
  const frTranslations = loadTranslationFile('fr', appPath);

  const enKeys = flattenTranslationObject(enTranslations);
  const frKeys = flattenTranslationObject(frTranslations);

  // Check each used key
  const appMissing: TranslationStatus[] = [];

  for (const [key, location] of usedKeys) {
    const hasEn = enKeys.has(key);
    const hasFr = frKeys.has(key);

    const status = usedKeys.has(key) ?
      (hasEn && hasFr ? 'COMPLETE' : 'PARTIAL') :
      'MISSING';

    if (!hasEn || !hasFr) {
      appMissing.push({
        key,
        file: location.file,
        lineNumber: location.line,
        locales: { en: hasEn, fr: hasFr },
        status
      });

      if (!hasEn) report.enMissing.push(key);
      if (!hasFr) report.frMissing.push(key);
    }

    report.totalKeys++;
    if (status === 'COMPLETE') report.completeKeys++;
    else if (status === 'PARTIAL') report.partialKeys++;
  }

  // Find unused translation keys
  const unusedInEn: string[] = [];
  const unusedInFr: string[] = [];

  for (const key of enKeys) {
    if (!usedKeys.has(key)) {
      unusedInEn.push(key);
      report.unusedKeys.push(`${appName}:en:${key}`);
    }
  }

  for (const key of frKeys) {
    if (!usedKeys.has(key)) {
      unusedInFr.push(key);
      report.unusedKeys.push(`${appName}:fr:${key}`);
    }
  }

  // Display results
  if (appMissing.length > 0) {
    console.log(chalk.red.bold(`  ❌ Missing Translations: ${appMissing.length}`));
    for (const item of appMissing) {
      console.log(chalk.red(`     Key: ${item.key}`));
      console.log(chalk.gray(`     File: ${item.file}:${item.lineNumber}`));
      if (!item.locales.en) console.log(chalk.red(`     Missing in: en (English)`));
      if (!item.locales.fr) console.log(chalk.red(`     Missing in: fr (Français)`));
      console.log('');
    }
    report.missingKeys.push(...appMissing);
  } else {
    console.log(chalk.green(`  ✅ All used keys are translated!`));
  }

  if (unusedInEn.length > 0 || unusedInFr.length > 0) {
    console.log(chalk.yellow.bold(`  ⚠️  Unused Keys: ${unusedInEn.length + unusedInFr.length}`));
    if (unusedInEn.length > 0) {
      console.log(chalk.yellow(`     English: ${unusedInEn.slice(0, 5).join(', ')}${unusedInEn.length > 5 ? `... (+${unusedInEn.length - 5})` : ''}`));
    }
    if (unusedInFr.length > 0) {
      console.log(chalk.yellow(`     Français: ${unusedInFr.slice(0, 5).join(', ')}${unusedInFr.length > 5 ? `... (+${unusedInFr.length - 5})` : ''}`));
    }
  }
}

async function runVerification() {
  console.log(chalk.cyan.bold('\n🌍 Translation Verification\n'));
  console.log(chalk.gray('Checking all UI components for proper translation coverage'));
  console.log(chalk.gray('Verifying both Admin Panel and Web App for consistency\n'));

  const adminPath = path.join(process.cwd(), 'apps', 'admin');
  const webPath = path.join(process.cwd(), 'apps', 'web');

  console.log(chalk.cyan('📱 Applications to Verify:\n'));
  console.log(chalk.gray('  ✓ Admin Panel (apps/admin/src/)'));
  console.log(chalk.gray('  ✓ Web App (apps/web/src/)\n'));
  console.log(chalk.cyan('Languages:'));
  console.log(chalk.gray('  ✓ English (en)'));
  console.log(chalk.gray('  ✓ Français (fr)\n'));

  await verifyApp(adminPath, 'Admin Panel');
  await verifyApp(webPath, 'Web App');

  // Summary
  console.log(chalk.cyan.bold(`\n📊 Overall Summary\n`));
  console.log(`${chalk.green(`✅ Complete: ${report.completeKeys}`)} / ${chalk.yellow(`⚠️  Partial: ${report.partialKeys}`)} / Total: ${report.totalKeys}`);

  if (report.enMissing.length > 0) {
    console.log(chalk.red(`❌ Missing in English: ${report.enMissing.length}`));
  }

  if (report.frMissing.length > 0) {
    console.log(chalk.red(`❌ Missing in Français: ${report.frMissing.length}`));
  }

  if (report.unusedKeys.length > 0) {
    console.log(chalk.yellow(`⚠️  Unused translation keys: ${report.unusedKeys.length}`));
  }

  const hasIssues = report.missingKeys.length > 0 || report.unusedKeys.length > 0;

  if (!hasIssues && report.totalKeys > 0) {
    console.log(chalk.green.bold('\n✨ All translations are complete and in use!\n'));
  } else if (hasIssues) {
    console.log(chalk.red.bold('\n⚠️  Translation issues found. See details above.\n'));
  }

  process.exit(hasIssues ? 1 : 0);
}

runVerification().catch((error) => {
  console.error(chalk.red('Translation verification failed:'), error);
  process.exit(1);
});
