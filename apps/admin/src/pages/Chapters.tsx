import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { useI18n } from "../lib/i18n";
import {
  MdViewList,
  MdViewModule,
  MdCalendarMonth,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdContentCopy,
  MdArchive,
  MdUnarchive,
  MdAdd,
  MdFilterList,
} from "react-icons/md";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { api } from "../lib/api";
import type { Chapter } from "@cher-journal/types";
import { ChapterStatus } from "@cher-journal/types";
import Modal from "../components/Modal";
import Drawer from "../components/Drawer";
import ChapterForm from "../components/ChapterForm";
import ConfirmDialog from "../components/ConfirmDialog";
import BulkEditChapterModal, {
  BulkChapterUpdates,
} from "../components/BulkEditChapterModal";
import ContextMenu from "../components/ContextMenu";
import { useContextMenu } from "../hooks/useContextMenu";
import ChapterView, { ChapterViewMode } from "../components/ChapterView";
import FloatingActionButton from "../components/FloatingActionButton";
import ChapterStats from "../components/ChapterStats";
import type { ContextMenuSection } from "../components/ContextMenu";

interface ChapterStats {
  total: number;
  published: number;
  draft: number;
  inProgress: number;
  publishedPercentage: number;
  draftPercentage: number;
  inProgressPercentage: number;
}

