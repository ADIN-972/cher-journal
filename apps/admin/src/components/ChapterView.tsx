import {
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCalendarMonth,
} from "react-icons/md";
import { useI18n } from "../lib/i18n";
import BookPreview from "./BookPreview";
import SmartTableGrid, { SmartTableColumn } from "./SmartTableGrid";
import { TableAction } from "./TableGrid";
import type { Chapter } from "@cher-journal/types";
import { SlUserFemale } from "react-icons/sl";
import { getImageUrl } from "../lib/imageUtils";

export type ChapterViewMode = "grid" | "card" | "calendar";

export type ChapterViewProps = {
  viewMode: ChapterViewMode;
  chapters: Chapter[];
  selectedChapterIds: Set<string>;
  toggleChapterSelection: (id: string) => void;
  toggleSelectAll: () => void;
  onViewChapter: (chapterId: string) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  onChapterContextMenu?: (e: React.MouseEvent, chapter: Chapter) => void;
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
};

export default function ChapterView({
  viewMode,
  chapters,
  selectedChapterIds,
  toggleChapterSelection,
  toggleSelectAll,
  onViewChapter,
  onEditChapter,
  onDeleteChapter,
  onChapterContextMenu,
  onBackgroundContextMenu,
}: ChapterViewProps) {
  const { t } = useI18n();

  if (viewMode === "calendar") {
    return (
      <div
        className="p-8 text-center text-gray-500"
        onContextMenu={(e) => onBackgroundContextMenu?.(e)}>
        <MdCalendarMonth className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>{t("chapter_view.calendar_coming_soon")}</p>
      </div>
    );
  }

  if (viewMode === "card") {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-6 gap-3 select-none"
        onContextMenu={(e) => {
          // Only trigger background menu if clicked on the container itself
          if (e.target === e.currentTarget) {
            onBackgroundContextMenu?.(e);
          }
        }}>
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            onContextMenu={(e) => {
              e.stopPropagation();
              onChapterContextMenu?.(e, chapter);
            }}
            className={`relative  overflow-hidden hover:shadow-lg transition-shadow rounded-md ${
              selectedChapterIds.has(chapter.id)
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200"
            }

            
            ${
              chapter.isArchived
                ? "bg-rose-100 border-gray-300 dashed"
                : chapter.status === "PUBLISHED"
                  ? "bg-green-50 border-green-200"
                  : chapter.status === "IN_PROGRESS"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white border-gray-200"
            }
            `}>
            <div className=" h-64  flex items-center justify-center">
              {/* <div className="absolute  bg-[#F9F3EE] rounded-xl top-[20px] h-[380px] w-[80%]  drop-shadow-xl"></div> */}
              {/* <div className="absolute flex bg-[#E7E1CF] h-[60px] w-full top-[170px] left-0"></div> */}
              {/* <div className="absolute flex bg-gradient-to-b from-black/30 to-black/0 w-full top-[260px] left-0 notfar_shad blur-sm"></div>
              <div className="absolute flex top-[250px] left-0 notfar "></div>
              <div className="absolute flex bg-[#F9F3EE] h-[10px] w-full top-[250px] left-0 "></div> */}

              <div className="grid grid-cols-[1fr_auto] gap-3 mt-[40px] ">
                <div className="flex flex-col h-full right-5 my-auto text-center p-1 w-[20px] justify-center items-center">
                  {/* <p className="text-md font-bold text-rose-500 items-center flex-row flex gap-1 mt-auto mb-1 w-full justify-center drop-shadow-lg">
                    <div className="flex-row flex">
                      <SlUserFemale />
                    </div>
                   
                  </p> */}
                  <div className="flex-row w-full flex whitespace-nowrap rotate-[-90deg] text-xl text-gray-600 font-semibold drop-shadow-lg  justify-center text-center items-center">
                    {chapter.protagonistName}
                  </div>
                </div>

                <BookPreview
                  type="square"
                  imageSrc={
                    chapter.coverAsset
                      ? getImageUrl(chapter.coverAsset)
                      : undefined
                  }
                  title={chapter.title}
                  isopen={false}
                />
              </div>

              <button
                onClick={() => toggleChapterSelection(chapter.id)}
                className="absolute top-2 left-2 bg-white rounded-lg p-2 shadow-md hover:shadow-lg transition-shadow ">
                {selectedChapterIds.has(chapter.id) ? "✅" : "⬜"}
              </button>
              <div className="absolute top-8 right-2 px-2 py-1 rounded bg-white/90 text-xs font-semibold text-gray-700 shadow ">
                {formatStatusLabel(chapter.status)}
              </div>
            </div>
            <div className="grid w-full grid-rows-[auto_1fr] -mt-5">
              <div className="border-b border-gray-300/70">
                <div className="flex font-bold text-xl text-center text-gray-600 drop-shadow-lg mt-5 w-full justify-center px-2 ">
                  {chapter.title}
                </div>
                <div className="text-xs font-bold text-gray-600 flex-row flex gap-1 mb-3 w-full justify-center drop-shadow-lg ">
                  {chapter.publishedAt
                    ? new Date(chapter.publishedAt).toLocaleDateString("fr-FR")
                    : "publié dès activation"}
                </div>
                {chapter.stats && chapter.stats.totalVolumes > 0 && (
                  <div className="flex flex-col gap-1 mb-3 text-[10px] text-gray-500 px-2">
                    <div className="flex justify-between">
                      <span>
                        {t("chapter_view.statistics.volumes_written")}:
                      </span>
                      <span className="font-semibold">
                        {chapter.stats.volumesWithText} /{" "}
                        {chapter.stats.totalVolumes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("chapter_view.statistics.volumes_illustrated")}:
                      </span>
                      <span className="font-semibold">
                        {chapter.stats.volumesWithIllustration} /{" "}
                        {chapter.stats.totalVolumes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("chapter_view.statistics.volumes_protagonist")}:
                      </span>
                      <span className="font-semibold">
                        {chapter.stats.volumesWithProtagonist} /{" "}
                        {chapter.stats.totalVolumes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("chapter_view.statistics.coloring_pages")}:
                      </span>
                      <span className="font-semibold">
                        {chapter.stats.coloringPagesCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 p-2 border-t border-gray-300/70 bg-black/5">
                <button
                  onClick={() => onViewChapter(chapter.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {t("buttons.view")}
                </button>
                <button
                  onClick={() => onEditChapter(chapter)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  {t("buttons.edit")}
                </button>
                <button
                  onClick={() => onDeleteChapter(chapter)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium">
                  {t("buttons.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const columns: SmartTableColumn<Chapter>[] = [
    {
      id: "image",
      header: t("chapter_view.table.image"),
      render: (chapter) => {
        return (
          <>
            {chapter.coverAsset ? (
              <img
                src={getImageUrl(chapter.coverAsset)}
                alt={`Couverture ${chapter.title}`}
                width="100"
                height="100"
                className={` flex items-center justify-center w-[100px] h-[100px] rounded-[10px] `}
              />
            ) : (
              <div
                className={` flex items-center justify-center w-[100px] h-[100px] bg-gray-100 rounded-[10px] border border-gray-200`}>
                <span className="text-2xl text-gray-600 font-bold">N/A</span>
              </div>
            )}
          </>
        );
      },
      className: "w-[120px]",
      defaultVisible: true,
    },
    {
      id: "title",
      header: t("chapter_view.table.title"),
      render: (chapter) => chapter.title,
      defaultVisible: true,
    },
    {
      id: "protagonist",
      header: t("chapter_view.table.protagonist"),
      render: (chapter) => chapter.protagonistName,
      defaultVisible: true,
    },
    {
      id: "status",
      header: t("chapter_view.table.status"),
      render: (chapter) => renderStatusBadge(chapter.status, t),
      className: "w-22",
      defaultVisible: true,
    },
    {
      id: "prices",
      header: t("chapter_view.table.prices"),
      render: (chapter) => {
        const node = (
          <>
            <div className="grid w-full grid-cols-1 gap-2 text-sm text-gray-500 ">
              <div className="flex flex-row w-full justify-center gap-2 ">
                <div className="font-bold">
                  {t("chapter_view.pricing_info", "Pricing")}
                </div>
              </div>
              <div className="flex flex-row w-full justify-center gap-2 ">
                <div className="text-sm text-gray-600">
                  {t(
                    "chapter_view.see_price_schemas",
                    "Managed via Price Schemas"
                  )}
                </div>
              </div>
            </div>
          </>
        );

        return node;
      },
      align: "right",
      className: "w-42",
      defaultVisible: false,
    },

    {
      id: "releaseDate",
      header: t("chapter_view.table.release_date"),
      render: (chapter) => {
        return (
          <div className="rounded-md border-gray-400 bg-gray-50 shadow p-2">
            {" "}
            {chapter.publishedAt
              ? new Date(chapter.publishedAt).toLocaleDateString("fr-FR")
              : t("chapter_view.on_activation")}
          </div>
        );
      },
      className: "w-32",
      defaultVisible: true,
    },
  ];

  const actions: TableAction<Chapter>[] = [
    {
      //label: 'Voir',
      onClick: (chapter) => onViewChapter(chapter.id),
      className:
        "bg-blue-50 border border-blue-400 rounded-md p-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 w-full justify-center ",
      icon: <MdVisibility className="w-4 h-4" />,
    },
    {
      //label: 'Modifier',
      onClick: (chapter) => onEditChapter(chapter),
      className:
        "bg-green-50 border border-green-400 rounded-md p-2 text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 w-full justify-center ",
      icon: <MdEdit className="w-4 h-4" />,
    },
    {
      //label: 'Supprimer',
      onClick: (chapter) => onDeleteChapter(chapter),
      className:
        "bg-red-50 border border-red-400 rounded-md p-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 w-full justify-center ",
      icon: <MdDelete className="w-4 h-4" />,
    },
  ];

  return (
    <SmartTableGrid
      listName="chapters"
      data={chapters}
      columns={columns}
      actions={actions}
      selectable
      selectedIds={selectedChapterIds}
      onToggleSelection={toggleChapterSelection}
      onToggleSelectAll={toggleSelectAll}
      getItemId={(chapter) => chapter.id}
      emptyMessage={t("chapter_view.no_chapters")}
      onRowContextMenu={onChapterContextMenu}
      onBackgroundContextMenu={onBackgroundContextMenu}
    />
  );
}

function renderStatusBadge(status: string, t: any) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
  };
  const labels: Record<string, string> = {
    DRAFT: t("chapters.drafts"),
    IN_PROGRESS: t("chapters.in_progress"),
    PUBLISHED: t("chapters.published"),
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {labels[status] || status}
    </span>
  );
}

function formatStatusLabel(status: string) {
  return status === "PUBLISHED"
    ? "Publié"
    : status === "IN_PROGRESS"
      ? "En cours"
      : "Brouillon";
}

function formatPrice(cents?: number | null) {
  if (cents === null || cents === undefined) return "-";
  return `${(cents / 100).toFixed(2)}€`;
}
