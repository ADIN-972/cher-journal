import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useI18n } from "../lib/i18n";
import { storage, STORAGE_KEYS } from "../lib/storage";
import { api } from "../lib/api";
import {
  MdCheck,
  MdClose,
  MdFilterList,
  MdPending,
  MdCheckCircle,
  MdCancel,
  MdEmail,
  MdCalendarToday,
  MdPerson,
  MdCategory,
  MdViewList,
  MdViewAgenda,
} from "react-icons/md";
import CustomStoryDetailModal from "../components/CustomStoryDetailModal";
import {
  SmartTableGrid,
  type SmartTableColumn,
} from "../components/SmartTableGrid";
import { TableAction } from "../components/TableGrid";

interface CustomStory {
  id: string;
  userId: string;
  protagonistName: string;
  description: string;
  selectedGenres: string[];
  explicitLevel: string;
  email: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
  };
  photoAssetIds: string[];
  niveauIntensitee: number;
  niveauDouceur: number;
  niveauDanger: number;
  niveauTransformation: number;
  storyEnding: string;
  volumeProposals: Array<{
    volumeNumber: number;
    proposedLocation: string;
    proposedOrientation: string;
    proposedTwist: string;
  }>;
}

interface CustomStoryStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  archived?: number;
}

export default function CustomStories() {
  const [stories, setStories] = useState<CustomStory[]>([]);
  const [stats, setStats] = useState<CustomStoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"
  >("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStory, setSelectedStory] = useState<CustomStory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewModeState] = useState<"list" | "card">("list");
  const { t } = useI18n();

  // Initialize viewMode from localStorage on mount
  useEffect(() => {
    const saved = storage.getString(STORAGE_KEYS.CUSTOM_STORIES_VIEW, "list");
    if (["list", "card"].includes(saved)) {
      setViewModeState(saved as "list" | "card");
    }
  }, []);

  // Save viewMode to localStorage whenever it changes
  const setViewMode = (mode: "list" | "card") => {
    setViewModeState(mode);
    storage.set(STORAGE_KEYS.CUSTOM_STORIES_VIEW, mode);
  };

  useEffect(() => {
    loadStories();
    loadStats();
  }, [statusFilter, page]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const response = await api.get(
        `/admin/custom-stories?${params.toString()}`,
      );
      const data = response.data || response;
      setStories(data.stories || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/custom-stories/stats");
      const stats = response.data || response;
      setStats(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleOpenDetail = (story: CustomStory) => {
    setSelectedStory(story);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedStory(null);
  };

  const handleActionSuccess = () => {
    handleCloseDetail();
    loadStories();
    loadStats();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: MdPending,
        label: "En attente",
      },
      UNDER_REVIEW: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: MdPending,
        label: "En examen",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: MdCheckCircle,
        label: "Approuvé",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: MdCancel,
        label: "Rejeté",
      },
      ARCHIVED: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: MdCancel,
        label: "Archivé",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  // Table columns configuration
  const columns: SmartTableColumn<CustomStory>[] = [
    {
      id: "protagoniste",
      header: "Protagoniste",
      defaultVisible: true,
      render: (story) => (
        <div className="flex items-center gap-3">
          {/* <MdPerson className="w-5 h-5 text-gray-400" /> */}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {story.protagonistName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {story.photoAssetIds.length} photos
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "utilisateur",
      header: "Utilisateur",
      defaultVisible: true,
      render: (story) => (
        <div className="flex items-center gap-2">
          <MdEmail className="w-4 h-4 text-gray-400" />
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              {story.user.firstName} {story.user.lastName}
            </p>
            <p className="text-xs text-gray-500">{story.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "genres",
      header: "Genres",
      defaultVisible: true,
      render: (story) => (
        <div className="flex flex-wrap gap-1">
          {story.selectedGenres.slice(0, 2).map((genre, idx) => {
            const genreTrad = t(`genres.${genre}.title`);

            return (
              <span
                key={idx}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                {genreTrad}
              </span>
            );
          })}
          {story.selectedGenres.length > 2 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
              +{story.selectedGenres.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "explicite",
      header: "Explicité",
      defaultVisible: true,
      accessor: "explicitLevel",
      render: (explicite) => {
        const explicit_level = t(
          `createStory.explicit_levels.${explicite.explicitLevel}.label`,
        );
        return <span className={``}>{explicit_level}</span>;
      },
    },
    {
      id: "statut",
      header: "Statut",
      defaultVisible: true,
      render: (story) => getStatusBadge(story.status),
    },
    {
      id: "date",
      header: "Date",
      defaultVisible: true,
      render: (story) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MdCalendarToday className="w-4 h-4" />
          {formatDate(story.submittedAt)}
        </div>
      ),
    },
  ];

  // Table actions configuration
  const actions: TableAction<CustomStory>[] = [
    {
      label: "Examiner",
      onClick: (story) => handleOpenDetail(story),
      className:
        "px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors",
    },
  ];

  const results = [
    {
      icon: <div className="text-3xl text-gray-400">📊</div>,
      title: "Total",
      text: stats?.total,
    },
    {
      icon: <MdPending className="w-8 h-8 text-yellow-400" />,
      title: "En attente",
      text: stats?.pending,
    },
    {
      icon: <MdPending className="w-8 h-8 text-blue-400" />,
      title: "En examen",
      text: stats?.underReview,
    },
    {
      icon: <MdCheckCircle className="w-8 h-8 text-green-400" />,
      title: "Approuvés",
      text: stats?.approved,
    },
    {
      icon: <MdCancel className="w-8 h-8 text-red-400" />,
      title: "Rejetés",
      text: stats?.rejected,
    },
    {
      icon: <MdCancel className="w-8 h-8 text-gray-400" />,
      title: "Archivés",
      text: stats?.archived || 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Demandes de Histoires Personnalisées
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez et modérez les demandes de création d'histoires personnalisées
        </p>
      </div>
{/* Stats Cards */}
      <div className="flex gap-2">
        {stats &&
          results.map((result, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 grid grid-rows-[auto_1fr_auto] items-center text-center gap-4">
              <div className="flex items-center justify-center w- full"> {result.icon}</div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.text}
              </p>
            </div>
          ))}
      </div>


      {/* Filter & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MdFilterList className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            {(
              [
                "ALL",
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "ARCHIVED",
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                }`}>
                {status === "ALL"
                  ? "Tous"
                  : status === "PENDING"
                    ? "En attente"
                    : status === "UNDER_REVIEW"
                      ? "En examen"
                      : status === "APPROVED"
                        ? "Approuvés"
                        : status === "REJECTED"
                          ? "Rejetés"
                          : "Archivés"}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            title="Vue liste">
            <MdViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded transition-all ${
              viewMode === "card"
                ? "bg-white dark:bg-gray-700 text-indigo-600 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            title="Vue cartes">
            <MdViewAgenda className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stories Display */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Aucune demande trouvée
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="">
          <SmartTableGrid
            listName="custom-stories"
            data={stories}
            columns={columns}
            actions={actions}
            getItemId={(story) => story.id}
            loading={false}
            emptyMessage="Aucune demande trouvée"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className={` rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all overflow-hidden flex flex-col ${story.status === "REJECTED" ? "dashed bg-red-100/30" : story.status === "ARCHIVED" ? "dashed bg-gray-100" : "bg-white dark:bg-gray-800"}`}>
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {story.protagonistName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {story.photoAssetIds.length} photos
                    </p>
                  </div>
                  {getStatusBadge(story.status)}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Utilisateur
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {story.user.firstName} {story.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{story.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Genres
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {story.selectedGenres.slice(0, 3).map((genre, idx) => {
                      const genreTrad = t(`genres.${genre}.title`);

                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {genreTrad}
                        </span>
                      );
                    })}
                    {story.selectedGenres.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                        +{story.selectedGenres.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Explicité
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {t(
                        `createStory.explicit_levels.${story.explicitLevel}.label`,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(story.submittedAt)}
                    </p>
                  </div>
                </div>

                {story.description && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Description
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                      {story.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleOpenDetail(story)}
                  className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Examiner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedStory && (
        <CustomStoryDetailModal
          story={selectedStory}
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          onActionSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
