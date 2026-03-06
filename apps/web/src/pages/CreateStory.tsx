import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  StoryFormData,
  StoryStep,
  VolumeProposal,
} from "../components/CreateStory/types";
import StepIndicator from "../components/CreateStory/StepIndicator";
import StoryStep1Protagonist from "../components/CreateStory/StoryStep1Protagonist";
import StoryStep3Emotions from "../components/CreateStory/StoryStep3Emotions";
import StoryStep4Structure from "../components/CreateStory/StoryStep4Structure";
import StoryStep5Finalize from "../components/CreateStory/StoryStep5Finalize";
import StoryStep2Protagonist from "../components/CreateStory/StoryStep2Protagonist";
import { api } from "../lib/api";

const INITIAL_FORM_DATA: StoryFormData = {
  protagonistName: "",
  photoAssetIds: [],
  description: "",
  selectedGenres: [],
  explicitLevel: "SENSUEL",
  niveauIntensitee: 3,
  niveauDouceur: 3,
  niveauDanger: 3,
  niveauTransformation: 3,
  storyEnding: "HAPPY",
  storyEndingCustom: "",
  volumeProposals: Array.from({ length: 10 }, (_, i) => ({
    volumeNumber: i + 1,
    proposedLocation: "",
    proposedOrientation: "",
    proposedTwist: "",
  })),
  email: "",
  rgpdConsent: false,
  ccpaConsent: false,
};


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
      await api.post("/custom-stories", formData);
      toast.success("Votre demande a été reçue! Merci de votre intérêt.");
      navigate("/account/custom-stories");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 dark:from-zinc-900 dark:to-rose-900/20 py-12 px-4">
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
          <StepIndicator
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
            totalSteps={5}
          />
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 space-y-6">
          {/* Step 1: Protagonist */}
          {currentStep === 1 && (
            <StoryStep1Protagonist
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Step 2: Personality */}
          {currentStep === 2 && (
            <StoryStep2Protagonist
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Step 3: Emotions */}
          {currentStep === 3 && (
            <StoryStep3Emotions
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Step 4: Structure */}
          {currentStep === 4 && (
            <StoryStep4Structure
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Step 5: Finalize */}
          {currentStep === 5 && (
            <StoryStep5Finalize
              formData={formData}
              setFormData={setFormData}
            />
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
                {isSubmitting ? "Envoi..." : "Soumettre ma demande"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
