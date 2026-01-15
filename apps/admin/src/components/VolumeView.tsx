import type { Chapter, Volume } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import {
  MdCalendarMonth,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdEdit,
  MdTune,
} from "react-icons/md";
import { PiClockCountdownBold } from "react-icons/pi";
import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import BookPreview from "./BookPreview";
import { getImageUrl } from "../lib/imageUtils";
import SmartTableGrid, { SmartTableColumn } from "./SmartTableGrid";
import { TableAction } from "./TableGrid";

type VolumeViewProps = {
  viewMode: "grid" | "card" | "calendar";
  volumes: Volume[];
  chapter: Chapter;
  selectedVolumeIds: Set<string>;
  toggleVolumeSelection: (id: string) => void;
  toggleSelectAll: () => void;
  onEditVolume: (volumeId: string) => void;
  onDeleteVolume: (volume: Volume) => void;
  onManagePerspectives?: (volume: Volume) => void;
  onEditPerspective?: (
    volume: Volume,
    perspective: "NARRATOR" | "PROTAGONIST"
  ) => void;
  versionsMap?: Record<
    string,
    Array<{ id: string; perspective: "NARRATOR" | "PROTAGONIST" }>
  >;
  onAssignImage?: (volumeId: string, assetId: string) => Promise<void>;
  onVolumeContextMenu?: (e: React.MouseEvent, volume: Volume) => void;
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
};

export default function VolumeView({
  viewMode,
  volumes,
  chapter,
  selectedVolumeIds,
  toggleVolumeSelection,
  toggleSelectAll,
  onEditVolume,
  onDeleteVolume,
  onManagePerspectives,
  onEditPerspective,
  versionsMap,
  onAssignImage,
  onVolumeContextMenu,
  onBackgroundContextMenu,
}: VolumeViewProps) {
  if (viewMode === "calendar") {
    return (
      <VolumeCalendarView onBackgroundContextMenu={onBackgroundContextMenu} />
    );
  }

  if (viewMode === "card") {
    return (
      <VolumeCardView
        volumes={volumes}
        chapter={chapter}
        selectedVolumeIds={selectedVolumeIds}
        toggleVolumeSelection={toggleVolumeSelection}
        onEditVolume={onEditVolume}
        onDeleteVolume={onDeleteVolume}
        onManagePerspectives={onManagePerspectives}
        onEditPerspective={onEditPerspective}
        versionsMap={versionsMap}
        onAssignImage={onAssignImage}
        onVolumeContextMenu={onVolumeContextMenu}
        onBackgroundContextMenu={onBackgroundContextMenu}
      />
    );
  }

  return (
    <VolumeGridView
      volumes={volumes}
      chapter={chapter}
      selectedVolumeIds={selectedVolumeIds}
      toggleVolumeSelection={toggleVolumeSelection}
      toggleSelectAll={toggleSelectAll}
      onEditVolume={onEditVolume}
      onDeleteVolume={onDeleteVolume}
      onManagePerspectives={onManagePerspectives}
      onEditPerspective={onEditPerspective}
      versionsMap={versionsMap}
      onAssignImage={onAssignImage}
      onVolumeContextMenu={onVolumeContextMenu}
      onBackgroundContextMenu={onBackgroundContextMenu}
    />
  );
}

