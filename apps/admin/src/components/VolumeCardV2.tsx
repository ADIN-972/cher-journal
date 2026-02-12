import type { Chapter, Volume } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdEdit,
  MdTune,
} from "react-icons/md";
import { PiClockCountdownBold } from "react-icons/pi";
import { getImageUrl } from "../lib/imageUtils";

interface VolumeCardV2Props {
  volume: Volume;
  chapter: Chapter;
  index: number;
  isSelected: boolean;
  isDragOver: boolean;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleSelection: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onEditVolume: (volumeId: string) => void;
  onDeleteVolume: (volume: Volume) => void;
  onManagePerspectives?: (volume: Volume) => void;
  onEditPerspective?: (
    volume: Volume,
    perspective: "NARRATOR" | "PROTAGONIST"
  ) => void;
}

function getVolumePriceCents(
  chapter: Chapter,
  volume: Volume,
  _index: number
) {
  // Volumes 9-10: use pricePaywall
  if (volume.volumeNumber === 9 || volume.volumeNumber === 10) {
    return chapter.pricing?.pricePaywall ?? 299;
  }
  // Volume 11+: use priceEpilogue
  if (volume.volumeNumber >= 11) {
    return chapter.pricing?.priceEpilogue ?? 399;
  }
  // Volumes 1-8: use priceFreeToRead
  return chapter.pricing?.priceFreeToRead ?? 199;
}

function getWaitDurationHours(volume: Volume) {
  return Math.round(volume.waitDuration / (1000 * 60 * 60));
}

function getReadingTime(characterCount: number) {
  const wordsPerMinute = 200;
  const averageWordLength = 5;
  const words = characterCount / averageWordLength;
  return Math.round(words / wordsPerMinute);
}

