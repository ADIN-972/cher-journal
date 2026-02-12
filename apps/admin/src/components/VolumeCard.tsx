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
import BookPreview from "./BookPreview";
import { getImageUrl } from "../lib/imageUtils";

interface VolumeCardProps {
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

export default function VolumeCard({
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
}: VolumeCardProps) {
  const { t } = useI18n();

  return (
    <div
      key={volume.id}
      className={`w-full h-full grid grid-rows-[1fr_auto_auto] rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200"
          : volume.volumeNumber > 10
            ? "border-[#E4AB66]"
            : "border-gray-200 dark:border-gray-700"
      }
      ${volume.status !== "PUBLISHED" ? "dashed" : ""}
      ${volume.volumeNumber > 10 ? "border-4 border-[#E4AB66] bg-gradient-to-b from-[#FFCE8220] to-[#EBAA5C20] shadow-lg shadow-[#FFCE8220]/50" : `${volume.status !== "PUBLISHED" ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-gray-800"} border-2`}
      `}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e);
      }}>
      <div className="flex items-center justify-center font-bold text-gray-900 dark:text-white mb-4 p-4 line-clamp-2 text-sm text-center uppercase bg-black/5 dark:bg-white/5">
        {volume.title
          ? `Vol ${volume.volumeNumber} : ${volume.title}`
          : `Volume ${volume.volumeNumber}`}
      </div>
      <div
        className={`relative flex flex-1 justify-center transition-all ${
          isDragOver ? "ring-4 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}>
        <BookPreview
          type="square"
          imageSrc={
            volume.illustrationAsset
              ? getImageUrl(volume.illustrationAsset)
              : undefined
          }
          title={volume.title}
          isopen={true}
        />

        <button
          onClick={onToggleSelection}
          className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow">
          {isSelected ? (
            <MdCheckBox className="w-5 h-5 text-blue-600" />
          ) : (
            <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </button>
        <div className="absolute top-2 right-2">
          {volume.isFree ? (
            <span className="px-2 py-1 text-xs rounded bg-green-500 text-white font-medium shadow-md">
              Gratuit
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded bg-blue-500 text-white font-medium shadow-md">
              {(getVolumePriceCents(chapter, volume, index) / 100).toFixed(2)}{" "}
              €
            </span>
          )}
        </div>
        <div className="absolute bottom-0 right-2 flex flex-col items-center text-xs text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shadow-md rounded-md p-2">
          <PiClockCountdownBold className="h-6 w-6" />
          <div>{getWaitDurationHours(volume)}h</div>
        </div>
      </div>
      <div className="grid grid-rows-[1fr_auto] p-4">
        {/* Perspectives Indicators */}
        <div className="flex flex-col gap-2 justify-center mb-3 py-2">
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditPerspective?.(volume, "NARRATOR");
            }}
            className={`flex items-center justify-between gap-2 p-3 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-md ${volume.versions?.some((v) => v.perspective === "NARRATOR") ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}>
            <div className="flex items-center gap-1">
              <span>📖</span>
              <span>Narrateur</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(() => {
                const narratorVersion = volume.versions?.find(
                  (v) => v.perspective === "NARRATOR"
                );
                return (
                  <>
                    {narratorVersion?.characterCount !== undefined &&
                      narratorVersion.characterCount > 0 && (
                        <span className="text-[10px] font-semibold opacity-75">
                          {narratorVersion.characterCount.toLocaleString()}
                        </span>
                      )}
                    {narratorVersion?.hasText && (
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEditPerspective?.(volume, "PROTAGONIST");
            }}
            className={`flex items-center justify-between gap-2 p-3 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-md ${volume.versions?.some((v) => v.perspective === "PROTAGONIST") ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}>
            <div className="flex items-center gap-1">
              <span>👤</span>
              <span>Protagoniste</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(() => {
                const protagonistVersion = volume.versions?.find(
                  (v) => v.perspective === "PROTAGONIST"
                );
                return (
                  <>
                    {protagonistVersion?.characterCount !== undefined &&
                      protagonistVersion.characterCount > 0 && (
                        <span className="text-[10px] font-semibold opacity-75">
                          {protagonistVersion.characterCount.toLocaleString()}
                        </span>
                      )}
                    {protagonistVersion?.hasText && (
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {onManagePerspectives && (
            <button
              onClick={() => onManagePerspectives(volume)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
              title={t("volume_view.manage_perspectives")}>
              <MdTune className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onEditVolume(volume.id)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t("chapter_detail.buttons.edit_titles", "Modifier")}>
            <MdEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDeleteVolume(volume)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title={t("chapter_detail.dialog.delete_title", "Supprimer")}>
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
