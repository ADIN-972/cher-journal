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

interface VolumeCardV3Props {
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
    perspective: "NARRATOR" | "PROTAGONIST",
  ) => void;
}

function getVolumePriceCents(chapter: Chapter, volume: Volume, _index: number) {
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

export default function VolumeCardV3({
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
}: VolumeCardV3Props) {
  const { t } = useI18n();

  const narratorVersion = volume.versions?.find(
    (v) => v.perspective === "NARRATOR",
  );
  const protagonistVersion = volume.versions?.find(
    (v) => v.perspective === "PROTAGONIST",
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
      <div
        className="book-card group"
        id="publishing-chapter">
        <div className="relative book-container">
          <button
            onClick={onToggleSelection}
            className="absolute top-2 left-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow z-[1]">
            {isSelected ? (
              <MdCheckBox className="w-5 h-5 text-blue-600" />
            ) : (
              <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          <div className="absolute bottom-2 left-2 flex flex-col items-center text-xs text-white border border-white/30 bg-black/40 backdrop-blur-sm shadow-md rounded-md p-2  z-[1]">
            <PiClockCountdownBold className="h-5 w-5" />
            <div>{getWaitDurationHours(volume)}h</div>
          </div>
          <div className="book-left">
            <div className="page-texture"></div>
            <img
              alt={`Illustration ${volume.title || `Volume ${volume.volumeNumber}`}`}
              className="book-illustration"
              src={imageUrl}
            />
            <div className="page-curl-left"></div>
          </div>
          <div className="inner-binding"></div>
          <div className="binding-lines"></div>
          <div className="book-right p-8 flex flex-col">
            <div className="page-texture"></div>
            <div className="page-curl-right"></div>
            <div className="flex justify-between items-start mb-6 z-10">
              <div className="flex flex-col gap-2">
                <span className="text-gold font-bold flex items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    payments
                  </span>{" "}
                  {volume.isFree
                    ? "Gratuit"
                    : `${(getVolumePriceCents(chapter, volume, index) / 100).toFixed(2)}€`}
                </span>
                <div className="relative h-5">
                  {(volume.status === "DRAFT" || !volume.status) && (
                    <span
                      className="absolute left-0 top-0 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest border border-slate-200 w-fit"
                      id="draft-badge">
                      {statusLabels[volume.status || "DRAFT"]}
                    </span>
                  )}
                  {volume.status === "PUBLISHED" && (
                    <span
                      className="absolute left-0 top-0 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest border border-green-200 w-fit"
                      id="published-badge">
                      {statusLabels[volume.status]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {volume.status !== "PUBLISHED" && (
                  <button
                    type="button"
                    className="group/btn relative px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-full overflow-hidden transition-all hover:bg-primary/90"
                    id="publish-btn"
                    onClick={() => onEditVolume(volume.id)}>
                    <span className="relative z-10">PUBLIER</span>
                  </button>
                )}
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-full border border-slate-100"
                  onClick={() => onDeleteVolume(volume)}>
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-6 z-10">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                  Vol {volume.volumeNumber}
                </p>
                <h3 className="font-bold text-xl text-slate-900 leading-tight">
                  {volume.title || `Volume ${volume.volumeNumber}`}
                </h3>
              </div>
              <div
                className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter"
                id="status-line">
                <span
                  className="material-symbols-outlined text-[16px] text-slate-400"
                  id="status-icon">
                  edit_note
                </span>
                <span id="status-text">Prêt pour publication</span>
              </div>
              <div className="space-y-3">
                {narratorVersion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditPerspective?.(volume, "NARRATOR");
                    }}
                    className="w-full flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-lg hover:border-primary/40 hover:bg-primary/[0.02] transition-all text-left">
                    <div className="size-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        menu_book
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                        Narrateur
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {narratorVersion.characterCount?.toLocaleString() || 0}{" "}
                        car. •{" "}
                        {getReadingTime(narratorVersion.characterCount || 0)}{" "}
                        min
                      </p>
                    </div>
                  </button>
                )}
                {protagonistVersion && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditPerspective?.(volume, "PROTAGONIST");
                    }}
                    className="w-full flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-lg hover:border-primary/40 hover:bg-primary/[0.02] transition-all text-left">
                    <div className="size-8 bg-primary/10 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        person
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                        Protagoniste
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {protagonistVersion.characterCount?.toLocaleString() ||
                          0}{" "}
                        car. •{" "}
                        {getReadingTime(protagonistVersion.characterCount || 0)}{" "}
                        min
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-400 z-10 tracking-widest uppercase">
              <span>Ref: #{volume.id?.slice(0, 6).toUpperCase() || "N/A"}</span>
              <span>
                Créé :{" "}
                {volume.createdAt
                  ? new Date(volume.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
