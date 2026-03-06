import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '../lib/i18n';
import { api } from '../lib/api';
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
} from 'react-icons/md';
import CustomStoryDetailModal from '../components/CustomStoryDetailModal';

interface CustomStory {
  id: string;
  userId: string;
  protagonistName: string;
  description: string;
  selectedGenres: string[];
  explicitLevel: string;
  email: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
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
}

export default function CustomStories() {
  const [stories, setStories] = useState<CustomStory[]>([]);
  const [stats, setStats] = useState<CustomStoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStory, setSelectedStory] = useState<CustomStory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    loadStories();
    loadStats();
  }, [statusFilter, page]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/admin/custom-stories?${params.toString()}`);
      setStories(response.data.stories || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/custom-stories/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
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
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: MdPending, label: 'En attente' },
      UNDER_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-800', icon: MdPending, label: 'En examen' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: MdCheckCircle, label: 'Approuvé' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: MdCancel, label: 'Rejeté' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="text-3xl text-gray-400">📊</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <MdPending className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">En examen</p>
                <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
              </div>
              <MdPending className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <MdCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <MdCancel className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <MdFilterList className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En attente' : status === 'UNDER_REVIEW' ? 'En examen' : status === 'APPROVED' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      {/* Stories List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : stories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune demande trouvée</p>
            <p className="text-sm text-gray-500">Vérifiez le filtre ou attendez les nouvelles demandes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Protagoniste</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Genres</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Explicité</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <MdPerson className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{story.protagonistName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{story.photoAssetIds.length} photos</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MdEmail className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">{story.user.firstName} {story.user.lastName}</p>
                          <p className="text-xs text-gray-500">{story.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {story.selectedGenres.slice(0, 2).map((genre, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            {genre}
                          </span>
                        ))}
                        {story.selectedGenres.length > 2 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            +{story.selectedGenres.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {story.explicitLevel}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MdCalendarToday className="w-4 h-4" />
                        {formatDate(story.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetail(story)}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Examiner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
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
