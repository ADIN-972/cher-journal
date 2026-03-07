import React from "react";
import { useTranslation } from "../../lib/i18n";
import { StoryFormData } from "./types";

interface StoryStep5FinalizeProps {
  formData: StoryFormData;
  setFormData: (data: StoryFormData) => void;
}

export default function StoryStep5Finalize({
  formData,
  setFormData,
}: StoryStep5FinalizeProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-gold pl-6">
        <h2 className="font-serif text-3xl text-charcoal dark:text-white italic">
          {t("createStory.step_5_finalize.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("createStory.step_5_finalize.description")}
        </p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("createStory.step_5_finalize.email_label")}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={t("createStory.step_5_finalize.email_placeholder")}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500  dark:text-white"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("createStory.step_5_finalize.email_help")}
        </p>
      </div>

      {/* Legal Text */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t("createStory.step_5_finalize.legal_title")}
        </h3>
        <p
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: t("createStory.step_5_finalize.legal_text"),
          }}
        />
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
            aria-label={t("createStory.step_5_finalize.rgpd_label")}
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-1 flex-shrink-0"
            required
          />
          <span
            className="text-sm text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: t("createStory.step_5_finalize.rgpd_label"),
            }}
          />
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
            aria-label={t("createStory.step_5_finalize.ccpa_label")}
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-1 flex-shrink-0"
            required
          />
          <span
            className="text-sm text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: t("createStory.step_5_finalize.ccpa_label"),
            }}
          />
        </label>
      </div>

      {/* Summary */}
      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t("createStory.step_5_finalize.summary_title")}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {t("createStory.step_5_finalize.summary_protagonist")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.protagonistName ||
                t("createStory.step_5_finalize.summary_undefined")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {t("createStory.step_5_finalize.summary_genres")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.selectedGenres.length > 0
                ? formData.selectedGenres.join(", ")
                : t("createStory.step_5_finalize.summary_none")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {t("createStory.step_5_finalize.summary_explicit_level")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.explicitLevel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {t("createStory.step_5_finalize.summary_photos")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.photoAssetIds.length}/10
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              {t("createStory.step_5_finalize.summary_ending")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.storyEnding}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p
          className="text-sm text-green-800 dark:text-green-200"
          dangerouslySetInnerHTML={{
            __html: t("createStory.step_5_finalize.ready_message"),
          }}
        />
      </div>
    </div>
  );
}
