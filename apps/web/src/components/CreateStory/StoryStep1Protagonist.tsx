import React from "react";
import { StoryFormData } from "./types";
import PhotoUploadGallery from "./PhotoUploadGallery";

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
      <div className="border-l-4 border-gold pl-6">
        <h2 className="font-serif text-3xl text-charcoal dark:text-white italic">
          La Protagoniste
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Décrivez-nous votre protagoniste. Son nom, son apparence, vos
          photos...
        </p>
      </div>

      {/* Protagonist Name */}
      <div className="flex flex-col">
        <div className="space-y-4 ">
          <label className="block text-sm font-semibold  text-charcoal dark:text-white italic uppercase tracking-wider">
            Nom de la protagoniste *
          </label>
          <input
            type="text"
            value={formData.protagonistName}
            onChange={(e) =>
              setFormData({ ...formData, protagonistName: e.target.value })
            }
            placeholder="Ex: Emma, Veronica, Marie..."
            className="text-charcoal dark:text-white w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div className="flex flex-col my-6">
          {/* Photo Upload */}
          <PhotoUploadGallery
            photos={formData.photoAssetIds}
            onPhotosChange={(photos) =>
              setFormData({ ...formData, photoAssetIds: photos })
            }
            maxPhotos={10}
            maxSizeMb={5}
          />
        </div>
      </div>
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
        <p className="text-sm text-rose-800 dark:text-rose-200">
          💡 <strong>Conseil:</strong> Choisissez des photos qui capturent
          l'essence de votre protagoniste - son style, son charisme, son
          mystère.
        </p>
      </div>
    </div>
  );
}
