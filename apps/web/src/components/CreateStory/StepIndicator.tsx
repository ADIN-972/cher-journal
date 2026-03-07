import React from 'react';
import toast from 'react-hot-toast';
import { StoryStep, StoryFormData } from './types';

interface StepIndicatorProps {
  currentStep: StoryStep;
  setCurrentStep: (step: StoryStep) => void;
  totalSteps: number;
  formData?: StoryFormData;
  validateStep?: (step: StoryStep) => boolean;
}

export default function StepIndicator({
  currentStep,
  setCurrentStep,
  validateStep
}: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Protagoniste' },
    { number: 2, label: 'Personnalité' },
    { number: 3, label: 'Niveaux Émotionnels' },
    { number: 4, label: 'Structure' },
    { number: 5, label: 'Finalisation' },
  ];

  const handleStepClick = (targetStep: StoryStep) => {
    // Allow going back to previous steps without validation
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Prevent going forward without validation
    if (targetStep > currentStep) {
      if (validateStep && !validateStep(currentStep)) {
        return; // Toast already shown by validateStep
      }
      setCurrentStep(targetStep);
      toast.success(`Étape ${currentStep} complétée ✓`);
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-8">
      {steps.map((step, idx) => (
        <button
          key={step.number}
          onClick={() => {
            handleStepClick(step.number as StoryStep);
          }}
          disabled={step.number > currentStep}
          className={`flex items-center flex-1 ${
            step.number > currentStep ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          <div
            className={`grid w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step.number <= currentStep
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}>
            {step.number}
          </div>
          <p
            className={`text-sm font-medium ml-2 ${
              step.number <= currentStep
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
            {step.label}
          </p>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                step.number < currentStep
                  ? 'bg-red-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </button>
      ))}
    </div>
  );
}
