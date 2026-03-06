import React from 'react';
import { StoryFormData } from './types';

interface StoryStep5FinalizeProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

export default function StoryStep5Finalize({
  formData,
  setFormData,
}: StoryStep5FinalizeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-rose-900 dark:text-rose-100 mb-4">
          Étape 5: Finalisation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Derniers détails et consentements
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adresse email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="votre.email@exemple.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Pour recevoir les mises à jour sur votre demande
        </p>
      </div>

      {/* Legal Text */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Propriété & Droits d'Auteur
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Les textes créés à partir de votre demande deviendront propriété de
          <strong> Cher Journal</strong>. L'auteur se réserve le droit de suivre
          ou non les suggestions que vous proposez. Cher Journal pourra adapter,
          modifier ou compléter votre histoire selon sa vision artistique.
        </p>
      </div>

      {/* RGPD Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rgpdConsent}
            onChange={(e) =>
              setFormData({ ...formData, rgpdConsent: e.target.checked })
            }
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-1 flex-shrink-0"
            required
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            J'accepte la <strong>politique de confidentialité RGPD</strong> et
            comprends que mes données seront conservées 3 mois pour modération
            et sécurité *
          </span>
        </label>
      </div>

      {/* CCPA Consent */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ccpaConsent}
            onChange={(e) =>
              setFormData({ ...formData, ccpaConsent: e.target.checked })
            }
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-1 flex-shrink-0"
            required
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            J'accepte la <strong>politique de confidentialité CCPA</strong> *
          </span>
        </label>
      </div>

      {/* Summary */}
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Résumé de votre demande
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Protagoniste
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.protagonistName || '(non défini)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Genres sélectionnés
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.selectedGenres.length > 0
                ? formData.selectedGenres.join(', ')
                : '(aucun)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Niveau d'explicité
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.explicitLevel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Photos uploadées
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.photoAssetIds.length}/10
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Fin imaginée
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.storyEnding}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✅ <strong>Prêt à continuer?</strong> Vérifiez que tous les champs requis
          sont remplis et cliquez sur "Soumettre ma demande".
        </p>
      </div>
    </div>
  );
}
