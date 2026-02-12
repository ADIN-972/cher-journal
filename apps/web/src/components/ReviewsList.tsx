import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    username?: string;
  };
}

interface ReviewsListProps {
  chapterId: string;
  maxReviews?: number;
}

export default function ReviewsList({ chapterId, maxReviews }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [chapterId]);

  const loadReviews = async () => {
    try {
      const data = await api.getChapterReviews(chapterId);
      setReviews(maxReviews ? data.slice(0, maxReviews) : data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`material-symbols-outlined text-base ${
              star <= rating ? 'text-[#c5a059] fill-1' : 'text-[#c5a059]/30'
            }`}
          >
            star
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserDisplayName = (user: Review['user']) => {
    if (user.username) return user.username;
    return `${user.firstName} ${user.lastName.charAt(0)}.`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-[#2d1620]/40 to-[#1a0f14]/60 rounded-2xl border border-[#c5a059]/20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c5a059]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#c5a059] text-3xl">rate_review</span>
        </div>
        <h3 className="text-xl font-display italic text-white mb-2">
          Aucun avis pour le moment
        </h3>
        <p className="text-white/60 text-sm">
          Soyez le premier à partager vos impressions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-gradient-to-br from-[#2d1620]/60 to-[#2d1620]/40 rounded-2xl border border-[#c5a059]/30 p-6 backdrop-blur-sm hover:border-[#c5a059]/50 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white font-display italic font-semibold">
                  {getUserDisplayName(review.user)}
                </span>
                {renderStars(review.rating)}
              </div>
              <p className="text-xs text-white/50">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>

          <p className="text-white/80 font-display italic leading-relaxed">
            "{review.reviewText}"
          </p>
        </div>
      ))}
    </div>
  );
}
