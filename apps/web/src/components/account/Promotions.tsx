import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { api } from '../../lib/api';
import { ApplicablePromotion } from '@cher-journal/types';
import PromotionModal from '../PromotionModal';

export default function Promotions() {
  const [promotions, setPromotions] = useState<ApplicablePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<ApplicablePromotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const promos = await api.getApplicablePromotions();
      setPromotions(promos);
    } catch (err) {
      console.error('Failed to fetch promotions:', err);
      setError(t('account.promotions.error_loading'));
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

  const getPromotionIcon = (type: string): string => {
    if (type === 'FREE') return 'card_giftcard';
    if (type === 'PERCENT') return 'percent';
    return 'attach_money';
  };

  const getScopeDescription = (scope: string): string => {
    const scopeMap: Record<string, string> = {
      CHAPTER: 'Chapitre complet',
      VOLUME: 'Volume',
      EPILOGUE: 'Épilogue',
      POV: 'Point de vue Protagoniste',
      COLORING: 'Pages de coloriage',
      BUNDLE: 'Bundle',
      SUBSCRIPTION: 'Abonnement',
    };
    return scopeMap[scope] || scope;
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleTakeAdvantage = (promotion: ApplicablePromotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
          {t('account.promotions.title')}
        </h2>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-300 dark:border-red-700 p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">
            error
          </span>
          <p className="text-red-800 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchPromotions}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('account.promotions.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (promotions.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
          {t('account.promotions.title')}
        </h2>
        <p className="text-charcoal dark:text-white/70 mb-8">
          {t('account.promotions.subtitle')}
        </p>
        <div className="bg-gradient-to-br from-boudoir-50 to-boudoir-100 dark:from-[#2d1620]/60 dark:to-[#2d1620]/40 rounded-2xl border border-boudoir-300 dark:border-[#c5a059]/30 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-[#c5a059]/30 mb-4 block">
            card_giftcard
          </span>
          <p className="text-charcoal dark:text-white/70 mb-2 font-medium">
            {t('account.promotions.no_promotions')}
          </p>
          <p className="text-sm text-charcoal/70 dark:text-white/50">
            {t('account.promotions.no_promotions_detail')}
          </p>
        </div>
      </div>
    );
  }

  // Promotions list
  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
        {t('account.promotions.title')}
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        {t('account.promotions.subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="bg-gradient-to-br from-[#2d1620]/80 to-[#1a0d0a]/80 dark:from-[#2d1620] dark:to-[#1a0d0a] rounded-2xl border border-[#c5a059]/30 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Header with promotion value */}
            <div className="bg-gradient-to-r from-[#c5a059] to-[#a0815f] p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {promotion.name}
                  </h3>
                  {promotion.description && (
                    <p className="text-sm text-white/80 line-clamp-2">
                      {promotion.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Promotion value display */}
              <div className="text-center py-4 bg-white/10 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="material-symbols-outlined">
                    {getPromotionIcon(promotion.type)}
                  </span>
                </div>
                <div className="text-3xl font-bold">
                  {getPromotionValue(promotion.type, promotion.value)}
                </div>
                <div className="text-xs text-white/80 mt-1">
                  {promotion.type === 'PERCENT'
                    ? t('account.promotions.discount_percent').replace('{value}', promotion.value?.toString() || '0')
                    : promotion.type === 'FIXED'
                      ? t('account.promotions.discount_fixed').replace('{value}', ((promotion.value || 0) / 100).toFixed(2))
                      : t('account.promotions.free')}
                </div>
              </div>
            </div>

            {/* Scope badge - what this promotion unlocks */}
            <div className="px-4 pt-4 pb-2">
              <span className="inline-block bg-purple-500/20 border border-purple-400/50 text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">
                {getScopeDescription(promotion.scope)}
              </span>
            </div>

            {/* Content info */}
            {promotion.content && (
              <div className="p-4 bg-black/40 pt-2">
                <div className="text-xs text-[#c5a059] mb-3 font-semibold uppercase">
                  {t('account.promotions.unlocks')}
                </div>
                <div className="flex gap-3">
                  {promotion.content.chapterCoverUrl && (
                    <img
                      src={promotion.content.chapterCoverUrl}
                      alt={promotion.content.chapterTitle}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm line-clamp-2">
                      {promotion.content.chapterTitle}
                    </p>
                    {promotion.content.volumeNumber && (
                      <p className="text-white/70 text-xs mt-1">
                        {t('account.promotions.scope_volume').replace(
                          '{number}',
                          promotion.content.volumeNumber.toString()
                        )}
                      </p>
                    )}
                    {!promotion.content.volumeNumber && (
                      <p className="text-white/70 text-xs mt-1">
                        {t('account.promotions.scope_chapter')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General promotion info - no specific content */}
            {!promotion.content && (
              <div className="p-4 bg-black/40 pt-2">
                <p className="text-xs text-white/60">
                  💡 Vous pouvez appliquer cette promotion à n\'importe quel {getScopeDescription(promotion.scope).toLowerCase()}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="p-4 space-y-3 bg-black/20">
              {/* Validity dates */}
              <div className="text-xs text-white/60">
                <span className="material-symbols-outlined text-sm inline mr-2 align-text-bottom">
                  calendar_today
                </span>
                {t('account.promotions.valid_until').replace(
                  '{date}',
                  formatDate(promotion.endsAt)
                )}
              </div>

              {/* Usage info */}
              {promotion.remainingUses !== null && (
                <div className="text-xs text-white/60">
                  <span className="material-symbols-outlined text-sm inline mr-2 align-text-bottom">
                    trending_up
                  </span>
                  {promotion.remainingUses > 0
                    ? t('account.promotions.limited_uses').replace(
                        '{remaining}',
                        promotion.remainingUses.toString()
                      )
                    : t('account.promotions.unlimited')}
                </div>
              )}

              {/* User usage limit */}
              {promotion.userRemainingUses !== null && (
                <div className="text-xs text-white/60">
                  <span className="material-symbols-outlined text-sm inline mr-2 align-text-bottom">
                    person
                  </span>
                  {promotion.userRemainingUses > 0
                    ? `${promotion.userRemainingUses}x disponible${promotion.userRemainingUses > 1 ? 's' : ''}`
                    : 'Limite atteinte'}
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="p-4 border-t border-[#c5a059]/20">
              <button
                onClick={() => handleTakeAdvantage(promotion)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#c5a059] to-[#a0815f] hover:from-[#d4b370] hover:to-[#b09070] text-white font-medium rounded-lg transition-all"
              >
                {t('account.promotions.take_advantage')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        promotion={selectedPromotion}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPromotions}
      />
    </div>
  );
}
