import { useState } from "react";
import { useReaderStore } from "../../stores/readerStore";
import { useThemeStore } from "../../stores/themeStore";

interface ReaderHeaderProps {
  onClose?: () => void;
  perspective?: 'NARRATOR' | 'PROTAGONIST';
}

const THEME_NARRATOR = {
  headerBorder:  "border-gold",
  headerBg:      "bg-white/60 dark:bg-background-dark/60",
  headerShadow:  "shadow-sm",
  accent:        "text-gold",
  btnHover:      "hover:bg-gold/20",
  iconHover:     "hover:bg-gold/10",
  btnBorder:     "border-gold/40",
  menuBorder:    "border-gold/20",
  activeBg:      "bg-primary",
  title:         "Cher journal",
  logo: (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
};

const THEME_PROTAGONIST = {
  headerBorder:  "border-rose-400/50",
  headerBg:      "bg-white/70 dark:bg-background-dark/70",
  headerShadow:  "shadow-lg shadow-rose-500/10",
  accent:        "text-rose-500",
  btnHover:      "hover:bg-rose-500/20",
  iconHover:     "hover:bg-rose-500/10",
  btnBorder:     "border-rose-400/40",
  menuBorder:    "border-rose-400/30",
  activeBg:      "bg-rose-500",
  title:         "Point de vue intime",
  logo: (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 42c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0-18C12.95 10 4 18.95 4 30c0 7.732 5.001 14.331 12 17.011V38c0-1.657 1.343-3 3-3s3 1.343 3 3v9.011C32.999 44.331 38 37.732 38 30c0-11.05-8.95-20-20-20z"
        fill="currentColor"
      />
    </svg>
  ),
};

export default function ReaderHeader({ onClose, perspective }: ReaderHeaderProps) {
  const { settings, updateSettings } = useReaderStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = perspective === 'PROTAGONIST' ? THEME_PROTAGONIST : THEME_NARRATOR;

  const increaseFontSize = () => {
    if (settings.fontSize < 24) updateSettings({ fontSize: settings.fontSize + 2 });
  };
  const decreaseFontSize = () => {
    if (settings.fontSize > 14) updateSettings({ fontSize: settings.fontSize - 2 });
  };
  const increaseLineHeight = () => {
    if (settings.lineHeight < 2.5) updateSettings({ lineHeight: settings.lineHeight + 0.1 });
  };
  const decreaseLineHeight = () => {
    if (settings.lineHeight > 1.5) updateSettings({ lineHeight: settings.lineHeight - 0.1 });
  };
  const changeFontFamily = (fontFamily: "serif" | "sans-serif" | "mono") => {
    updateSettings({ fontFamily });
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center py-6 px-10 pointer-events-none">
      <header className={`flex w-full max-w-[960px] items-center justify-between whitespace-nowrap border ${t.headerBorder} ${t.headerBg} backdrop-blur-sm px-6 py-2 rounded-full pointer-events-auto ${t.headerShadow}`}>

        {/* Logo + Title */}
        <div className={`flex items-center gap-4 ${t.accent}`}>
          <div className="size-6">
            {t.logo}
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest hidden md:block font-ornate">
            {t.title}
          </h2>
        </div>

        {/* Actions */}
        <div className="relative flex gap-4 items-center">
          {onClose && (
            <>
              <button
                onClick={onClose}
                className={`flex items-center justify-center rounded-lg h-8 px-4 ${t.btnHover} ${t.accent} border ${t.btnBorder} transition-all text-[10px] font-bold uppercase tracking-widest font-ornate`}>
                Retour au chapitre
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex items-center justify-center rounded-lg h-8 w-8 ${t.iconHover} ${t.accent} transition-colors`}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center justify-center rounded-lg h-8 w-8 ${t.iconHover} ${t.accent} transition-colors`}>
            <span className="material-symbols-outlined">tune</span>
          </button>

          {/* Settings Menu Popup */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className={`fixed right-4 top-16 z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-xl border ${t.menuBorder} p-6 w-80 max-w-[calc(100vw-2rem)]`}>
                <h3 className="text-lg font-serif mb-4 text-gray-900 dark:text-white">
                  Paramètres de lecture
                </h3>

                {/* Font Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Taille du texte
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decreaseFontSize}
                      disabled={settings.fontSize <= 14}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                      {settings.fontSize}px
                    </span>
                    <button
                      onClick={increaseFontSize}
                      disabled={settings.fontSize >= 24}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Line Height */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Espacement des lignes
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decreaseLineHeight}
                      disabled={settings.lineHeight <= 1.5}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
                      {settings.lineHeight.toFixed(1)}
                    </span>
                    <button
                      onClick={increaseLineHeight}
                      disabled={settings.lineHeight >= 2.5}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Font Family */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Police de caractères
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["serif", "sans-serif", "mono"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => changeFontFamily(f)}
                        className={`p-2 rounded-lg text-sm ${
                          settings.fontFamily === f
                            ? `${t.activeBg} text-white`
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}>
                        {f === "serif" ? "Serif" : f === "sans-serif" ? "Sans" : "Mono"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Thème
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => isDark && toggleTheme()}
                      className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                        !isDark
                          ? `${t.activeBg} text-white`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      <span className="material-symbols-outlined text-sm">light_mode</span>
                      Clair
                    </button>
                    <button
                      onClick={() => !isDark && toggleTheme()}
                      className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                        isDark
                          ? `${t.activeBg} text-white`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      <span className="material-symbols-outlined text-sm">dark_mode</span>
                      Sombre
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
