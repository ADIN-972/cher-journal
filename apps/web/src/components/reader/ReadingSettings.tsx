import { useState } from 'react';
import { useReaderStore } from '../../stores/readerStore';

type PaperColor = 'cream' | 'white' | 'sage' | 'plum' | 'burgundy' | 'navy' | 'slate';

const PAPER_COLORS: Record<PaperColor, { name: string; bg: string; text: string; label: string }> = {
  cream: { name: 'Crème', bg: 'bg-yellow-50', text: 'text-amber-900', label: '☀️' },
  white: { name: 'Blanc pur', bg: 'bg-white', text: 'text-gray-900', label: '⚪' },
  sage: { name: 'Sauge', bg: 'bg-emerald-50', text: 'text-emerald-900', label: '🌿' },
  slate: { name: 'Ardoise', bg: 'bg-slate-100', text: 'text-slate-900', label: '🩶' },
  plum: { name: 'Prune', bg: 'bg-purple-100', text: 'text-purple-900', label: '💜' },
  burgundy: { name: 'Bordeaux', bg: 'bg-red-100', text: 'text-red-900', label: '🍷' },
  navy: { name: 'Bleu nuit', bg: 'bg-blue-900', text: 'text-blue-50', label: '🌙' },
};

export default function ReadingSettings() {
  const { settings, updateSettings } = useReaderStore();
  const [isOpen, setIsOpen] = useState(false);
  const [paperColor, setPaperColor] = useState<PaperColor>('cream');

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Settings Panel - Boudoir Moderne Aesthetic */}
      {isOpen && (
        <div className="mb-6 bg-gradient-to-br from-purple-900 via-blue-950 to-slate-900 rounded-3xl shadow-2xl p-8 w-96 border border-pink-400/20 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-pink-400/20">
            <div>
              <h3 className="text-2xl font-serif font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                Mode Zen
              </h3>
              <p className="text-xs text-pink-200/60 mt-1">Immersion totale</p>
            </div>
            <span className="text-4xl animate-pulse">✨</span>
          </div>

          {/* Font Size */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-serif font-semibold text-pink-200">
                Taille du texte
              </label>
              <span className="text-xs bg-purple-500/30 text-pink-300 px-2 py-1 rounded-full">
                {settings.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="24"
              step="1"
              value={settings.fontSize}
              onChange={(e) =>
                updateSettings({ fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full appearance-none cursor-pointer accent-pink-400"
            />
            <div className="flex justify-between text-xs text-pink-300/50 mt-2">
              <span>Petit</span>
              <span>Grand</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-serif font-semibold text-pink-200">
                Espacement
              </label>
              <span className="text-xs bg-purple-500/30 text-pink-300 px-2 py-1 rounded-full">
                {settings.lineHeight.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1.5"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) =>
                updateSettings({ lineHeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full appearance-none cursor-pointer accent-pink-400"
            />
            <div className="flex justify-between text-xs text-pink-300/50 mt-2">
              <span>Compact</span>
              <span>Aéré</span>
            </div>
          </div>

          {/* Paper Color Selection */}
          <div className="mb-7 pb-7 border-b border-pink-400/20">
            <label className="text-sm font-serif font-semibold text-pink-200 block mb-4">
              Couleur du papier
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(PAPER_COLORS) as [PaperColor, (typeof PAPER_COLORS)[PaperColor]][]).map(
                ([color, config]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPaperColor(color)}
                    title={config.name}
                    className={`relative w-full aspect-square rounded-lg transition-all duration-300 ${
                      config.bg
                    } ${
                      paperColor === color
                        ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-purple-900 scale-105 shadow-lg shadow-pink-400/50'
                        : 'hover:ring-1 hover:ring-pink-400/50 shadow-md'
                    }`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-lg">
                      {config.label}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-7">
            <label className="text-sm font-serif font-semibold text-pink-200 block mb-3">
              Police de caractère
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'serif' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  settings.fontFamily === 'serif'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
                }`}
                style={{ fontFamily: 'serif' }}
              >
                Serif
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'sans-serif' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  settings.fontFamily === 'sans-serif'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
                }`}
                style={{ fontFamily: 'sans-serif' }}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ fontFamily: 'mono' })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  settings.fontFamily === 'mono'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
                }`}
                style={{ fontFamily: 'monospace' }}
              >
                Mono
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'light' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                settings.theme === 'light'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-900 shadow-lg shadow-amber-500/30 font-bold'
                  : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
              }`}
            >
              ☀️ Clair
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                settings.theme === 'dark'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-pink-200 shadow-lg shadow-slate-900/50 font-bold'
                  : 'bg-purple-500/20 text-pink-200 hover:bg-purple-500/30 border border-purple-400/20'
              }`}
            >
              🌙 Sombre
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button - Floating Action */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/50'
            : 'bg-gradient-to-br from-purple-600 to-blue-800 hover:from-purple-500 hover:to-blue-700 shadow-purple-600/50'
        }`}
        title="Paramètres de lecture zen"
      >
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? '✕' : '✨'}
        </span>
      </button>
    </div>
  );
}
