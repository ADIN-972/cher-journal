import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface ReviewStarsProps {
  chapterId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}

export default function ReviewStars({
  chapterId,
  size = 'md',
  showCount = true
}: ReviewStarsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [chapterId]);

  const loadStats = async () => {
    try {
      const data = await api.getChapterReviewStats(chapterId);
      setStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!stats || stats.totalReviews === 0) {
    return <></>
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`material-symbols-outlined ${
                size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
              } text-gray-400`}
            >
              star_border
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-500">Pas encore d'avis</span>
      </div>
    );
  }

  const fullStars = Math.floor(stats.averageRating);
  const hasHalfStar = stats.averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span
            key={`full-${i}`}
            className={`material-symbols-outlined ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            } text-[#c5a059] fill-1`}
          >
            star
          </span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span
            className={`material-symbols-outlined ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            } text-[#c5a059] fill-1`}
          >
            star_half
          </span>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span
            key={`empty-${i}`}
            className={`material-symbols-outlined ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            } text-[#c5a059]/30`}
          >
            star_border
          </span>
        ))}
      </div>

      {showCount && (
        <span className={`${
          size === 'sm' ? 'text-xs' : 'text-sm'
        } text-white/60`}>
          {stats.averageRating.toFixed(1)} ({stats.totalReviews})
        </span>
      )}
    </div>
  );
}
