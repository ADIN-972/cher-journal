import React from 'react';
import { StoryStep } from './types';

interface StepIndicatorProps {
  currentStep: StoryStep;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Protagoniste' },
    { number: 2, label: 'Personnalité' },
    { number: 3, label: 'Niveaux Émotionnels' },
    { number: 4, label: 'Structure' },
    { number: 5, label: 'Finalisation' },
  ];

  return (
    <div className="flex justify-between items-center w-full mb-8">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
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
        </div>
      ))}
    </div>
  );
}
