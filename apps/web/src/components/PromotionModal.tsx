import { useState } from 'react';
import { api } from '../lib/api';
import { ApplicablePromotion } from '@cher-journal/types';
import toast from 'react-hot-toast';

interface PromotionModalProps {
  promotion: ApplicablePromotion | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromotionModal({
  promotion,
  isOpen,
  onClose,
  onSuccess,
}: PromotionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !promotion) {
    return null;
  }

  const handleApply = async () => {
    try {
      setIsLoading(true);
      const result = await api.usePromotion(promotion.id);
      toast.success(result.message);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to apply promotion:', error);
      toast.error(error?.message || 'Failed to apply promotion');
    } finally {
      setIsLoading(false);
    }
  };

  const getPromotionValue = (type: string, value?: number | null): string => {
    if (type === 'FREE') return 'GRATUIT';
    if (type === 'PERCENT' && value) return `-${value}%`;
    if (type === 'FIXED' && value) return `-${(value / 100).toFixed(2)}€`;
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#2d1620] rounded-2xl shadow-2xl max-w-md w-full border border-boudoir-200 dark:border-[#c5a059]/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#c5a059] to-[#a0815f] p-6 text-white rounded-t-2xl">
          <h3 className="text-2xl font-bold mb-2">{promotion.name}</h3>
          {promotion.description && (
            <p className="text-white/80">{promotion.description}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Promotion value */}
          <div className="bg-gradient-to-br from-[#c5a059]/10 to-[#a0815f]/10 dark:from-[#c5a059]/5 dark:to-[#a0815f]/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#c5a059] mb-1">
              {getPromotionValue(promotion.type, promotion.value)}
            </div>
            <div className="text-sm text-charcoal/70 dark:text-white/70">
              {promotion.type === 'PERCENT'
                ? `${promotion.value}% discount`
                : promotion.type === 'FIXED'
                  ? `${((promotion.value || 0) / 100).toFixed(2)}€ discount`
                  : 'Free access'}
            </div>
          </div>

          {/* Content details */}
          {promotion.content && (
            <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4">
              <p className="text-xs text-[#c5a059] font-semibold uppercase mb-2">Unlocks</p>
              <p className="font-medium text-charcoal dark:text-white">
                {promotion.content.chapterTitle}
              </p>
              {promotion.content.volumeNumber && (
                <p className="text-sm text-charcoal/70 dark:text-white/70">
                  Volume {promotion.content.volumeNumber}
                </p>
              )}
            </div>
          )}

          {/* Validity info */}
          <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4 text-xs text-charcoal/70 dark:text-white/70 space-y-1">
            <p>
              ⏰ Valid until{' '}
              {new Date(promotion.endsAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {promotion.remainingUses !== null && (
              <p>
                📊{' '}
                {promotion.remainingUses > 0
                  ? `${promotion.remainingUses} uses remaining`
                  : 'Unlimited uses'}
              </p>
            )}
            {promotion.userRemainingUses !== null && (
              <p>
                👤{' '}
                {promotion.userRemainingUses > 0
                  ? `${promotion.userRemainingUses}x available for you`
                  : 'Limit reached'}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-boudoir-300 dark:border-[#c5a059]/30">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-boudoir-300 dark:border-[#c5a059]/30 text-charcoal dark:text-white rounded-lg font-medium hover:bg-boudoir-50 dark:hover:bg-[#2d1620]/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a059] to-[#a0815f] hover:from-[#d4b370] hover:to-[#b09070] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Applying...' : 'Apply Promotion'}
          </button>
        </div>
      </div>
    </div>
  );
}
