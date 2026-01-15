import { useI18n } from "../lib/i18n";
import { MdLanguage } from "react-icons/md";
import { useState } from "react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "en" as const, name: "English" },
    { code: "fr" as const, name: "Français" },
  ];

  const handleLanguageChange = (lang: typeof language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Change language">
        <MdLanguage className="w-5 h-5" />
        <span className="font-medium uppercase">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === lang.code
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
