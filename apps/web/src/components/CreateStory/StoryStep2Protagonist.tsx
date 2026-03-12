import React from "react";
import { useTranslation } from "../../lib/i18n";
import { StoryFormData } from "./types";
import { GENRES } from "../../pages/Catalogue";

interface StoryStep2PropsProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

const EXPLICIT_LEVELS = [
  {
    value: "ROMANTIQUE",
    translationKey: "createStory.explicit_levels.ROMANTIQUE",
  },
  {
    value: "SUGGESTIF",
    translationKey: "createStory.explicit_levels.SUGGESTIF",
  },
  {
    value: "SENSUEL",
    translationKey: "createStory.explicit_levels.SENSUEL",
  },
  {
    value: "EXPLICITE",
    translationKey: "createStory.explicit_levels.EXPLICITE",
  },
  {
    value: "TRES_EXPLICITE",
    translationKey: "createStory.explicit_levels.TRES_EXPLICITE",
  },
];

function StoryStep2Protagonist({
  formData,
  setFormData,
}: StoryStep2PropsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-gold pl-6">
        <h2 className="font-serif text-3xl text-charcoal dark:text-white italic">
          {t("createStory.step_2_protagonist.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("createStory.step_2_protagonist.description")}
        </p>
      </div>

      <div
        className="bg-brand-prune text-white p-6 rounded-[12px] shadow-xl relative overflow-hidden"
        data-purpose="tip-box">
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <svg
            fill="currentColor"
            height="60"
            viewBox="0 0 24 24"
            width="60">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
          </svg>
        </div>
        <p className="text-xs uppercase font-bold text-brand-gold mb-2">
          {t("createStory.step_2_protagonist.tip_label")}
        </p>
        <p className="text-sm font-light leading-relaxed italic">
          "{t("createStory.step_2_protagonist.tip_text")}"
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("createStory.step_2_protagonist.description_label")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={t("createStory.step_2_protagonist.description_placeholder")}
          rows={5}
          className="text-charcoal dark:text-white w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t("createStory.step_2_protagonist.genres_label")}
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(GENRES)
            .filter((genre) => genre !== "all")
            .map((genre) => (
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
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                }`}>
                {t(`${GENRES[genre as keyof typeof GENRES].translationKey}.title`)}  
              </button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t("createStory.step_2_protagonist.explicit_level_label")}
        </label>
        <div className="space-y-2">
          {EXPLICIT_LEVELS.map((level) => {
            const label = t(`${level.translationKey}.label`);
            const description = t(`${level.translationKey}.description`);
            return (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    explicitLevel: level.value as any,
                  })
                }
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.explicitLevel === level.value
                    ? "border-red-600 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}>
                <p className="font-medium text-gray-900 dark:text-white">
                  {label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StoryStep2Protagonist;
