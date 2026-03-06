import React from 'react';
import { StoryFormData } from './types';
import PhotoUploadGallery from './PhotoUploadGallery';

interface StoryStep1PropsProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

export default function StoryStep1Protagonist({
  formData,
  setFormData,
}: StoryStep1PropsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-rose-900 dark:text-rose-100 mb-4">
          Étape 1: La Protagoniste
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Décrivez-nous votre protagoniste. Son nom, son apparence, vos photos...
        </p>
      </div>

      {/* Protagonist Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nom de la protagoniste *
        </label>
        <input
          type="text"
          value={formData.protagonistName}
          onChange={(e) =>
            setFormData({ ...formData, protagonistName: e.target.value })
          }
          placeholder="Ex: Emma, Veronica, Marie..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Le nom de votre protagoniste principal
        </p>
      </div>

      {/* Photo Upload */}
      <PhotoUploadGallery
        photos={formData.photoAssetIds}
        onPhotosChange={(photos) =>
          setFormData({ ...formData, photoAssetIds: photos })
        }
        maxPhotos={10}
        maxSizeMb={5}
      />

      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
        <p className="text-sm text-rose-800 dark:text-rose-200">
          💡 <strong>Conseil:</strong> Choisissez des photos qui capturent l'essence de
          votre protagoniste - son style, son charisme, son mystère.
        </p>
      </div>
    </div>
  );
}
