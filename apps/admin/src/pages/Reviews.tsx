import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

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
    coverAsset?: { url?: string; objectKey?: string } | null;
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' },
  APPROVED: { label: 'Approuve', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  REJECTED: { label: 'Masque', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `Il y a ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [statusFilter, page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: LIMIT.toString() });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
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
    } catch {}
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/approve`);
      toast.success('Avis approuve');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'approbation");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/reject`);
      toast.success('Avis masque');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du masquage');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Supprimer definitivement cet avis ?')) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Avis supprime');
      loadReviews();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Client-side filtering for search and rating
  const filteredReviews = reviews.filter((r) => {
    if (minRating > 0 && r.rating < minRating) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.reviewText.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        r.user.firstName.toLowerCase().includes(q) ||
        r.user.lastName.toLowerCase().includes(q) ||
        r.chapter.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalReviews = stats?.total || 0;
  const startIdx = (page - 1) * LIMIT + 1;
  const endIdx = Math.min(page * LIMIT, totalReviews);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2 block">Gestion du Contenu</span>
          <h2 className="text-4xl md:text-5xl italic font-bold text-gray-900">Moderation des Avis</h2>
        </div>
      </div>

      {/* Search & Filters Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Search */}
        <div className="lg:col-span-2 bg-white dark:bg-[#2b141e] p-6 rounded-2xl shadow-sm flex flex-col justify-center space-y-3">
          <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Recherche textuelle</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#301822] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#e9c176]/40 text-sm"
              placeholder="Rechercher par mot-cle, utilisateur ou chapitre..."
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="bg-white dark:bg-[#2b141e] p-6 rounded-2xl shadow-sm flex flex-col justify-center space-y-3">
          <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Statut de l'avis</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="w-full bg-gray-50 dark:bg-[#301822] border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#e9c176]/40 text-sm"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuves</option>
            <option value="REJECTED">Masques</option>
          </select>
        </div>

        {/* Star filter */}
        <div className="bg-white dark:bg-[#2b141e] p-6 rounded-2xl shadow-sm flex flex-col justify-center space-y-3">
          <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Note Minimale</label>
          <div className="flex justify-between bg-gray-50 dark:bg-[#301822] p-1 rounded-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setMinRating(minRating === star ? 0 : star)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              >
                <span
                  className={`material-symbols-outlined text-lg ${star <= minRating ? 'text-[#e9c176]' : 'text-gray-300 dark:text-gray-600'}`}
                  style={{ fontVariationSettings: star <= minRating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && reviews.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e9c176]" />
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-6">
        {filteredReviews.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-4 block">rate_review</span>
            <p className="text-lg italic">Aucun avis trouve pour ce filtre</p>
          </div>
        )}

        {filteredReviews.map((review) => {
          const userName = `${review.user.firstName} ${review.user.lastName}`.trim() || review.user.email.split('@')[0];
          const statusCfg = STATUS_CONFIG[review.status];
          const isApproved = review.status === 'APPROVED';

          return (
            <div
              key={review.id}
              className={`bg-white dark:bg-[#2b141e] rounded-2xl p-6 transition-all hover:shadow-md group relative overflow-hidden ${
                isApproved ? 'border border-green-200 dark:border-green-800/30 opacity-80' : ''
              }`}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#e9c176] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col lg:flex-row gap-6">
                {/* User & Chapter Meta */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4">
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {(review.user.firstName?.[0] || review.user.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{userName}</h4>
                      <p className="text-xs text-gray-400">{review.user.email}</p>
                    </div>
                  </div>

                  {/* Chapter */}
                  <div className="flex gap-3 bg-gray-50 dark:bg-[#301822] p-3 rounded-xl border border-gray-100 dark:border-[#e9c176]/10">
                    {(review.chapter.coverAsset?.url || review.chapter.coverAsset?.objectKey) ? (
                      <img
                        src={review.chapter.coverAsset.objectKey
                          ? `/uploads/${review.chapter.coverAsset.objectKey}`
                          : review.chapter.coverAsset!.url!}
                        alt={review.chapter.title}
                        className="w-14 h-18 object-cover rounded-lg shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-18 bg-gray-200 dark:bg-[#3d1f2a] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-gray-400 text-xl">auto_stories</span>
                      </div>
                    )}
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[10px] tracking-widest uppercase text-gray-400">{review.chapter.protagonistName}</span>
                      <h5 className="italic text-sm font-semibold text-gray-800 dark:text-white truncate">{review.chapter.title}</h5>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Stars + Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex text-[#e9c176]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusCfg.bg} ${statusCfg.text}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic text-base">
                      "{review.reviewText}"
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 mt-5">
                    {review.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(review.id)}
                          className="px-5 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-[#301822] transition-colors"
                        >
                          Masquer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(review.id)}
                          className="px-6 py-2 rounded-full bg-[#e9c176] text-[#2A1720] text-sm font-bold shadow-sm transition-transform hover:scale-105 active:scale-95"
                        >
                          Approuver
                        </button>
                      </>
                    )}
                    {review.status === 'APPROVED' && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Action traitee
                      </div>
                    )}
                    {review.status === 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(review.id)}
                        className="px-5 py-2 rounded-full border border-[#e9c176]/30 text-[#e9c176] text-sm font-bold hover:bg-[#e9c176]/5 transition-colors"
                      >
                        Restaurer
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="px-3 py-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-between border-t border-gray-200 dark:border-[#e9c176]/10 pt-8">
          <span className="text-sm text-gray-400">
            Affichage de {startIdx}-{endIdx} sur {totalReviews} avis
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-[#e9c176]/20 text-gray-600 hover:bg-gray-100 dark:hover:bg-[#301822] transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  page === p
                    ? 'bg-[#e9c176] text-[#2A1720] shadow-sm'
                    : 'border border-gray-200 dark:border-[#e9c176]/20 text-gray-600 hover:bg-gray-100 dark:hover:bg-[#301822]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 dark:border-[#e9c176]/20 text-gray-600 hover:bg-gray-100 dark:hover:bg-[#301822] transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