export default function Chapters() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stats, setStats] = useState<ChapterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(
    new Set()
  );
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<ChapterViewMode>(() => {
    return storage.getString(STORAGE_KEYS.CHAPTER_VIEW_MODE, "grid") as ChapterViewMode;
  });
  const [sortBy, setSortBy] = useState<
    "title-asc" | "title-desc" | "date-asc" | "date-desc"
  >(() => {
    return storage.getString(STORAGE_KEYS.CHAPTER_SORT_BY, "title-asc") as "title-asc" | "title-desc" | "date-asc" | "date-desc";
  });
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "IN_PROGRESS" | "PUBLISHED" | "ARCHIVED"
  >(() => {
    return storage.getString(STORAGE_KEYS.CHAPTER_STATUS_FILTER, "ALL") as "ALL" | "DRAFT" | "IN_PROGRESS" | "PUBLISHED" | "ARCHIVED";
  });
  // Temporary override toggle: include archived items in the list
  const [showArchived, setShowArchived] = useState<boolean>(false);

  useEffect(() => {
    loadChapters();
    loadStats();
  }, []);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CHAPTER_VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CHAPTER_SORT_BY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CHAPTER_STATUS_FILTER, statusFilter);
  }, [statusFilter]);

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/chapters/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load chapter stats:", error);
    }
  };

  const loadChapters = async () => {
    try {
      // Build query using the temporary override toggle
      const response = await api.get(
        `/admin/chapters${showArchived ? "?includeArchived=true" : ""}`
      );
      setChapters(response.data);
    } catch (error) {
      console.error("Failed to load chapters:", error);
      toast.error(t("messages.error.load_chapters"));
    } finally {
      setLoading(false);
    }
  };

  // Initialize toggle from admin setting on first load
  useEffect(() => {
    (async () => {
      try {
        const setting = await api.get("/admin/settings/admin.includeArchived");
        const val = (setting.data?.value ?? setting.data) as string | undefined;
        setShowArchived(val === "true");
      } catch {}
    })();
  }, []);

  // Refetch when override changes
  useEffect(() => {
    if (!loading) {
      loadChapters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const handleCreate = async (data: any) => {
    try {
      await api.post("/admin/chapters", data);
      await loadChapters();
      await loadStats();
      setShowModal(false);
      toast.success(t("messages.success.chapter_created"));
    } catch (error: any) {
      toast.error(error.message || t("messages.error.load_chapters"));
      throw error;
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingChapter) return;
    try {
      await api.patch(`/admin/chapters/${editingChapter.id}`, data);
      await loadChapters();
      await loadStats();
      setEditingChapter(null);
      setShowModal(false);
      toast.success(t("messages.success.chapter_updated"));
    } catch (error: any) {
      toast.error(error.message || t("messages.error.load_chapters"));
      throw error;
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    setDeletingChapter(chapter);
  };

  const confirmDelete = async () => {
    if (!deletingChapter) return;

    try {
      await api.delete(`/admin/chapters/${deletingChapter.id}`);
      toast.success(t("messages.success.chapter_deleted"));
      await loadChapters();
      await loadStats();
    } catch (error: any) {
      toast.error(error.message || t("messages.error.load_chapters"));
    }
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const openEditModal = async (chapter: Chapter) => {
    try {
      // Clear previous data immediately
      setEditingChapter(null);
      setShowModal(true);

      // Fetch full chapter data with all fields
      const response = await api.get(`/admin/chapters/${chapter.id}`);
      console.log("Chapter data from API:", response.data);
      console.log("Title:", response.data?.title);
      console.log("Protagonist:", response.data?.protagonistName);
      console.log("Genres:", response.data?.genres);
      console.log("Accroches:", {
        classic: response.data?.accroche_classic,
        dark: response.data?.accroche_dark,
        love: response.data?.accroche_love,
        marketing: response.data?.accroche_marketing,
        dark_collection: response.data?.accroche_dark_collection,
      });
      console.log("Emotional levels:", {
        intensite: response.data?.niveau_intensite,
        douceur: response.data?.niveau_douceur,
        danger: response.data?.niveau_danger,
        transformation: response.data?.niveau_transformation,
      });
      console.log("Cover asset:", {
        coverAssetId: response.data?.coverAssetId,
        coverAsset: response.data?.coverAsset,
      });
      setEditingChapter(response.data);
    } catch (error: any) {
      console.error("Error loading chapter:", error);
      setShowModal(false);
      toast.error(error.message || t("messages.error.load_chapter"));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingChapter(null);
  };

  const toggleChapterSelection = (chapterId: string) => {
    const newSelection = new Set(selectedChapterIds);
    if (newSelection.has(chapterId)) {
      newSelection.delete(chapterId);
    } else {
      newSelection.add(chapterId);
    }
    setSelectedChapterIds(newSelection);
  };

  const toggleSelectAll = () => {
    // Apply selection only to currently visible chapters
    const visibleIds = sortedChapters.map((c) => c.id);
    const allVisibleSelected = visibleIds.every((id) =>
      selectedChapterIds.has(id)
    );

    if (allVisibleSelected) {
      // Deselect only visible ones, keep others as-is
      const next = new Set(selectedChapterIds);
      visibleIds.forEach((id) => next.delete(id));
      setSelectedChapterIds(next);
    } else {
      // Select all visible ones in addition to already selected
      const next = new Set(selectedChapterIds);
      visibleIds.forEach((id) => next.add(id));
      setSelectedChapterIds(next);
    }
  };

  const handleBulkEdit = () => {
    if (selectedChapterIds.size === 0) {
      toast.error(t("chapters_page.bulk.select_required"));
      return;
    }
    setShowBulkEditModal(true);
  };

  const handleBulkUpdate = async (updates: BulkChapterUpdates) => {
    try {
      const selectedIds = Array.from(selectedChapterIds);
      await api.post(`/admin/chapters/bulk-update`, {
        chapterIds: selectedIds,
        updates,
      });
      toast.success(
        t("chapters_page.bulk.update_success", undefined, {
          count: selectedIds.length,
        })
      );
      setShowBulkEditModal(false);
      setSelectedChapterIds(new Set());
      await loadChapters();
      await loadStats();
    } catch (error: any) {
      toast.error(error.message || t("chapters_page.bulk.update_error"));
    }
  };

  const handleDuplicateChapter = async (chapter: Chapter) => {
    try {
      await api.post(`/admin/chapters/${chapter.id}/duplicate`);
      toast.success(t("chapters_page.duplicate.success"));
      await loadChapters();
      await loadStats();
    } catch (error: any) {
      toast.error(error.message || t("chapters_page.duplicate.error"));
    }
  };

  const handleToggleArchive = async (chapter: Chapter) => {
    try {
      await api.patch(`/admin/chapters/${chapter.id}`, {
        isArchived: !chapter.isArchived,
      });
      toast.success(
        chapter.isArchived
          ? t("chapters_page.archive.unarchived")
          : t("chapters_page.archive.archived")
      );
      await loadChapters();
      await loadStats();
    } catch (error: any) {
      toast.error(error.message || t("chapters_page.archive.error"));
    }
  };

  const handleChangeStatus = async (
    chapter: Chapter,
    status: ChapterStatus
  ) => {
    try {
      await api.patch(`/admin/chapters/${chapter.id}`, { status });
      const statusLabels: Record<ChapterStatus, string> = {
        [ChapterStatus.DRAFT]: t("chapters_page.status.labels.DRAFT"),
        [ChapterStatus.IN_PROGRESS]: t(
          "chapters_page.status.labels.IN_PROGRESS"
        ),
        [ChapterStatus.PUBLISHED]: t("chapters_page.status.labels.PUBLISHED"),
      };
      toast.success(
        t("chapters_page.status.changed", undefined, {
          status: statusLabels[status],
        })
      );
      await loadChapters();
      await loadStats();
    } catch (error: any) {
      toast.error(error.message || t("chapters_page.status.error"));
    }
  };

  const handleChapterContextMenu = (e: React.MouseEvent, chapter: Chapter) => {
    openContextMenu(e, [
      {
        title: t("chapters_page.context.chapter_actions"),
        items: [
          {
            label: t("chapters_page.context.view_volumes"),
            icon: <MdVisibility />,
            onClick: () => navigate(`/chapters/${chapter.id}`),
          },
          {
            label: t("chapters_page.context.edit"),
            icon: <MdEdit />,
            onClick: () => openEditModal(chapter),
          },
          {
            label: t("chapters_page.context.duplicate"),
            icon: <MdContentCopy />,
            onClick: () => handleDuplicateChapter(chapter),
          },
        ],
      },
      {
        title: t("chapters_page.context.publish"),
        items: [
          {
            label: t("chapters_page.context.publish_now"),
            icon: <MdVisibility />,
            onClick: () => handleChangeStatus(chapter, ChapterStatus.PUBLISHED),
            selected: chapter.status === ChapterStatus.PUBLISHED,
          },
          {
            label: t("chapters_page.context.draft"),
            icon: <MdEdit />,
            onClick: () => handleChangeStatus(chapter, ChapterStatus.DRAFT),
            selected: chapter.status === ChapterStatus.DRAFT,
          },
          {
            label: t("chapters_page.context.in_progress"),
            icon: <MdCalendarMonth />,
            onClick: () =>
              handleChangeStatus(chapter, ChapterStatus.IN_PROGRESS),
            selected: chapter.status === ChapterStatus.IN_PROGRESS,
          },
          {
            label: chapter.isArchived
              ? t("chapters_page.context.unarchive")
              : t("chapters_page.context.archive"),
            icon: chapter.isArchived ? <MdUnarchive /> : <MdArchive />,
            onClick: () => handleToggleArchive(chapter),
            selected: chapter.isArchived,
          },
        ],
      },
      {
        title: t("chapters_page.context.actions"),
        items: [
          {
            label: t("chapters_page.context.delete"),
            icon: <MdDelete />,
            onClick: () => handleDelete(chapter),
            danger: true,
          },
        ],
      },
    ]);
  };

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const sections: ContextMenuSection[] = [
      {
        title: t("chapters_page.context.global_actions"),
        items: [
          {
            label: t("chapters_page.context.create"),
            icon: <MdAdd />,
            onClick: openCreateModal,
          },
          {
            label:
              sortedChapters.length > 0 &&
              sortedChapters.every((c) => selectedChapterIds.has(c.id))
                ? t("chapters_page.context.deselect_visible")
                : t("chapters_page.context.select_visible"),
            icon:
              sortedChapters.length > 0 &&
              sortedChapters.every((c) => selectedChapterIds.has(c.id)) ? (
                <MdCheckBoxOutlineBlank />
              ) : (
                <MdCheckBox />
              ),
            onClick: toggleSelectAll,
          },
        ],
      },
    ];

    // Add bulk edit section if items are selected
    if (selectedChapterIds.size > 0) {
      sections.push({
        title: t("chapters_page.context.selection"),
        items: [
          {
            label: t("chapters_page.context.bulk_edit", undefined, {
              count: selectedChapterIds.size,
            }),
            icon: <MdEdit />,
            onClick: handleBulkEdit,
          },
        ],
      });
    }

    sections.push(
      {
        title: t("chapters_page.context.sort"),
        items: [
          {
            label: t("chapters_page.context.sort_az"),
            icon: <FaSortAlphaDown />,
            onClick: () => setSortBy("title-asc"),
            selected: sortBy === "title-asc",
          },
          {
            label: t("chapters_page.context.sort_za"),
            icon: <FaSortAlphaUp />,
            onClick: () => setSortBy("title-desc"),
            selected: sortBy === "title-desc",
          },
          {
            label: t("chapters_page.context.sort_date_recent"),
            icon: <MdCalendarMonth />,
            onClick: () => setSortBy("date-desc"),
            selected: sortBy === "date-desc",
          },
          {
            label: t("chapters_page.context.sort_date_old"),
            icon: <MdCalendarMonth className="rotate-180" />,
            onClick: () => setSortBy("date-asc"),
            selected: sortBy === "date-asc",
          },
        ],
      },
      {
        title: t("chapters_page.context.view"),
        items: [
          {
            label: t("chapters_page.context.view_card"),
            icon: <MdViewModule />,
            onClick: () => setViewMode("card"),
            selected: viewMode === "card",
          },
          {
            label: t("chapters_page.context.view_list"),
            icon: <MdViewList />,
            onClick: () => setViewMode("grid"),
            selected: viewMode === "grid",
          },
          {
            label: t("chapters_page.context.view_calendar"),
            icon: <MdCalendarMonth />,
            onClick: () => setViewMode("calendar"),
            selected: viewMode === "calendar",
          },
        ],
      },
      {
        title: t("chapters_page.context.filter"),
        items: [
          {
            label: t("chapters_page.context.filter_all"),
            icon: <MdFilterList />,
            onClick: () => setStatusFilter("ALL"),
            selected: statusFilter === "ALL",
          },
          {
            label: t("chapters_page.context.filter_published"),
            icon: <MdFilterList />,
            onClick: () => setStatusFilter("PUBLISHED"),
            selected: statusFilter === "PUBLISHED",
          },
          {
            label: t("chapters_page.context.filter_in_progress"),
            icon: <MdFilterList />,
            onClick: () => setStatusFilter("IN_PROGRESS"),
            selected: statusFilter === "IN_PROGRESS",
          },
          {
            label: t("chapters_page.context.filter_draft"),
            icon: <MdFilterList />,
            onClick: () => setStatusFilter("DRAFT"),
            selected: statusFilter === "DRAFT",
          },
          {
            label: t("chapters_page.context.filter_archived"),
            icon: <MdArchive />,
            onClick: () => setStatusFilter("ARCHIVED"),
            selected: statusFilter === "ARCHIVED",
          },
        ],
      }
    );

    openContextMenu(e, sections);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      PUBLISHED: "bg-green-100 text-green-800",
    };
    const labels = {
      DRAFT: t("chapters_page.status.labels.DRAFT"),
      IN_PROGRESS: t("chapters_page.status.labels.IN_PROGRESS"),
      PUBLISHED: t("chapters_page.status.labels.PUBLISHED"),
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredChapters = chapters.filter((chapter) => {
    if (statusFilter === "ALL")
      return showArchived ? true : !chapter.isArchived;
    if (statusFilter === "DRAFT")
      return (
        chapter.status === "DRAFT" && (showArchived || !chapter.isArchived)
      );
    if (statusFilter === "IN_PROGRESS")
      return (
        chapter.status === "IN_PROGRESS" &&
        (showArchived || !chapter.isArchived)
      );
    if (statusFilter === "PUBLISHED")
      return (
        chapter.status === "PUBLISHED" && (showArchived || !chapter.isArchived)
      );
    if (statusFilter === "ARCHIVED") return chapter.isArchived;
    return true;
  });

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    switch (sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "date-asc":
        return (
          new Date(a.publishedAt || a.createdAt).getTime() -
          new Date(b.publishedAt || b.createdAt).getTime()
        );
      case "date-desc":
        return (
          new Date(b.publishedAt || b.createdAt).getTime() -
          new Date(a.publishedAt || a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  return (
    <div
      onContextMenu={handleBackgroundContextMenu}
      className="p-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-charcoal dark:text-gray-100 flex items-center gap-3">
          {t("chapters_page.title")}
        </h1>
        <p className="text-charcoal dark:text-gray-400 text-lg font-light">
          {t("chapters_page.description")}
        </p>
      </div>
      <ChapterStats stats={stats} />
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* <h1 className="text-3xl font-bold">Chapitres</h1> */}
          {selectedChapterIds.size > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {t("chapters_page.selection.count", undefined, {
                count: selectedChapterIds.size,
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Bouton Select All */}
          <button
            onClick={toggleSelectAll}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors"
            title={
              sortedChapters.length > 0 &&
              sortedChapters.every((c) => selectedChapterIds.has(c.id))
                ? t("chapters_page.tooltip.deselect_visible")
                : t("chapters_page.tooltip.select_visible")
            }>
            {sortedChapters.length > 0 &&
            sortedChapters.every((c) => selectedChapterIds.has(c.id)) ? (
              <MdCheckBox className="w-5 h-5 text-blue-600" />
            ) : (
              <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Boutons de tri */}
          <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setSortBy("title-asc")}
              className={`p-2 rounded transition-colors ${sortBy === "title-asc" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.sort_az")}>
              <FaSortAlphaDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSortBy("title-desc")}
              className={`p-2 rounded transition-colors ${sortBy === "title-desc" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.sort_za")}>
              <FaSortAlphaUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSortBy("date-desc")}
              className={`p-2 rounded transition-colors ${sortBy === "date-desc" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.sort_date_recent")}>
              <MdCalendarMonth className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSortBy("date-asc")}
              className={`p-2 rounded transition-colors ${sortBy === "date-asc" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.sort_date_old")}>
              <MdCalendarMonth className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Boutons de vue */}
          <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded transition-colors ${viewMode === "card" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.view_card")}>
              <MdViewModule className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.view_list")}>
              <MdViewList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded transition-colors ${viewMode === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title={t("chapters_page.tooltip.view_calendar")}>
              <MdCalendarMonth className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle include archived (temporary override) */}
          <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-2">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                showArchived
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.include_archived")}>
              {showArchived
                ? t("chapters_page.include_archived.on")
                : t("chapters_page.include_archived.off")}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.filter_all")}>
              {t("chapters_page.filters.all")}
            </button>
            <button
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === "PUBLISHED"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.filter_published")}>
              {t("chapters_page.filters.published")}
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-white text-yellow-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.filter_in_progress")}>
              {t("chapters_page.filters.in_progress")}
            </button>
            <button
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === "DRAFT"
                  ? "bg-white text-gray-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.filter_draft")}>
              {t("chapters_page.filters.draft")}
            </button>
            <button
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                statusFilter === "ARCHIVED"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={t("chapters_page.tooltip.filter_archived")}>
              {t("chapters_page.filters.archived")}
            </button>
          </div>
        </div>
      </div>

      {sortedChapters.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">
            {statusFilter === "ALL"
              ? t("chapters_page.empty.all")
              : statusFilter === "DRAFT"
                ? t("chapters_page.empty.draft")
                : statusFilter === "IN_PROGRESS"
                  ? t("chapters_page.empty.in_progress")
                  : statusFilter === "PUBLISHED"
                    ? t("chapters_page.empty.published")
                    : t("chapters_page.empty.archived")}
          </p>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {t("chapters_page.actions.create")}
          </button>
        </div>
      ) : (
        <div>
          <ChapterView
            viewMode={viewMode}
            chapters={sortedChapters}
            selectedChapterIds={selectedChapterIds}
            toggleChapterSelection={toggleChapterSelection}
            toggleSelectAll={toggleSelectAll}
            onViewChapter={(chapterId) => navigate(`/chapters/${chapterId}`)}
            onEditChapter={(chapter) => openEditModal(chapter)}
            onDeleteChapter={(chapter) => handleDelete(chapter)}
            onToggleArchive={(chapter) => handleToggleArchive(chapter)}
            onChapterContextMenu={handleChapterContextMenu}
            onBackgroundContextMenu={handleBackgroundContextMenu}
          />
        </div>
      )}

      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sections={contextMenu.sections}
          onClose={closeContextMenu}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        sections={[
          {
            title: t("chapters_page.fab.title"),
            actions: [
              {
                label: t("chapters_page.actions.create"),
                icon: <MdAdd />,
                onClick: openCreateModal,
                variant: "primary",
              },
              ...(selectedChapterIds.size > 0
                ? [
                    {
                      label: t("chapters_page.actions.bulk_edit"),
                      icon: <MdEdit />,
                      onClick: handleBulkEdit,
                      variant: "secondary" as const,
                      badge: selectedChapterIds.size,
                    },
                  ]
                : []),
              {
                label:
                  sortedChapters.length > 0 &&
                  sortedChapters.every((c) => selectedChapterIds.has(c.id))
                    ? t("chapters_page.actions.deselect_all")
                    : t("chapters_page.actions.select_all"),
                icon:
                  sortedChapters.length > 0 &&
                  sortedChapters.every((c) => selectedChapterIds.has(c.id)) ? (
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

      <Drawer
        isOpen={showModal}
        onClose={closeModal}
        title={
          editingChapter
            ? t("chapters.edit_chapter")
            : t("chapters.create_chapter")
        }
        width="lg">
        <ChapterForm
          chapterId={editingChapter?.id}
          initialData={editingChapter ? (editingChapter as any) : undefined}
          onSubmit={editingChapter ? handleEdit : handleCreate}
          onCancel={closeModal}
        />
      </Drawer>

      <ConfirmDialog
        isOpen={!!deletingChapter}
        onClose={() => setDeletingChapter(null)}
        onConfirm={confirmDelete}
        title={t("chapters.delete_chapter")}
        message={
          <>
            {t("confirmations.delete_chapter")}{" "}
            <strong>"{deletingChapter?.title}"</strong> ?
            <br />
            <span className="text-red-600">
              {t("confirmations.delete_chapter_warning")}
            </span>
          </>
        }
        confirmText={t("common.delete")}
        danger
      />

      <BulkEditChapterModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSubmit={handleBulkUpdate}
        selectedCount={selectedChapterIds.size}
      />
    </div>
  );
}
