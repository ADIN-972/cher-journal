import React from "react";
import { useTranslation } from "../../lib/i18n";
import { StoryFormData } from "./types";

const EMOTIONAL_LEVELS = [
  {
    key: "niveauIntensitee",
    translationKey: "createStory.emotional_levels.intensity",
    color: "text-red-500",
    accent: "accent-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-300 dark:border-red-700",
  },
  {
    key: "niveauDouceur",
    translationKey: "createStory.emotional_levels.softness",
    color: "text-pink-500",
    accent: "accent-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-300 dark:border-pink-700",
  },
  {
    key: "niveauDanger",
    translationKey: "createStory.emotional_levels.danger",
    color: "text-orange-500",
    accent: "accent-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-300 dark:border-orange-700",
  },
  {
    key: "niveauTransformation",
    translationKey: "createStory.emotional_levels.transformation",
    color: "text-purple-500",
    accent: "accent-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-300 dark:border-purple-700",
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
  const { t } = useTranslation();

  const updateEmotionalLevel = (key: string, value: number) => {
    setFormData({
      ...formData,
      [key]: Math.max(1, Math.min(5, value)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-gold pl-6">
        <h2 className="font-serif text-3xl text-charcoal dark:text-white italic">
          {t("createStory.emotional_levels.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("createStory.emotional_levels.description")}
        </p>
      </div>

      {/* Emotional Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EMOTIONAL_LEVELS.map((level) => {
          const value = formData[level.key as keyof StoryFormData] as number;
          const label = t(`${level.translationKey}.label`);
          const description = t(`${level.translationKey}.description`);

          return (
            <div
              key={level.key}
              className={`space-y-3 ${level.border} ${level.bg} p-4 rounded-lg`}>
              <div>
                <label className={`block text-sm font-medium ${level.color} mb-1`}>
                  {label}
                </label>
                <p className="text-xs text-gray-500 italic">
                  ({description})
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
                  className={`flex-1 h-2 ${level.bg} rounded-lg appearance-none cursor-pointer ${level.accent}`}
                />
                <span className={`w-8 text-center font-bold text-lg ${level.color}`}>
                  {value}
                  <span className="text-gray-500 text-xs dark:text-gray-400">/5</span>
                  {/* ">/5</span> */}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{t("createStory.emotional_levels.scale_low")}</span>
                <span>{t("createStory.emotional_levels.scale_high")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Representation */}
      <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t("createStory.emotional_levels.summary_title")}
        </h3>
        <div className="space-y-2 text-sm">
          {EMOTIONAL_LEVELS.map((level) => {
            const value = formData[level.key as keyof StoryFormData] as number;
            const label = t(`${level.translationKey}.label`);
            return (
              <div
                key={level.key}
                className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-2 h-2 rounded-full ${
                        dot <= value
                          ? "bg-red-600"
                          : "bg-gray-300 dark:bg-gray-600"
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
          {t("createStory.emotional_levels.tip")}
        </p>
      </div>
    </div>
  );
}
