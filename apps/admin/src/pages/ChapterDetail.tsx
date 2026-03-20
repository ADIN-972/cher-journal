import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import {
  MdViewList,
  MdViewModule,
  MdCalendarMonth,
  MdAdd,
  MdEdit,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdTune,
  MdArrowBack,
} from "react-icons/md";
import { api } from "../lib/api";
import type { Chapter, Volume, ChapterAsset } from "@cher-journal/types";
import Modal from "../components/Modal";
import Drawer from "../components/Drawer";
import ConfirmDialog from "../components/ConfirmDialog";
import BulkEditVolumeModal, {
  BulkVolumeUpdates,
} from "../components/BulkEditVolumeModal";
import BulkEditTitlesDrawer from "../components/BulkEditTitlesDrawer";
import BulkTextImportModal from "../components/BulkTextImportModal";
import ChapterImageGallery from "../components/ChapterImageGallery";
import ChapterForm from "../components/ChapterForm";
import VolumeView from "../components/VolumeView";
import VolumePerspectiverDrawer from "../components/VolumePerspectiverDrawer";
import DragDropOverlay from "../components/DragDropOverlay";
import FloatingActionButton from "../components/FloatingActionButton";
import ContextMenu from "../components/ContextMenu";
import { useContextMenu } from "../hooks/useContextMenu";
import ChapterSummary from "../components/ChapterSummary";
import ChaptersNavigation from "../components/ChaptersNavigation";
import ChapterMuseSection from "../components/ChapterMuseSection";

