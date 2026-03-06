import React, { useState } from 'react';
import { StoryFormData, VolumeProposal } from './types';

const ENDING_OPTIONS = [
  {
    value: 'HAPPY',
    label: 'Happy Ending',
    description: 'Finale heureuse, satisfaisante pour tous',
  },
  {
    value: 'BITTERSWEET',
    label: 'Doux-Amer',
    description: 'Joies et peines mélangées, réaliste',
  },
  {
    value: 'TRAGIC',
    label: 'Tragique',
    description: 'Fin sombre, sacrifice ou perte majeure',
  },
  {
    value: 'OPEN',
    label: 'Fin Ouverte',
    description: 'Laisse le lecteur imaginer la suite',
  },
];

interface StoryStep4StructureProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

export default function StoryStep4Structure({
  formData,
  setFormData,
}: StoryStep4StructureProps) {
  const [expandedVolume, setExpandedVolume] = useState<number | null>(1);

  const updateVolume = (volumeNumber: number, field: string, value: string) => {
    const updated = formData.volumeProposals.map((vol) =>
      vol.volumeNumber === volumeNumber ? { ...vol, [field]: value } : vol
    );
    setFormData({ ...formData, volumeProposals: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-rose-900 dark:text-rose-100 mb-4">
          Étape 4: Structure de l'Histoire
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Proposez des idées pour les 10 volumes et la fin
        </p>
      </div>

      {/* Ending Choice */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Comment l'histoire finit-elle? *
        </label>
        <div className="space-y-2">
          {ENDING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, storyEnding: option.value as any })
              }
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                formData.storyEnding === option.value
                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
              <p className="font-medium text-gray-900 dark:text-white">
                {option.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Ending Custom Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Détails de la fin (optionnel)
        </label>
        <textarea
          value={formData.storyEndingCustom || ''}
          onChange={(e) =>
            setFormData({ ...formData, storyEndingCustom: e.target.value })
          }
          placeholder="Décrivez plus précisément comment vous imaginez la conclusion..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* 10 Volumes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Les 10 Volumes
        </h3>
        <div className="space-y-3">
          {formData.volumeProposals.map((volume) => (
            <div
              key={volume.volumeNumber}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedVolume(
                    expandedVolume === volume.volumeNumber
                      ? null
                      : volume.volumeNumber
                  )
                }
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-all">
                <span className="font-medium text-gray-900 dark:text-white">
                  Volume {volume.volumeNumber}
                </span>
                <span className="text-gray-500">
                  {expandedVolume === volume.volumeNumber ? '▼' : '▶'}
                </span>
              </button>

              {/* Content */}
              {expandedVolume === volume.volumeNumber && (
                <div className="px-4 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lieu / Région proposée
                    </label>
                    <input
                      type="text"
                      value={volume.proposedLocation}
                      onChange={(e) =>
                        updateVolume(
                          volume.volumeNumber,
                          'proposedLocation',
                          e.target.value
                        )
                      }
                      placeholder="Ex: Paris, Venise, une maison de campagne..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orientation / Événement clé
                    </label>
                    <input
                      type="text"
                      value={volume.proposedOrientation}
                      onChange={(e) =>
                        updateVolume(
                          volume.volumeNumber,
                          'proposedOrientation',
                          e.target.value
                        )
                      }
                      placeholder="Ex: Première rencontre, trahison révélée..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twist ou surprise envisagée
                    </label>
                    <input
                      type="text"
                      value={volume.proposedTwist}
                      onChange={(e) =>
                        updateVolume(
                          volume.volumeNumber,
                          'proposedTwist',
                          e.target.value
                        )
                      }
                      placeholder="Ex: Révélation d'un secret, virage inattendu..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
        <p className="text-sm text-rose-800 dark:text-rose-200">
          💡 <strong>Conseil:</strong> Vous pouvez remplir tous les champs ou seulement
          les points clés. Laissez place à la créativité!
        </p>
      </div>
    </div>
  );
}
