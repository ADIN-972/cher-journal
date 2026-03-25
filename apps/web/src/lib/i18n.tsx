import React, { useCallback, useEffect, useState } from 'react';
import { storage, STORAGE_KEYS } from './storage';

export type Language = 'en' | 'fr';

interface TranslationFunction {
  (key: string, defaultValue?: string): string;
  (key: string, params?: Record<string, any>): string;
}

interface I18nContextType {
  t: TranslationFunction;
  language: Language;
  changeLanguage: (lang: Language) => void;
  translations: Record<string, any>;
  isLoading: boolean;
}

// Create context
const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

// Load translations from shared package (served from /locales)
async function loadTranslations(lang: Language): Promise<Record<string, any>> {
  try {
    const response = await fetch(`/locales/${lang}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${lang}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);
    return {};
  }
}

// Helper to get value from nested object
function getNestedValue(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (typeof value === 'object' && value !== null) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

// Translation function implementation
function createTranslationFunction(translations: Record<string, any>): TranslationFunction {
  const t = (key: string, params?: any): string => {
    // Get the translation value
    let value = getNestedValue(translations, key);

    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`);
      return key; // Fallback to key name if not found
    }

    // Handle interpolation: {variable} → params.variable
    if (params && typeof params === 'object') {
      value = value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        const paramValue = params[paramKey];
        return paramValue !== undefined ? String(paramValue) : `{${paramKey}}`;
      });
    }

    return value;
  };

  return t as TranslationFunction;
}

// Provider component
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    return storage.getString(STORAGE_KEYS.LANGUAGE, defaultLanguage) as Language || defaultLanguage;
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    setIsLoading(true);
    loadTranslations(language).then((trans) => {
      setTranslations(trans);
      setIsLoading(false);
    });
  }, [language]);

  // Create translation function
  const t = useCallback<TranslationFunction>(
    (key: string, params?: any) => {
      return createTranslationFunction(translations)(key, params);
    },
    [translations]
  );

  // Change language handler
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    storage.set(STORAGE_KEYS.LANGUAGE, newLanguage);
  }, []);

  const value: I18nContextType = {
    t,
    language,
    changeLanguage,
    translations,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Hook to use translations
export function useTranslation(): { t: TranslationFunction; isLoading: boolean } {
  const context = React.useContext(I18nContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return {
    t: context.t,
    isLoading: context.isLoading,
  };
}

// Hook to use language switching
export function useLanguage(): { language: Language; changeLanguage: (lang: Language) => void } {
  const context = React.useContext(I18nContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within I18nProvider');
  }

  return {
    language: context.language,
    changeLanguage: context.changeLanguage,
  };
}

// Hook to get all translations (for testing/advanced use)
export function useTranslations(): Record<string, any> {
  const context = React.useContext(I18nContext);

  if (context === undefined) {
    throw new Error('useTranslations must be used within I18nProvider');
  }

  return context.translations;
}
