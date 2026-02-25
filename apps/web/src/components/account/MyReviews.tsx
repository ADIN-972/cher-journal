import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Review {
  id: string;
  chapterTitle?: string;
  chapter?: {
    id: string;
    title: string;
  };
  rating: number;
  reviewText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function MyReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUserReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Review['status']) => {
    const config = {
      PENDING: {
        label: 'En attente',
        class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        icon: 'schedule',
      },
      APPROVED: {
        label: 'Approuvé',
        class: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
        icon: 'check_circle',
      },
      REJECTED: {
        label: 'Rejeté',
        class: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
        icon: 'cancel',
      },
    };

    const { label, class: className, icon } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        Mes Commentaires
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Retrouvez tous les avis que vous avez laissés.
      </p>

      {reviews.length === 0 ? (
        <div className="bg-gradient-to-br from-[#2d1620]/60 to-[#2d1620]/40 rounded-2xl border border-[#c5a059]/30 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-[#c5a059]/30 mb-4">
            rate_review
          </span>
          <p className="text-charcoal dark:text-white/70 italic">
            Vous n'avez pas encore laissé d'avis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-[#2d1620]/60 rounded-2xl border border-boudoir-200 dark:border-[#c5a059]/30 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-display italic text-charcoal dark:text-white mb-2">
                    {review.chapter?.title || review.chapterTitle}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-lg ${
                            i < review.rating
                              ? 'text-[#c5a059] fill-1'
                              : 'text-charcoal dark:text-white/70'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-charcoal dark:text-white/70">
                      {review.rating}/5
                    </span>
                  </div>
                  {getStatusBadge(review.status)}
                </div>
                <span className="text-xs text-charcoal dark:text-white/70">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <p className="text-charcoal dark:text-white/70 leading-relaxed mb-4">
                {review.reviewText}
              </p>

              <div className="flex gap-3">
                <button className="text-sm text-charcoal dark:text-white/70 hover:text-[#c5a059] transition-colors">
                  Modifier
                </button>
                <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
