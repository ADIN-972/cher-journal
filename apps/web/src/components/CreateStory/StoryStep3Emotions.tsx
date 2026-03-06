import React from 'react';
import { StoryFormData } from './types';

const EMOTIONAL_LEVELS = [
  {
    key: 'niveauIntensitee',
    label: 'Intensité',
    description: 'Force du désir, tension charnelle',
  },
  {
    key: 'niveauDouceur',
    label: 'Douceur',
    description: 'Tendresse, vulnérabilité, délicatesse',
  },
  {
    key: 'niveauDanger',
    label: 'Danger',
    description: 'Risque émotionnel, social, moral ou physique',
  },
  {
    key: 'niveauTransformation',
    label: 'Transformation',
    description: 'Évolution des personnages, changements majeurs',
  },
];

interface StoryStep3EmotionsProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

export default function StoryStep3Emotions({
  formData,
  setFormData,
}: StoryStep3EmotionsProps) {
  const updateEmotionalLevel = (key: string, value: number) => {
    setFormData({
      ...formData,
      [key]: Math.max(1, Math.min(5, value)),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-rose-900 dark:text-rose-100 mb-4">
          Étape 3: Niveaux Émotionnels
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Définissez l'ambiance émotionnelle générale de votre histoire
        </p>
      </div>

      {/* Emotional Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EMOTIONAL_LEVELS.map((level) => {
          const value = formData[level.key as keyof StoryFormData] as number;

          return (
            <div key={level.key} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {level.label}
                </label>
                <p className="text-xs text-gray-500 italic">
                  ({level.description})
                </p>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={value}
                  onChange={(e) =>
                    updateEmotionalLevel(level.key, parseInt(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <span className="w-8 text-center font-bold text-lg text-red-600 dark:text-red-400">
                  {value}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Faible</span>
                <span>Intense</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Representation */}
      <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Résumé émotionnel
        </h3>
        <div className="space-y-2 text-sm">
          {EMOTIONAL_LEVELS.map((level) => {
            const value = formData[level.key as keyof StoryFormData] as number;
            return (
              <div key={level.key} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">
                  {level.label}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-2 h-2 rounded-full ${
                        dot <= value
                          ? 'bg-red-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
        <p className="text-sm text-rose-800 dark:text-rose-200">
          💡 <strong>Conseil:</strong> Ces niveaux vont guider nos auteurs pour
          créer une histoire parfaitement calibrée à vos envies.
        </p>
      </div>
    </div>
  );
}
