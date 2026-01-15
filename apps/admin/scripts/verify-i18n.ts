#!/usr/bin/env node
/**
 * i18n Translation Verification Agent
 *
 * This script verifies that all translation keys are present in both EN and FR files.
 * Usage: npm run i18n:check
 */

import fs from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "public/locales");
const LANGUAGES = ["en", "fr"];
const DEFAULT_LANGUAGE = "en";

interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

// Recursively get all keys from a translation object
function getKeys(obj: TranslationKeys, prefix = ""): string[] {
  let keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Load translation file
function loadTranslations(lang: string, file: string): TranslationKeys | null {
  const filePath = path.join(LOCALES_DIR, lang, file);

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${lang}/${file}:`, error);
    return null;
  }
}

// Check if a key exists in translation object
function keyExists(obj: TranslationKeys, keyPath: string): boolean {
  const keys = keyPath.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }

  return true;
}

// Main verification function
function verifyTranslations() {
  console.log("\n🔍 i18n Translation Verification Agent\n");
  console.log("=" + "=".repeat(60));

  let hasErrors = false;
  const reportByFile: {
    [key: string]: { missing: { [key: string]: string[] } };
  } = {};

  // Get all translation files
  const files = fs.readdirSync(path.join(LOCALES_DIR, DEFAULT_LANGUAGE));

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    console.log(`\n📄 Checking ${file}...`);

    // Load default (EN) translation
    const defaultTranslations = loadTranslations(DEFAULT_LANGUAGE, file);
    if (!defaultTranslations) {
      hasErrors = true;
      continue;
    }

    const keys = getKeys(defaultTranslations);
    console.log(`   Found ${keys.length} keys in ${DEFAULT_LANGUAGE}/${file}`);

    reportByFile[file] = { missing: {} };

    // Check each language
    for (const lang of LANGUAGES) {
      if (lang === DEFAULT_LANGUAGE) continue;

      const translations = loadTranslations(lang, file);
      if (!translations) {
        hasErrors = true;
        continue;
      }

      const missingKeys: string[] = [];

      for (const key of keys) {
        if (!keyExists(translations, key)) {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        hasErrors = true;
        reportByFile[file].missing[lang] = missingKeys;
        console.log(
          `   ❌ ${lang.toUpperCase()}: Missing ${missingKeys.length} key(s)`
        );
        missingKeys.forEach((key) => {
          console.log(`      - ${key}`);
        });
      } else {
        console.log(`   ✅ ${lang.toUpperCase()}: All keys present`);
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(61));
  if (hasErrors) {
    console.log("❌ Translation verification FAILED\n");
    console.log("📋 Summary:\n");
    console.log(JSON.stringify(reportByFile, null, 2));
    process.exit(1);
  } else {
    console.log("✅ All translations are complete!\n");
    process.exit(0);
  }
}

// Run verification
verifyTranslations();
