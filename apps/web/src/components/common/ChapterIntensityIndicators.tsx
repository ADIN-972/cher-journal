import { Chapter } from "../../stores/catalogStore";

interface ChapterIntensityIndicatorsProps {
  chapter: Chapter;
  variant?: "compact" | "full";
}

const INTENSITY_LEVELS = [
  {
    key: "niveau_intensite",
    description: "force du désir, tension charnelle",
    label: "Intensité",
    icon: "local_fire_department",
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-600",
  },
  {
    key: "niveau_douceur",
    description: "tendresse, vulnérabilité, délicatesse",
    label: "Douceur",
    icon: "favorite",
    color: "bg-pink-500",
    textColor: "text-pink-600 dark:text-pink-600",
  },
  {
    key: "niveau_danger",
    description: "risque émotionnel, social, moral ou physique",
    label: "Danger",
    icon: "warning",
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-600",
  },
  {
    key: "niveau_transformation",
    description: "évolution des personnages, changements majeurs, impact profond sur les personnages et l'intrigue",
    label: "Transformation",
    icon: "auto_fix_high",
    color: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-600",
  },
];

export default function ChapterIntensityIndicators({
  chapter,
  variant = "full",
}: ChapterIntensityIndicatorsProps) {
  // Check if any level exists
  const hasAnyLevel = INTENSITY_LEVELS.some(
    (level) => chapter[level.key as keyof Chapter],
  );

  if (!hasAnyLevel) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        {INTENSITY_LEVELS.map((level) => {
          const value = chapter[level.key as keyof Chapter] as
            | number
            | undefined;
          if (!value) return null;

          return (
            <div
              key={level.key}
              className="flex items-center gap-1"
              title={`${level.label}: ${value}/5`}>
              <span className="material-symbols-outlined text-sm text-gold">
                {level.icon}
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Ambiance du chapitre
      </h3>
      {INTENSITY_LEVELS.map((level) => {
        const value = chapter[level.key as keyof Chapter] as number | undefined;
        if (!value) return null;

        return (
          <div key={level.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span
                  className={` ${level.textColor} material-symbols-outlined text-base`}>
                  {level.icon}
                </span>
                {level.label}
              </label>
              <span
                className={`  ${level.textColor} text-xs font-semibold text-gray-500 `}>
                {value}/5
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${level.color} transition-all duration-300`}
                style={{ width: `${Math.min(value * 20, 100)}%` }}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={5}
                role="progressbar"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
