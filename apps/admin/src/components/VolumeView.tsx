import type { Chapter, Volume } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import { MdCalendarMonth, MdDelete, MdEdit, MdTune } from "react-icons/md";
import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { getImageUrl } from "../lib/imageUtils";
import SmartTableGrid, { SmartTableColumn } from "./SmartTableGrid";
import { TableAction } from "./TableGrid";
import VolumeCard from "./VolumeCard";
import VolumeCardV2 from "./VolumeCardV2";
import VolumeCardV3 from "./VolumeCardV3";

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
    perspective: "NARRATOR" | "PROTAGONIST",
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
          <span className={`font-medium`}>{volume.volumeNumber}</span>
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
                className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
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
        id: "protagonistPrice",
        header: "Protagonist (€)",
        render: (volume) => {
          const price = getProtagonistPriceCents(chapter) / 100;
          return (
            <span className="text-purple-600 font-medium">
              {price.toFixed(2)} €
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
            <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {t("chapter_detail.table.price") || "Payant"}
            </span>
          ),
        align: "center",
        defaultVisible: true,
      },
    ],
    [t, chapter, volumes, dragOverVolume],
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
    [onManagePerspectives, onEditVolume, onDeleteVolume],
  );

  return (
    <div ref={containerRef}>
      <SmartTableGrid
        listName="volumes"
        data={volumes}
        columns={columns}
        actions={actions}
        selectable
        isActive={(volume) => volume.status === "PUBLISHED"}
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
      className="grid grid-cols-1  xl:grid-cols-2  gap-4 p-6"
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          onBackgroundContextMenu?.(e);
        }
      }}>
      {volumes.map((volume, index) => (
        <VolumeCardV3
          key={volume.id}
          volume={volume}
          chapter={chapter}
          index={index}
          isSelected={selectedVolumeIds.has(volume.id)}
          isDragOver={dragOverVolume === volume.id}
          onContextMenu={(e) => onVolumeContextMenu?.(e, volume)}
          onToggleSelection={() => toggleVolumeSelection(volume.id)}
          onDragOver={(e) => handleDragOver(e, volume.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, volume.id)}
          onEditVolume={onEditVolume}
          onDeleteVolume={onDeleteVolume}
          onManagePerspectives={onManagePerspectives}
          onEditPerspective={onEditPerspective}
        />
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

function getProtagonistPriceCents(chapter: Chapter) {
  // Protagonist perspective price
  return (chapter.pricing as any)?.priceProtagonistUnlock ?? 99;
}

function getWaitDurationHours(volume: Volume) {
  return Math.round(volume.waitDuration / (1000 * 60 * 60));
}
