import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "fr";

interface Translations {
  [key: string]: string | Translations;
}

type ReplacementMap = Record<string, string | number>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (
    key: string,
    defaultValue?: string,
    replacements?: ReplacementMap
  ) => string;
  translations: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved || "fr";
  });

  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/locales/${language}/common.json`);
        if (!response.ok)
          throw new Error(`Failed to load translations for ${language}`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Error loading translations:", error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Helper function to get nested translation
  const t = (
    key: string,
    defaultValue?: string,
    replacements?: ReplacementMap
  ): string => {
    const keys = key.split(".");
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return defaultValue || key;
      }
    }

    let value = typeof current === "string" ? current : defaultValue || key;

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        value = value.replace(
          new RegExp(`{{\\s*${placeholder}\\s*}}`, "g"),
          String(replacement)
        );
      });
    }

    return value;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function useGenreLabels() {
  const { t } = useI18n();

  const GENRES = [
    "PASSIONS_CHARNELLES",
    "ROMANCES_TENDRES",
    "MYSTERIES_SENSUELS",
    "INTERDITS",
    "CONQUETES",
    "REVES_SECRETS",
    "PASSION_BRUTALE",
    "AMOUR_COMPLIQUE",
    "DESIR_NOCTURNE",
    "LIBERATION",
    "DECOUVERTE_DE_SOI",
    "INTIMITE_PSYCHOLOGIQUE",
    "EVEIL_DU_DESIR",
    "RELATIONS_TRANSFORMATRICES",
    "MEMOIRE_DU_CORPS"
  ];

  // Return object with genre keys mapped to translated labels
  const labels: Record<string, string> = {};
  GENRES.forEach((genre) => {
    labels[genre] = t(`genres.${genre}`, genre);
  });

  return {
    labels,
    genres: GENRES
  };
}