export default function ChapterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const chaptersScrollRef = useRef<HTMLDivElement>(null);
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapCount, setBootstrapCount] = useState(10);
  const [deletingVolume, setDeletingVolume] = useState<Volume | null>(null);
  const [selectedVolumeIds, setSelectedVolumeIds] = useState<Set<string>>(
    new Set(),
  );
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [perspectiveDrawerVolume, setPerspectiveDrawerVolume] =
    useState<Volume | null>(null);
  const [selectedPerspective, setSelectedPerspective] = useState<
    "NARRATOR" | "PROTAGONIST" | null
  >(null);
  const [versionsMap, setVersionsMap] = useState<
    Record<
      string,
      Array<{ id: string; perspective: "NARRATOR" | "PROTAGONIST" }>
    >
  >({});
  const [viewMode, setViewMode] = useState<"grid" | "card" | "calendar">(() => {
    const saved = localStorage.getItem("volumeViewMode");
    return (saved as "grid" | "card" | "calendar") || "card";
  });
  const [showDragDropOverlay, setShowDragDropOverlay] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showBulkEditTitlesDrawer, setShowBulkEditTitlesDrawer] =
    useState(false);
  const [showBulkTextImportModal, setShowBulkTextImportModal] = useState(false);
  const [showChapterEditDrawer, setShowChapterEditDrawer] = useState(false);

  useEffect(() => {
    loadChapterDetail();
    loadChaptersList();
  }, [id]);

  useEffect(() => {
    localStorage.setItem("volumeViewMode", viewMode);
  }, [viewMode]);

  // Scroll to current chapter in the navigation
  useEffect(() => {
    if (chaptersScrollRef.current && id) {
      // Find the current chapter button and scroll it into view
      const currentButton = chaptersScrollRef.current.querySelector(
        `button[data-chapter-id="${id}"]`
      );
      if (currentButton) {
        currentButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [id, chapters.length]);

  const loadChaptersList = async () => {
    try {
      const response = await api.get("/admin/chapters");
      setChapters(response.data || []);
    } catch (error) {
      console.error("Failed to load chapters list:", error);
    }
  };

  const loadChapterDetail = async () => {
    try {
      const response = await api.get(`/admin/chapters/${id}`);
      setChapter(response.data);
      setVolumes(response.data.volumes || []);

      // Build versionsMap directly from volumes.versions
      const map: Record<
        string,
        Array<{ id: string; perspective: "NARRATOR" | "PROTAGONIST" }>
      > = {};
      response.data.volumes?.forEach((volume: any) => {
        map[volume.id] = volume.versions || [];
      });
      setVersionsMap(map);
    } catch (error: any) {
      toast.error(t("chapter_detail.toast.load_error"));
      navigate("/chapters");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapVolumes = async () => {
    try {
      await api.post(`/admin/chapters/${id}/bootstrap-volumes`, {
        count: bootstrapCount,
      });
      toast.success(
        t("chapter_detail.toast.volumes_created", "", {
          count: bootstrapCount,
        }),
      );
      setShowBootstrapModal(false);
      await loadChapterDetail();
    } catch (error: any) {
      toast.error(error.message || t("chapter_detail.toast.create_error"));
    }
  };

  const handleEditPerspective = (
    volume: Volume,
    perspective: "NARRATOR" | "PROTAGONIST",
  ) => {
    setPerspectiveDrawerVolume(volume);
    setSelectedPerspective(perspective);
  };

  const handleDeleteVolume = async (volume: Volume) => {
    setDeletingVolume(volume);
  };

  const confirmDeleteVolume = async () => {
    if (!deletingVolume) return;
    try {
      await api.delete(`/admin/volumes/${deletingVolume.id}`);
      toast.success(t("chapter_detail.toast.volume_deleted"));
      await loadChapterDetail();
    } catch (error: any) {
      toast.error(error.message || t("chapter_detail.toast.delete_error"));
    }
  };

  const toggleVolumeSelection = (volumeId: string) => {
    const newSelection = new Set(selectedVolumeIds);
    if (newSelection.has(volumeId)) {
      newSelection.delete(volumeId);
    } else {
      newSelection.add(volumeId);
    }
    setSelectedVolumeIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedVolumeIds.size === volumes.length) {
      setSelectedVolumeIds(new Set());
    } else {
      setSelectedVolumeIds(new Set(volumes.map((v) => v.id)));
    }
  };

  const handleVolumeContextMenu = (e: React.MouseEvent, volume: Volume) => {
    openContextMenu(e, [
      {
        title: t("chapter_detail.context_menu.volume_actions"),
        items: [
          {
            label: t("common.edit"),
            icon: <MdEdit />,
            onClick: () => navigate(`/volumes/${volume.id}`),
          },
          {
            label: t("chapter_detail.context_menu.manage_perspectives"),
            icon: <MdTune />,
            onClick: () => setPerspectiveDrawerVolume(volume),
          },
        ],
      },
      {
        title: t("chapter_detail.context_menu.selection"),
        items: [
          {
            label: t("chapter_detail.context_menu.select"),
            icon: selectedVolumeIds.has(volume.id) ? (
              <MdCheckBox />
            ) : (
              <MdCheckBoxOutlineBlank />
            ),
            onClick: () => toggleVolumeSelection(volume.id),
            selected: selectedVolumeIds.has(volume.id),
          },
        ],
      },
      {
        title: t("chapter_detail.context_menu.danger"),
        items: [
          {
            label: t("common.delete"),
            icon: <MdDelete />,
            onClick: () => setDeletingVolume(volume),
            danger: true,
          },
        ],
      },
    ]);
  };

  const handleVolumeBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Test: log les traductions
    console.log("Display label:", t("chapter_detail.context_menu.display"));
    console.log("Card view:", t("common.card_view"));
    console.log("List view:", t("common.list_view"));

    openContextMenu(e, [
      {
        title: t("chapter_detail.context_menu.display"),
        items: [
          {
            label: t("common.card_view"),
            icon: <MdViewModule />,
            onClick: () => setViewMode("card"),
            selected: viewMode === "card",
          },
          {
            label: t("common.list_view"),
            icon: <MdViewList />,
            onClick: () => setViewMode("grid"),
            selected: viewMode === "grid",
          },
          {
            label: t("common.calendar_view"),
            icon: <MdCalendarMonth />,
            onClick: () => setViewMode("calendar"),
            selected: viewMode === "calendar",
          },
        ],
      },
      {
        title: t("chapter_detail.context_menu.selection"),
        items: [
          {
            label:
              volumes.length > 0 &&
              volumes.every((v) => selectedVolumeIds.has(v.id))
                ? t("chapter_detail.context_menu.deselect_all")
                : t("chapter_detail.context_menu.select_all"),
            icon:
              volumes.length > 0 &&
              volumes.every((v) => selectedVolumeIds.has(v.id)) ? (
                <MdCheckBoxOutlineBlank />
              ) : (
                <MdCheckBox />
              ),
            onClick: toggleSelectAll,
          },
        ],
      },
      ...(selectedVolumeIds.size > 0
        ? [
            {
              title: t("chapter_detail.context_menu.bulk_actions"),
              items: [
                {
                  label: t("chapter_detail.context_menu.bulk_edit", "", {
                    count: selectedVolumeIds.size,
                  }),
                  icon: <MdEdit />,
                  onClick: handleBulkEdit,
                },
              ],
            },
          ]
        : []),
    ]);
  };

  const handleBulkEdit = () => {
    if (selectedVolumeIds.size === 0) {
      toast.error(t("chapter_detail.toast.select_required"));
      return;
    }
    setShowBulkEditModal(true);
  };

  const handleBulkUpdate = async (updates: BulkVolumeUpdates) => {
    try {
      const selectedIds = Array.from(selectedVolumeIds);
      await api.post(`/admin/volumes/bulk-update`, {
        volumeIds: selectedIds,
        updates,
      });
      toast.success(
        t("chapter_detail.toast.bulk_update_success", "", {
          count: selectedIds.length,
        }),
      );
      setShowBulkEditModal(false);
      setSelectedVolumeIds(new Set());
      await loadChapterDetail();
    } catch (error: any) {
      toast.error(error.message || t("chapter_detail.toast.bulk_update_error"));
    }
  };

  const handleBulkEditTitles = async (updates: Record<string, string>) => {
    try {
      const updatePromises = Object.entries(updates).map(([volumeId, title]) =>
        api.patch(`/admin/volumes/${volumeId}`, { title }),
      );
      await Promise.all(updatePromises);
      await loadChapterDetail();
      toast.success(
        t("chapter_detail.toast.titles_update_success", "", {
          count: Object.keys(updates).length,
        }),
      );
    } catch (error: any) {
      toast.error(
        error.message || t("chapter_detail.toast.titles_update_error"),
      );
      throw new Error(
        error.message || t("chapter_detail.toast.titles_update_error"),
      );
    }
  };

  const handleAssignImageToChapter = async (
    volumeId: string | null,
    assetId: string,
  ) => {
    try {
      if (volumeId === null) {
        // Assign to chapter as cover
        await api.patch(`/admin/chapters/${id}`, {
          coverAssetId: assetId,
        });
        toast.success(t("chapter_detail.toast.image_assigned_chapter"));
      } else {
        // Assign to volume
        await api.patch(`/admin/volumes/${volumeId}`, {
          illustrationAssetId: assetId,
        });
        toast.success(t("chapter_detail.toast.image_assigned_volume"));
      }
      await loadChapterDetail();
    } catch (error: any) {
      toast.error(
        error.message || t("chapter_detail.toast.image_assign_error"),
      );
      throw new Error(
        error.message || t("chapter_detail.toast.image_assign_error"),
      );
    }
  };

  const handleEditChapter = () => {
    setShowChapterEditDrawer(true);
  };

  const handleChapterUpdate = async (updatedChapter: any) => {
    try {
      await api.patch(`/admin/chapters/${id}`, updatedChapter);
      toast.success(t("chapter_detail.toast.chapter_updated"));
      setShowChapterEditDrawer(false);
      await loadChapterDetail();
    } catch (error: any) {
      toast.error(error.message || t("chapter_detail.toast.update_error"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  if (!chapter) {
    return null;
  }

  return (
    <div
      onContextMenu={(e) => {
        // Show general menu on background click
        // VolumeView will handle its own context menus and call stopPropagation
        // to prevent this handler from being called
        handleVolumeBackgroundContextMenu(e);
      }}
      className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => navigate("/chapters")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition flex-shrink-0 mt-0">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>
        <div
          ref={chaptersScrollRef}
          className="flex-1 overflow-x-auto pb-2">
          {/* Chapters Navigation */}
          {chapters.length > 0 && (
            <ChaptersNavigation
              chapters={chapters}
              currentChapterId={id || ""}
            />
          )}
        </div>
      </div>
      <ChapterSummary
        chapter={chapter}
        onEditCover={handleEditChapter}
        onAddChapter={() => setShowBootstrapModal(true)}
        onPreview={() => {
          /* TODO: implement preview */
        }}
      />

      {chapter && (
        <section className="mb-10">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-boudoir-gold">
                  campaign
                </span>
                Marketing Accroches
              </h3>
              <button
                type="button"
                className="text-xs font-bold text-primary hover:underline">
                Edit Variations
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {/* Classic */}
              <div className="p-6 border-r border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">
                  Classic
                </p>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {chapter.accroche_classic
                    ? `"${chapter.accroche_classic}"`
                    : "—"}
                </p>
              </div>

              {/* Dark / Erotic */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">
                  Dark / Erotic
                </p>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {chapter.accroche_dark ? `"${chapter.accroche_dark}"` : "—"}
                </p>
              </div>

              {/* Love / Romance */}
              <div className="p-6 border-r border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">
                  Love / Romance
                </p>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {chapter.accroche_love ? `"${chapter.accroche_love}"` : "—"}
                </p>
              </div>

              {/* Marketing / Hook */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">
                  Marketing / Hook
                </p>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {chapter.accroche_marketing
                    ? `"${chapter.accroche_marketing}"`
                    : "—"}
                </p>
              </div>

              {/* Dark Collection */}
              <div className="p-6 border-r border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-3">
                  Dark Collection
                </p>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {chapter.accroche_dark_collection
                    ? `"${chapter.accroche_dark_collection}"`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Muse Section */}
      {id && <ChapterMuseSection chapterId={id} />}

      {/* Volumes Section */}
      <div className="border bg-white dark:bg-white/5  border-slate-200 dark:border-white/10 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl text-slate-900 dark:text-white font-semibold">
            {t("chapter_detail.volumes_title", "", { count: volumes.length })}
            {selectedVolumeIds.size > 0 && (
              <span className="ml-2 text-sm text-blue-600">
                {t("chapter_detail.selected_count", "", {
                  count: selectedVolumeIds.size,
                })}
              </span>
            )}
          </h2>
          <div className="space-x-2">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded transition-colors ${viewMode === "card" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  title={t("chapter_detail.view.card")}>
                  <MdViewModule className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  title={t("chapter_detail.view.list")}>
                  <MdViewList className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 rounded transition-colors ${viewMode === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  title={t("chapter_detail.view.calendar")}>
                  <MdCalendarMonth className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setShowBulkEditTitlesDrawer(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm">
                {t("chapter_detail.buttons.edit_titles")}
              </button>
              <button
                onClick={() => setShowBulkTextImportModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
                {t("chapter_detail.buttons.bulk_import")}
              </button>
              <button
                onClick={() => navigate(`/chapters/${id}/volumes/new`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                {t("chapter_detail.buttons.add_volume")}
              </button>
            </div>
          </div>
        </div>

        {volumes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">{t("chapter_detail.no_volumes")}</p>
            <button
              onClick={() => setShowBootstrapModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {t("chapter_detail.buttons.quick_create")}
            </button>
          </div>
        ) : (
          <VolumeView
            viewMode={viewMode}
            volumes={volumes}
            chapter={chapter}
            selectedVolumeIds={selectedVolumeIds}
            toggleVolumeSelection={toggleVolumeSelection}
            toggleSelectAll={toggleSelectAll}
            onEditVolume={(volumeId: string) =>
              navigate(`/volumes/${volumeId}`)
            }
            onDeleteVolume={handleDeleteVolume}
            onManagePerspectives={(volume: Volume) =>
              setPerspectiveDrawerVolume(volume)
            }
            onEditPerspective={handleEditPerspective}
            versionsMap={versionsMap}
            onVolumeContextMenu={handleVolumeContextMenu}
            onBackgroundContextMenu={handleVolumeBackgroundContextMenu}
          />
        )}
      </div>

      {/* Images Section */}
      <div className="bg-white dark:bg-white/5  border border-slate-200 dark:border-white/10 rounded-lg shadow mt-6 p-6">
        <h2 className="text-2xl text-slate-900 dark:text-white font-bold mb-6">
          {t("chapter_detail.chapter_images")}
        </h2>
        <ChapterImageGallery
          chapterId={id!}
          chapter={chapter}
          volumes={volumes}
          onAssignClick={(assetId) => {
            setSelectedAssetId(assetId);
            setShowDragDropOverlay(true);
          }}
        />
      </div>

      {/* Drag Drop Overlay */}
      <DragDropOverlay
        isVisible={showDragDropOverlay}
        chapter={chapter}
        volumes={volumes}
        onDrop={handleAssignImageToChapter}
        onClose={() => {
          setShowDragDropOverlay(false);
          setSelectedAssetId(null);
        }}
        assetId={selectedAssetId}
      />

      {/* Bootstrap Modal */}
      <Modal
        isOpen={showBootstrapModal}
        onClose={() => setShowBootstrapModal(false)}
        title={t("chapter_detail.modal.bootstrap_title")}>
        <div className="space-y-4">
          <p className="text-gray-600">
            {t("chapter_detail.modal.bootstrap_description")}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("chapter_detail.modal.volumes_count")}
            </label>
            <input
              type="number"
              min="1"
              value={bootstrapCount}
              onChange={(e) =>
                setBootstrapCount(Math.max(1, parseInt(e.target.value) || 1))
              }
              aria-label="Nombre de volumes à créer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowBootstrapModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
              {t("common.cancel")}
            </button>
            <button
              onClick={handleBootstrapVolumes}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
              {t("chapter_detail.modal.create")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingVolume}
        onClose={() => setDeletingVolume(null)}
        onConfirm={confirmDeleteVolume}
        title={t("chapter_detail.dialog.delete_title")}
        message={
          deletingVolume
            ? t("chapter_detail.dialog.delete_message", "", {
                number: deletingVolume.volumeNumber,
              })
            : ""
        }
        confirmText={t("common.delete")}
        danger
      />

      {/* Bulk Edit */}
      <BulkEditVolumeModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSubmit={handleBulkUpdate}
        selectedCount={selectedVolumeIds.size}
      />

      {/* Perspective Management */}
      <VolumePerspectiverDrawer
        isOpen={perspectiveDrawerVolume !== null}
        volume={perspectiveDrawerVolume}
        chapter={chapter}
        selectedPerspective={selectedPerspective}
        onSelectPerspective={(perspective) =>
          setSelectedPerspective(perspective)
        }
        onClose={() => {
          setPerspectiveDrawerVolume(null);
          setSelectedPerspective(null);
        }}
      />

      {/* Bulk Edit Titles Drawer */}
      <BulkEditTitlesDrawer
        isOpen={showBulkEditTitlesDrawer}
        volumes={volumes}
        onClose={() => setShowBulkEditTitlesDrawer(false)}
        onSave={handleBulkEditTitles}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: "Actions",
            actions: [
              ...(volumes.length === 0
                ? [
                    {
                      label: t("chapter_detail.fab.quick_create"),
                      icon: <MdAdd />,
                      onClick: () => setShowBootstrapModal(true),
                      variant: "primary" as const,
                    },
                  ]
                : []),
              {
                label: t("chapter_detail.fab.add_volume"),
                icon: <MdAdd />,
                onClick: () => navigate(`/chapters/${id}/volumes/new`),
                variant: "primary",
              },
              ...(selectedVolumeIds.size > 0
                ? [
                    {
                      label: t("chapter_detail.fab.bulk_edit"),
                      icon: <MdEdit />,
                      onClick: handleBulkEdit,
                      variant: "secondary" as const,
                      badge: selectedVolumeIds.size,
                    },
                  ]
                : []),
              {
                label:
                  volumes.length > 0 &&
                  volumes.every((v) => selectedVolumeIds.has(v.id))
                    ? t("chapter_detail.fab.deselect_all")
                    : t("chapter_detail.fab.select_all"),
                icon:
                  volumes.length > 0 &&
                  volumes.every((v) => selectedVolumeIds.has(v.id)) ? (
                    <MdCheckBoxOutlineBlank />
                  ) : (
                    <MdCheckBox />
                  ),
                onClick: toggleSelectAll,
                variant: "secondary",
              },
            ],
          },
        ]}
      />

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sections={contextMenu.sections}
          onClose={closeContextMenu}
        />
      )}

      {/* Bulk Text Import Modal */}
      {showBulkTextImportModal && (
        <BulkTextImportModal
          isOpen={showBulkTextImportModal}
          chapterId={id!}
          onClose={() => setShowBulkTextImportModal(false)}
          onSuccess={() => {
            setShowBulkTextImportModal(false);
            loadChapterDetail();
          }}
        />
      )}

      {/* Chapter Edit Drawer */}
      <Drawer
        isOpen={showChapterEditDrawer}
        onClose={() => setShowChapterEditDrawer(false)}
        title={t("chapters.edit_chapter")}
        width="lg">
        {chapter && (
          <ChapterForm
            chapterId={id}
            initialData={chapter as any}
            onSubmit={handleChapterUpdate}
            onCancel={() => setShowChapterEditDrawer(false)}
          />
        )}
      </Drawer>
    </div>
  );
}