export default function VolumeCardV2({
  volume,
  chapter,
  index,
  isSelected,
  isDragOver,
  onContextMenu,
  onToggleSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  onEditVolume,
  onDeleteVolume,
  onManagePerspectives,
  onEditPerspective,
}: VolumeCardV2Props) {
  const { t } = useI18n();

  const narratorVersion = volume.versions?.find(
    (v) => v.perspective === "NARRATOR"
  );
  const protagonistVersion = volume.versions?.find(
    (v) => v.perspective === "PROTAGONIST"
  );

  const statusColors = {
    PUBLISHED: "bg-green-500",
    DRAFT: "bg-amber-500",
    IN_PROGRESS: "bg-blue-500",
    ARCHIVED: "bg-gray-500",
  };

  const statusLabels = {
    PUBLISHED: "PUBLIÉ",
    DRAFT: "BROUILLON",
    IN_PROGRESS: "EN COURS",
    ARCHIVED: "ARCHIVÉ",
  };

  const imageUrl = volume.illustrationAsset
    ? getImageUrl(volume.illustrationAsset)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBRUQaNz0ZNMgYG3n5EUA6oGjshdazAnLr-s7AX5X9oHrur6aOTZWfmLkgn5DfWNt4VbFfbd9k2eIJ0RE1rMNt3CSCBqgcGToYn2OTKDsPDB2Qi6wq14f4shk1PoJhj3GBJR6fnuwtevDG9uPKszm2EwuI_mqjYvOnEkpW9f4zrEBG_NGCJG2zm2E3GgH2xGVO7wOFxJU1qPWF89hRTYWCA2ZVxgjlNlLF7oXfJjIqJQbZl0Gmtf4y6w7i4vx38MaqEhXriKiZrBbc";

  return (
    <div
      className={`group relative bg-white dark:bg-white/5 border ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
          : "border-slate-200 dark:border-gray-700"
      } rounded-xl overflow-hidden hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 shadow-sm ${
        isDragOver ? "ring-4 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-40 h-48 sm:h-auto overflow-hidden">
          <img
            alt={volume.title || `Volume ${volume.volumeNumber}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          {/* Checkbox de sélection */}
          <button
            onClick={onToggleSelection}
            className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg p-1.5 shadow-md hover:shadow-lg transition-shadow">
            {isSelected ? (
              <MdCheckBox className="w-4 h-4 text-blue-600" />
            ) : (
              <MdCheckBoxOutlineBlank className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )}
          </button>

          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {volume.isFree ? (
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  check_circle
                </span>
                GRATUIT
              </span>
            ) : (
              <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  payments
                </span>
                {(getVolumePriceCents(chapter, volume, index) / 100).toFixed(2)}
                €
              </span>
            )}
            <span
              className={`${statusColors[volume.status]} text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm`}>
              {statusLabels[volume.status]}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col items-center text-xs text-white border border-white/30 bg-black/40 backdrop-blur-sm shadow-md rounded-md p-2">
            <PiClockCountdownBold className="h-5 w-5" />
            <div>{getWaitDurationHours(volume)}h</div>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {volume.title
                  ? `Vol ${volume.volumeNumber} : ${volume.title}`
                  : `Volume ${volume.volumeNumber}`}
              </h3>
              <div className="flex gap-1">
                {onManagePerspectives && (
                  <button
                    onClick={() => onManagePerspectives(volume)}
                    className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    title={t("volume_view.manage_perspectives")}>
                    <MdTune className="w-[18px] h-[18px]" />
                  </button>
                )}
                <button
                  onClick={() => onEditVolume(volume.id)}
                  className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-primary transition-colors"
                  title={t("chapter_detail.buttons.edit_titles", "Modifier")}>
                  <MdEdit className="w-[18px] h-[18px]" />
                </button>
                <button
                  onClick={() => onDeleteVolume(volume)}
                  className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                  title={t("chapter_detail.dialog.delete_title", "Supprimer")}>
                  <MdDelete className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mb-4">
              <span className="material-symbols-outlined text-[14px]">
                {volume.isFree ? "lock_open" : "lock"}
              </span>
              {volume.isFree
                ? "Gratuit - Disponible immédiatement"
                : `Payant - Attente de ${getWaitDurationHours(volume)}h`}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {narratorVersion && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditPerspective?.(volume, "NARRATOR");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    narratorVersion.hasText
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      : "bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:bg-primary/5 dark:hover:bg-gray-600"
                  }`}>
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    menu_book
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-tighter leading-none mb-0.5">
                      Texte Narrateur
                    </p>
                    <p className="text-slate-700 dark:text-gray-300">
                      {narratorVersion.characterCount
                        ? `${narratorVersion.characterCount.toLocaleString()} car. • ${getReadingTime(narratorVersion.characterCount)} min`
                        : "Pas de texte"}
                    </p>
                  </div>
                  {narratorVersion.hasText && (
                    <span className="material-symbols-outlined text-blue-500 text-[16px]">
                      check_circle
                    </span>
                  )}
                </button>
              )}
              {protagonistVersion && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditPerspective?.(volume, "PROTAGONIST");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                    protagonistVersion.hasText
                      ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      : "bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 hover:bg-primary/5 dark:hover:bg-gray-600"
                  }`}>
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    person
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-tighter leading-none mb-0.5">
                      Texte Protagoniste
                    </p>
                    <p className="text-slate-700 dark:text-gray-300">
                      {protagonistVersion.characterCount
                        ? `${protagonistVersion.characterCount.toLocaleString()} car. • ${getReadingTime(protagonistVersion.characterCount)} min`
                        : "Pas de texte"}
                    </p>
                  </div>
                  {protagonistVersion.hasText && (
                    <span className="material-symbols-outlined text-purple-500 text-[16px]">
                      check_circle
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-gray-500 pt-3 border-t border-slate-100 dark:border-gray-700">
            <span>ID: {volume.id.slice(0, 8)}</span>
            <span>
              {volume.isFinalPaywall ? "Paywall final" : "Volume standard"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
