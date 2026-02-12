import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useI18n } from '../lib/i18n';
import { api } from '../lib/api';
import {
  MdStar,
  MdStarBorder,
  MdCheck,
  MdClose,
  MdDelete,
  MdFilterList,
  MdPending,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md';

interface Review {
  id: string;
  userId: string;
  chapterId: string;
  rating: number;
  reviewText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username?: string;
  };
  chapter: {
    id: string;
    title: string;
    protagonistName: string;
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useI18n();

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [statusFilter, page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/admin/reviews?${params.toString()}`);
      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/approve`);
      toast.success('Avis approuvé');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/reject`);
      toast.success('Avis rejeté');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du rejet');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Avis supprimé');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <MdStar key={star} className="text-yellow-500 text-lg" />
          ) : (
            <MdStarBorder key={star} className="text-gray-400 text-lg" />
          )
        )}
      </div>
    );
  };

  const getStatusBadge = (status: Review['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <MdPending className="text-sm" />
            En attente
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <MdCheckCircle className="text-sm" />
            Approuvé
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <MdCancel className="text-sm" />
            Rejeté
          </span>
        );
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Avis</h1>
        <p className="text-gray-600">Modérez les avis laissés par les lecteurs sur les chapitres</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">En attente</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Approuvés</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-1">Rejetés</div>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-2">
          <MdFilterList className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrer par statut</span>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Tous' : status === 'PENDING' ? 'En attente' : status === 'APPROVED' ? 'Approuvés' : 'Rejetés'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun avis trouvé pour ce filtre
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.chapter.title}</h3>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {review.user.firstName} {review.user.lastName}
                      </span>
                      <span>•</span>
                      <span>{review.user.email}</span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 mb-4 italic leading-relaxed">
                  "{review.reviewText}"
                </p>

                <div className="flex items-center gap-2">
                  {review.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <MdCheck className="text-base" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <MdClose className="text-base" />
                        Rejeter
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium ml-auto"
                  >
                    <MdDelete className="text-base" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} sur {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
