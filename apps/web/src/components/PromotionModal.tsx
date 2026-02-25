import { useState, useEffect } from 'react';
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
  const [selectedRefId, setSelectedRefId] = useState<string | null>(null);
  const [availableContent, setAvailableContent] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [userEntitlements, setUserEntitlements] = useState<string[]>([]);
  const [appliedPromotionRefIds, setAppliedPromotionRefIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isOpen && promotion && !promotion.content) {
      // For general promotions without specific content, load available chapters
      loadAvailableContent();
    } else if (isOpen && promotion?.content) {
      // For specific promotions, auto-select the content
      const refId = promotion.scope === 'VOLUME'
        ? `${promotion.content.chapterId}:${promotion.content.volumeNumber}`
        : promotion.content.chapterId;
      setSelectedRefId(refId);
    }
  }, [isOpen, promotion]);

  const loadAvailableContent = async () => {
    try {
      setLoadingContent(true);

      // Load chapters, library, and applied promotions in parallel
      const [chapters, library, appliedPromotions] = await Promise.all([
        api.getChapters(),
        api.getLibrary(),
        api.getAppliedPromotions(),
      ]);

      // Get list of chapter IDs the user already has entitlements for
      const entitledChapterIds = new Set(library.map((ent: any) => ent.chapterId));
      setUserEntitlements(library.map((ent: any) => ent.chapterId));

      // Get list of chapter IDs where this promotion has already been applied
      const appliedRefIdSet = new Set<string>();
      if (promotion) {
        appliedPromotions.forEach((ap: any) => {
          if (ap.promotionId === promotion.id && ap.appliedRefId) {
            appliedRefIdSet.add(ap.appliedRefId);
          }
        });
      }
      setAppliedPromotionRefIds(appliedRefIdSet);

      // Filter out chapters:
      // 1. The user already has access to
      // 2. This promotion has already been applied to
      const filterableChapters = chapters.filter(
        (chapter: any) =>
          !entitledChapterIds.has(chapter.id) && !appliedRefIdSet.has(chapter.id)
      );

      setAvailableContent(filterableChapters);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  if (!isOpen || !promotion) {
    return null;
  }

  const handleApply = async () => {
    if (!promotion.content && !selectedRefId) {
      toast.error('Please select a chapter or volume');
      return;
    }

    try {
      setIsLoading(true);
      const result = await api.usePromotion(promotion.id, selectedRefId || undefined);
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

  const getScopeDescription = (scope: string): string => {
    const scopeMap: Record<string, string> = {
      CHAPTER: 'Débloquer le chapitre complet',
      VOLUME: 'Débloquer un volume',
      EPILOGUE: 'Débloquer l\'épilogue',
      POV: 'Débloquer le point de vue Protagoniste',
      COLORING: 'Débloquer les pages de coloriage',
      BUNDLE: 'Débloquer un bundle',
      SUBSCRIPTION: 'Débloquer un abonnement',
    };
    return scopeMap[scope] || scope;
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
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {/* Promotion value */}
          <div className="bg-gradient-to-br from-[#c5a059]/10 to-[#a0815f]/10 dark:from-[#c5a059]/5 dark:to-[#a0815f]/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#c5a059] mb-1">
              {getPromotionValue(promotion.type, promotion.value)}
            </div>
            <div className="text-sm text-charcoal/70 dark:text-white/70">
              {promotion.type === "PERCENT"
                ? `${promotion.value}% discount`
                : promotion.type === "FIXED"
                  ? `${((promotion.value || 0) / 100).toFixed(2)}€ discount`
                  : "Free access"}
            </div>
          </div>

          {/* Scope info - what does this promotion unlock */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-3 border border-purple-300 dark:border-purple-700/50">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase mb-1">
              Type de déblocage
            </p>
            <p className="text-sm text-purple-900 dark:text-purple-200">
              {getScopeDescription(promotion.scope)}
            </p>
          </div>

          {/* Quota info */}
          <div className="bg-boudoir-50 dark:bg-[#c5a059]/5 rounded-lg p-3 text-xs space-y-2">
            {promotion.remainingUses !== null && (
              <div className="flex items-center gap-2 text-charcoal dark:text-white/70">
                <span className="text-lg">📊</span>
                <span>
                  {promotion.remainingUses > 0
                    ? `${promotion.remainingUses} uses remaining`
                    : "Unlimited uses"}
                </span>
              </div>
            )}
            {promotion.userRemainingUses !== null && (
              <div className="flex items-center gap-2 text-charcoal dark:text-white/70">
                <span className="text-lg">👤</span>
                <span>
                  {promotion.userRemainingUses > 0
                    ? `${promotion.userRemainingUses}x available for you`
                    : "Limit reached"}
                </span>
              </div>
            )}
          </div>

          {/* Content details or selection */}
          {promotion.content ? (
            <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4">
              <p className="text-xs text-[#c5a059] font-semibold uppercase mb-2">
                Unlocks
              </p>
              <p className="font-medium text-charcoal dark:text-white">
                {promotion.content.chapterTitle}
              </p>
              {promotion.content.volumeNumber && (
                <p className="text-sm text-charcoal/70 dark:text-white/70">
                  Volume {promotion.content.volumeNumber}
                </p>
              )}
            </div>
          ) : (
            <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4">
              <p className="text-xs text-[#c5a059] font-semibold uppercase mb-3">
                Select what to unlock
              </p>
              {loadingContent ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c5a059]"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableContent.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => setSelectedRefId(chapter.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedRefId === chapter.id
                          ? "border-[#c5a059] bg-[#c5a059]/10 dark:bg-[#c5a059]/20"
                          : "border-boudoir-300 dark:border-[#c5a059]/20 hover:border-[#c5a059]/50 dark:hover:border-[#c5a059]/40"
                      }`}>
                      <p className="font-medium text-charcoal dark:text-white text-sm">
                        {chapter.protagonistName} : {chapter.title}
                      </p>
                      {chapter.volumes && chapter.volumes.length > 0 && (
                        <p className="text-xs text-charcoal/60 dark:text-white/50 mt-1">
                          {chapter.volumes.length} volume
                          {chapter.volumes.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Validity info */}
          <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4 text-xs text-charcoal/70 dark:text-white/70">
            <p className="flex items-center gap-2">
              <span>⏰</span>
              <span>
                Valid until{" "}
                {new Date(promotion.endsAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-boudoir-300 dark:border-[#c5a059]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-boudoir-300 dark:border-[#c5a059]/30 text-charcoal dark:text-white rounded-lg font-medium hover:bg-boudoir-50 dark:hover:bg-[#2d1620]/80 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading || (!promotion.content && !selectedRefId)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a059] to-[#a0815f] hover:from-[#d4b370] hover:to-[#b09070] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Applying..." : "Apply Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}
