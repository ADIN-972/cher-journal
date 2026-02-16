import { useEffect, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { showErrorToast } from '../lib/toastHelper';
import api from '../lib/api';

interface PerspectiveUnlockProps {
  chapterId: string;
  volumeNumber: number;
  canAccessVolume: boolean;
  onPurchase?: (volumeNumber: number) => void;
  isPurchasing?: boolean;
  perspectivePrice?: number;
}

export default function PerspectiveUnlock({
  chapterId,
  volumeNumber,
  canAccessVolume,
  onPurchase,
  isPurchasing = false,
  perspectivePrice: initialPrice,
}: PerspectiveUnlockProps) {
  const toast = useToast();
  const [perspectivePrice, setPerspectivePrice] = useState<number | null>(initialPrice || null);

  // Component is ready when canAccessVolume is determined

  // Get perspective price from pricing info if not provided
  useEffect(() => {
    if (initialPrice) return; // Already have price

    const fetchPerspectivePrice = async () => {
      try {
        const chapter = await api.getChapter(chapterId);
        if (chapter?.pricing?.priceProtagonistUnlock) {
          setPerspectivePrice(chapter.pricing.priceProtagonistUnlock);
        } else {
          setPerspectivePrice(99); // Default fallback
        }
      } catch (err) {
        console.error('Failed to fetch perspective price:', err);
        setPerspectivePrice(99); // Default fallback
      }
    };

    fetchPerspectivePrice();
  }, [chapterId, initialPrice]);

  if (!canAccessVolume) {
    return null;
  }

  const priceInEuros = perspectivePrice ? (perspectivePrice / 100).toFixed(2) : '0.99';

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-4 mb-6 border border-purple-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            🔓 Perspective Protagoniste
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Découvrez le point de vue du protagoniste pour cette histoire. Une perspective inédite sur les événements.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Prix :</span>
            <span className="text-sm font-bold text-purple-700">{priceInEuros}€</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onPurchase) {
              onPurchase(volumeNumber);
            }
          }}
          disabled={isPurchasing}
          className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-xs hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          {isPurchasing ? 'Paiement en cours...' : 'Débloquer'}
        </button>
      </div>
    </div>
  );
}