function VolumeGridView({
  volumes,
  chapter,
  selectedVolumeIds,
  toggleVolumeSelection,
  toggleSelectAll,
  onEditVolume,
  onDeleteVolume,
  onManagePerspectives,
  onAssignImage,
  onVolumeContextMenu,
  onBackgroundContextMenu,
}: Omit<VolumeViewProps, "viewMode">) {
  const { t } = useI18n();
  const [dragOverVolume, setDragOverVolume] = useState<string | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const handleAutoScroll = (e: React.DragEvent) => {
    const threshold = 200; // pixels from edge to trigger scroll
    const scrollSpeed = 10; // pixels per interval

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;

    if (mouseY < threshold) {
      // Scroll up
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, -scrollSpeed);
      }, 16);
    } else if (mouseY > viewportHeight - threshold) {
      // Scroll down
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 16);
    }
  };

  const handleDragOver = (e: React.DragEvent, volumeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverVolume(volumeId);
    handleAutoScroll(e);
  };

  const handleDragLeave = () => {
    setDragOverVolume(null);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleDrop = async (e: React.DragEvent, volumeId: string) => {
    e.preventDefault();
    setDragOverVolume(null);

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const assetId = e.dataTransfer.getData("assetId");
    if (assetId && onAssignImage) {
      try {
        await onAssignImage(volumeId, assetId);
        toast.success(t("volume_view.toast.image_assigned"));
      } catch (error) {
        toast.error(t("volume_view.toast.image_assign_error"));
      }
    }
  };

  const columns: SmartTableColumn<Volume>[] = useMemo(
    () => [
      {
        id: "volumeNumber",
        header: "#",
        render: (volume) => (
          <span className="font-medium">{volume.volumeNumber}</span>
        ),
        className: "w-16",
        defaultVisible: true,
      },
      {
        id: "illustration",
        header: t("volume_view.table.image"),
        render: (volume) => (
          <div
            className={`transition-all ${
              dragOverVolume === volume.id
                ? "bg-blue-100 ring-2 ring-blue-500"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, volume.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, volume.id)}>
            {volume.illustrationAsset ? (
              <img
                src={getImageUrl(volume.illustrationAsset)}
                alt="Illustration"
                className="w-12 h-12 object-cover rounded border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">
                  {t("volume_view.table.image")}
                </span>
              </div>
            )}
          </div>
        ),
        className: "w-24",
        defaultVisible: true,
      },
      {
        id: "title",
        header: t("volume_view.table.title"),
        render: (volume) => volume.title || `Volume ${volume.volumeNumber}`,
        defaultVisible: true,
      },
      {
        id: "price",
        header: t("volume_view.table.price"),
        render: (volume) => {
          const index = volumes.findIndex((v) => v.id === volume.id);
          return (
            <span>
              {(getVolumePriceCents(chapter, volume, index) / 100).toFixed(2)} €
            </span>
          );
        },
        align: "right",
        defaultVisible: true,
      },
      {
        id: "waitDuration",
        header: t("volume_view.table.wait_duration"),
        render: (volume) => `${getWaitDurationHours(volume)}h`,
        align: "center",
        defaultVisible: true,
      },
      {
        id: "isFree",
        header: t("volume_view.table.free"),
        render: (volume) =>
          volume.isFree ? (
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
              {t("volume_view.free")}
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
              {t("chapter_detail.table.price") || "Payant"}
            </span>
          ),
        align: "center",
        defaultVisible: true,
      },
    ],
    [t, chapter, volumes, dragOverVolume]
  );

  const actions: TableAction<Volume>[] = useMemo(
    () => [
      ...(onManagePerspectives
        ? [
            {
              onClick: (volume: Volume) => onManagePerspectives(volume),
              className:
                "text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50",
              icon: <MdTune className="w-5 h-5" />,
            },
          ]
        : []),
      {
        onClick: (volume: Volume) => onEditVolume(volume.id),
        className:
          "text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50",
        icon: <MdEdit className="w-5 h-5" />,
      },
      {
        onClick: (volume: Volume) => onDeleteVolume(volume),
        className:
          "text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50",
        icon: <MdDelete className="w-5 h-5" />,
      },
    ],
    [onManagePerspectives, onEditVolume, onDeleteVolume]
  );

  return (
    <div ref={containerRef}>
      <SmartTableGrid
        listName="volumes"
        data={volumes}
        columns={columns}
        actions={actions}
        selectable
        selectedIds={selectedVolumeIds}
        onToggleSelection={toggleVolumeSelection}
        onToggleSelectAll={toggleSelectAll}
        getItemId={(volume) => volume.id}
        emptyMessage={t("volume_view.no_volumes", "Aucun volume")}
        onRowContextMenu={onVolumeContextMenu}
        onBackgroundContextMenu={onBackgroundContextMenu}
      />
    </div>
  );
}

function VolumeCardView({
  volumes,
  chapter,
  selectedVolumeIds,
  toggleVolumeSelection,
  onEditVolume,
  onDeleteVolume,
  onManagePerspectives,
  onEditPerspective,
  versionsMap,
  onAssignImage,
  onVolumeContextMenu,
  onBackgroundContextMenu,
}: Omit<VolumeViewProps, "viewMode" | "toggleSelectAll">) {
  const { t } = useI18n();
  const [dragOverVolume, setDragOverVolume] = useState<string | null>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const handleAutoScroll = (e: React.DragEvent) => {
    const threshold = 200;
    const scrollSpeed = 10;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;

    if (mouseY < threshold) {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, -scrollSpeed);
      }, 16);
    } else if (mouseY > viewportHeight - threshold) {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 16);
    }
  };

  const handleDragOver = (e: React.DragEvent, volumeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverVolume(volumeId);
    handleAutoScroll(e);
  };

  const handleDragLeave = () => {
    setDragOverVolume(null);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleDrop = async (e: React.DragEvent, volumeId: string) => {
    e.preventDefault();
    setDragOverVolume(null);

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const assetId = e.dataTransfer.getData("assetId");
    if (assetId && onAssignImage) {
      try {
        await onAssignImage(volumeId, assetId);
        toast.success(t("volume_view.toast.image_assigned"));
      } catch (error) {
        toast.error(t("volume_view.toast.image_assign_error"));
      }
    }
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-6"
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          onBackgroundContextMenu?.(e);
        }
      }}>
      {volumes.map((volume, index) => (
        <div
          key={volume.id}
          className={`w-full h-full grid grid-rows-[1fr_auto_auto]  rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
            selectedVolumeIds.has(volume.id)
              ? "border-blue-500 ring-2 ring-blue-200"
              : volume.volumeNumber > 10
                ? "border-[#E4AB66]"
                : "border-gray-200"
          }
              
          ${volume.volumeNumber > 10 ? "border-4 border-[#E4AB66]  bg-gradient-to-b from-[#FFCE8220] to-[#EBAA5C20] shadow-lg shadow-[#FFCE8220]/50  " : "bg-white border-2"}
         
          `}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onVolumeContextMenu?.(e, volume);
          }}>
          <div className="flex items-center justify-center font-bold text-gray-900 mb-4 p-4 line-clamp-2 text-sm text-center uppercase bg-black/5">
            {volume.title || `Volume ${volume.volumeNumber}`}
          </div>
          <div
            className={`relative flex flex-1 justify-center  transition-all ${
              dragOverVolume === volume.id
                ? "ring-4 ring-blue-500 bg-blue-50"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, volume.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, volume.id)}>
            <>
              {/* <div className="absolute w-48 h-48 bg-gradient-to-br from-gray-100/40 to-gray-200/40 flex items-center justify-center m-4 rounded-md">
                  <span className="text-4xl font-bold text-gray-900">
                    #{volume.volumeNumber}
                  </span>
                </div> */}
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
            </>

            <button
              onClick={() => toggleVolumeSelection(volume.id)}
              className="absolute top-2 left-2 bg-white rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow">
              {selectedVolumeIds.has(volume.id) ? (
                <MdCheckBox className="w-5 h-5 text-blue-600" />
              ) : (
                <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <div className="absolute top-2 right-2">
              {volume.isFree ? (
                <span className="px-2 py-1 text-xs rounded bg-green-500 text-white font-medium shadow-md">
                  Gratuit
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-blue-500 text-white font-medium shadow-md">
                  {(getVolumePriceCents(chapter, volume, index) / 100).toFixed(
                    2
                  )}{" "}
                  €
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-2 flex flex-col items-center text-xs text-gray-400 border border-gray-300 bg-gray-50 shadow-md rounded-md p-2">
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
                className={`flex items-center justify-between gap-2 p-3 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-md ${volume.versions?.some((v) => v.perspective === "NARRATOR") ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                <div className="flex items-center gap-1">
                  <span>📖</span>
                  <span>Narrateur</span>
                </div>
                {volume.versions?.find((v) => v.perspective === "NARRATOR")
                  ?.hasText && (
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
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditPerspective?.(volume, "PROTAGONIST");
                }}
                className={`flex items-center justify-between gap-2 p-3 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-md ${volume.versions?.some((v) => v.perspective === "PROTAGONIST") ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                <div className="flex items-center gap-1">
                  <span>👤</span>
                  <span>Protagoniste</span>
                </div>
                {volume.versions?.find((v) => v.perspective === "PROTAGONIST")
                  ?.hasText && (
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
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
              {onManagePerspectives && (
                <button
                  onClick={() => onManagePerspectives(volume)}
                  className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                  title={t("volume_view.manage_perspectives")}>
                  <MdTune className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => onEditVolume(volume.id)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                title={t("chapter_detail.buttons.edit_titles", "Modifier")}>
                <MdEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDeleteVolume(volume)}
                className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                title={t("chapter_detail.dialog.delete_title", "Supprimer")}>
                <MdDelete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VolumeCalendarView({
  onBackgroundContextMenu,
}: {
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
}) {
  const { t } = useI18n();
  return (
    <div
      className="p-8 text-center text-gray-500"
      onContextMenu={onBackgroundContextMenu}>
      <MdCalendarMonth className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p>{t("volume_view.calendar_coming_soon")}</p>
    </div>
  );
}

function getVolumePriceCents(
  _chapter: Chapter,
  volume: Volume,
  _index: number
) {
  // Prices are now managed via PriceSchema system
  // This function kept for compatibility but returns 0
  return volume.isFinalPaywall ? 299 : 199; // Default placeholder values
}

function getWaitDurationHours(volume: Volume) {
  return Math.round(volume.waitDuration / (1000 * 60 * 60));
}
