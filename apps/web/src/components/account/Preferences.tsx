import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';

export default function Preferences() {
  const { isDark, toggleTheme } = useThemeStore();
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [autoPlay, setAutoPlay] = useState(true);
  const [adultContent, setAdultContent] = useState(true);

  const fontSizes = [
    { id: 'small' as const, label: 'Petit', sample: 'text-sm' },
    { id: 'medium' as const, label: 'Moyen', sample: 'text-base' },
    { id: 'large' as const, label: 'Grand', sample: 'text-lg' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Préférences
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Personnalisez votre expérience de lecture.
      </p>

      <div className="space-y-6">
        {/* Theme */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c5a059] text-2xl">
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-1">
                  Thème
                </h3>
                <p className="text-sm text-charcoal dark:text-white/70">
                  Choisissez entre le mode clair et sombre
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-[#c5a059]' : 'bg-boudoir-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-[#c5a059] text-2xl">
              format_size
            </span>
            <div>
              <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-1">
                Taille de police
              </h3>
              <p className="text-sm text-charcoal dark:text-white/70">
                Ajustez la taille du texte pour votre confort
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  fontSize === size.id
                    ? 'border-[#c5a059] bg-[#c5a059]/10'
                    : 'border-boudoir-300 dark:border-boudoir-800 hover:border-[#c5a059]/50'
                }`}
              >
                <p className={`font-medium text-charcoal dark:text-white ${size.sample}`}>
                  Aa
                </p>
                <p className="text-xs text-charcoal dark:text-white/70 mt-1">
                  {size.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-play */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c5a059] text-2xl">
                play_circle
              </span>
              <div>
                <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-1">
                  Lecture automatique
                </h3>
                <p className="text-sm text-charcoal dark:text-white/70">
                  Passer automatiquement au chapitre suivant
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoPlay ? 'bg-[#c5a059]' : 'bg-boudoir-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoPlay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Adult Content Filter */}
        <div className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#c5a059] text-2xl">
                shield
              </span>
              <div>
                <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-1">
                  Contenu pour adultes
                </h3>
                <p className="text-sm text-charcoal dark:text-white/70">
                  Afficher le contenu réservé aux adultes
                </p>
              </div>
            </div>
            <button
              onClick={() => setAdultContent(!adultContent)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                adultContent ? 'bg-[#c5a059]' : 'bg-boudoir-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  adultContent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button className="w-full bg-[#c5a059] hover:bg-[#b8935a] text-white py-3 rounded-xl font-bold uppercase text-sm tracking-wider transition-all">
          Sauvegarder les préférences
        </button>
      </div>
    </div>
  );
}
