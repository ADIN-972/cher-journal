import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StoryFormData, StoryStep, VolumeProposal } from '../components/CreateStory/types';
import StepIndicator from '../components/CreateStory/StepIndicator';
import StoryStep1Protagonist from '../components/CreateStory/StoryStep1Protagonist';
import StoryStep3Emotions from '../components/CreateStory/StoryStep3Emotions';
import StoryStep4Structure from '../components/CreateStory/StoryStep4Structure';
import StoryStep5Finalize from '../components/CreateStory/StoryStep5Finalize';

const INITIAL_FORM_DATA: StoryFormData = {
  protagonistName: '',
  photoAssetIds: [],
  description: '',
  selectedGenres: [],
  explicitLevel: 'SENSUEL',
  niveauIntensitee: 3,
  niveauDouceur: 3,
  niveauDanger: 3,
  niveauTransformation: 3,
  storyEnding: 'HAPPY',
  storyEndingCustom: '',
  volumeProposals: Array.from({ length: 10 }, (_, i) => ({
    volumeNumber: i + 1,
    proposedLocation: '',
    proposedOrientation: '',
    proposedTwist: '',
  })),
  email: '',
  rgpdConsent: false,
  ccpaConsent: false,
};

const GENRES = [
  'Passionate Desires',
  'Sweet Romance',
  'Sensual Mystery',
  'Forbidden',
  'Seduction & Conquest',
  'Secret Dreams',
  'Raw Passion',
  'Complicated Love',
  'Nocturnal Desire',
  'Liberation',
  'Self-Discovery',
  'Psychological Intimacy',
  'Awakening of Desire',
  'Transformative Relations',
  'Body Memory',
];

const EXPLICIT_LEVELS = [
  { value: 'ROMANTIQUE', label: 'Romantique', description: 'Scènes suggérées, focus émotionnel' },
  { value: 'SUGGESTIF', label: 'Suggestif', description: 'Moments évocateurs, descriptions évasives' },
  { value: 'SENSUEL', label: 'Sensuel', description: 'Descriptions détaillées, langage poétique' },
  { value: 'EXPLICITE', label: 'Explicite', description: 'Descriptions directes et détaillées' },
  { value: 'TRES_EXPLICITE', label: 'Très explicite', description: 'Descriptions très crues et directes' },
];

export default function CreateStoryPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StoryStep>(1);
  const [formData, setFormData] = useState<StoryFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as StoryStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StoryStep);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/custom-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      toast.success('Votre demande a été reçue! Merci de votre intérêt.');
      navigate('/account/custom-stories');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 dark:from-zinc-900 dark:to-rose-900/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-rose-900 dark:text-rose-100 mb-3">
            Créez votre histoire
          </h1>
          <p className="text-rose-700 dark:text-rose-300">
            5 étapes pour nous décrire votre vision
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 space-y-6">
          {/* Step 1: Protagonist */}
          {currentStep === 1 && (
            <StoryStep1Protagonist formData={formData} setFormData={setFormData} />
          )}

          {/* Step 2: Personality */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light text-rose-900 dark:text-rose-100 mb-4">
                  Étape 2: Personnalité & Histoire
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Décrivez la personnalité, les désirs et l'histoire de votre protagoniste
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description personnalité / histoire *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez sa personnalité, ses désirs secrets, son histoire..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Genres associés (max 5) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        const updated = formData.selectedGenres.includes(genre)
                          ? formData.selectedGenres.filter((g) => g !== genre)
                          : [...formData.selectedGenres, genre].slice(0, 5);
                        setFormData({ ...formData, selectedGenres: updated });
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        formData.selectedGenres.includes(genre)
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                      }`}>
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Niveau d'explicité *
                </label>
                <div className="space-y-2">
                  {EXPLICIT_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, explicitLevel: level.value as any })}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.explicitLevel === level.value
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}>
                      <p className="font-medium text-gray-900 dark:text-white">{level.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Emotions */}
          {currentStep === 3 && (
            <StoryStep3Emotions formData={formData} setFormData={setFormData} />
          )}

          {/* Step 4: Structure */}
          {currentStep === 4 && (
            <StoryStep4Structure formData={formData} setFormData={setFormData} />
          )}

          {/* Step 5: Finalize */}
          {currentStep === 5 && (
            <StoryStep5Finalize formData={formData} setFormData={setFormData} />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              ← Précédent
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all">
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-all">
                {isSubmitting ? 'Envoi...' : 'Soumettre ma demande'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
