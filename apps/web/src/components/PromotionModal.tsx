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
  const [selectedRefIds, setSelectedRefIds] = useState<Set<string>>(new Set());
  const [availableContent, setAvailableContent] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [appliedPromotionRefIds, setAppliedPromotionRefIds] = useState<Set<string>>(new Set());

  // Is this a "custom" promotion where the user picks the target?
  const isCustom = isOpen && promotion && !promotion.content;

  // Max selections = userRemainingUses (null = unlimited, select all)
  const maxSelections = promotion?.userRemainingUses ?? null;

  useEffect(() => {
    if (!isOpen || !promotion) return;
    setSelectedRefIds(new Set());

    if (!promotion.content) {
      loadAvailableContent();
    } else {
      const refId =
        promotion.scope === 'VOLUME'
          ? `${promotion.content.chapterId}:${promotion.content.volumeNumber}`
          : promotion.content.chapterId;
      setSelectedRefId(refId);
    }
  }, [isOpen, promotion]);

  const loadAvailableContent = async () => {
    try {
      setLoadingContent(true);
      const [chapters, library, appliedPromotions] = await Promise.all([
        api.getChapters(),
        api.getLibrary(),
        api.getAppliedPromotions(),
      ]);

      const entitledChapterIds = new Set(library.map((ent: any) => ent.chapterId));

      const appliedRefIdSet = new Set<string>();
      if (promotion) {
        appliedPromotions.forEach((ap: any) => {
          if (ap.promotionId === promotion.id && ap.appliedRefId) {
            appliedRefIdSet.add(ap.appliedRefId);
          }
        });
      }
      setAppliedPromotionRefIds(appliedRefIdSet);

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

  const toggleRefId = (id: string) => {
    setSelectedRefIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (maxSelections !== null && next.size >= maxSelections) return prev; // limit reached
        next.add(id);
      }
      return next;
    });
  };

  const handleApply = async () => {
    if (isCustom) {
      if (selectedRefIds.size === 0) {
        toast.error('Veuillez sélectionner au moins un élément');
        return;
      }
      try {
        setIsLoading(true);
        for (const refId of selectedRefIds) {
          await api.usePromotion(promotion!.id, refId);
        }
        toast.success(`Promotion appliquée à ${selectedRefIds.size} élément${selectedRefIds.size > 1 ? 's' : ''}`);
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error('Failed to apply promotion:', error);
        toast.error(error?.message || 'Erreur lors de l\'application de la promotion');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!selectedRefId) {
        toast.error('Veuillez sélectionner un contenu');
        return;
      }
      try {
        setIsLoading(true);
        const result = await api.usePromotion(promotion!.id, selectedRefId);
        toast.success(result.message);
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error('Failed to apply promotion:', error);
        toast.error(error?.message || 'Erreur lors de l\'application de la promotion');
      } finally {
        setIsLoading(false);
      }
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
      VOLUME: 'Débloquer le prochain volume bloqué ou en décompte',
      EPILOGUE: "Débloquer l'épilogue",
      POV_CHAPTER: 'Débloquer le point de vue Protagoniste (chapitre complet)',
      POV_VOLUME: 'Débloquer le point de vue Protagoniste (prochain volume)',
      COLORING: 'Débloquer les pages de coloriage',
      BUNDLE: 'Débloquer un bundle',
      SUBSCRIPTION: 'Débloquer un abonnement',
    };
    return scopeMap[scope] || scope;
  };

  if (!isOpen || !promotion) return null;

  const selectionCount = selectedRefIds.size;
  const limitReached = maxSelections !== null && selectionCount >= maxSelections;
  const canApply = isCustom ? selectionCount > 0 : !!selectedRefId;

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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Promotion value */}
          <div className="bg-gradient-to-br from-[#c5a059]/10 to-[#a0815f]/10 dark:from-[#c5a059]/5 dark:to-[#a0815f]/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#c5a059] mb-1">
              {getPromotionValue(promotion.type, promotion.value)}
            </div>
            <div className="text-sm text-charcoal/70 dark:text-white/70">
              {promotion.type === 'PERCENT'
                ? `${promotion.value}% de réduction`
                : promotion.type === 'FIXED'
                  ? `${((promotion.value || 0) / 100).toFixed(2)}€ de réduction`
                  : 'Accès gratuit'}
            </div>
          </div>

          {/* Scope */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-3 border border-purple-300 dark:border-purple-700/50">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase mb-1">
              Type de déblocage
            </p>
            <p className="text-sm text-purple-900 dark:text-purple-200">
              {getScopeDescription(promotion.scope)}
            </p>
          </div>

          {/* Quota */}
          <div className="bg-boudoir-50 dark:bg-[#c5a059]/5 rounded-lg p-3 text-xs space-y-2">
            {promotion.remainingUses !== null && (
              <div className="flex items-center gap-2 text-charcoal dark:text-white/70">
                <span className="material-symbols-outlined text-base">bar_chart</span>
                <span>
                  {promotion.remainingUses > 0
                    ? `${promotion.remainingUses} utilisations restantes`
                    : 'Utilisations illimitées'}
                </span>
              </div>
            )}
            {promotion.userRemainingUses !== null && (
              <div className="flex items-center gap-2 text-charcoal dark:text-white/70">
                <span className="material-symbols-outlined text-base">person</span>
                <span>
                  {promotion.userRemainingUses > 0
                    ? `${promotion.userRemainingUses} disponible${promotion.userRemainingUses > 1 ? 's' : ''} pour vous`
                    : 'Limite atteinte'}
                </span>
              </div>
            )}
          </div>

          {/* Content: fixed target */}
          {promotion.content ? (
            <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4">
              <p className="text-xs text-[#c5a059] font-semibold uppercase mb-2">
                Débloque
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
            /* Content: multi-select */
            <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[#c5a059] font-semibold uppercase">
                  Choisir le contenu à débloquer
                </p>
                {maxSelections !== null && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      limitReached
                        ? 'bg-[#c5a059]/20 text-[#c5a059]'
                        : 'bg-boudoir-100 dark:bg-boudoir-900/40 text-charcoal/60 dark:text-white/50'
                    }`}>
                    {selectionCount} / {maxSelections}
                  </span>
                )}
              </div>

              {limitReached && (
                <p className="text-xs text-[#c5a059] bg-[#c5a059]/10 rounded-lg px-3 py-2 mb-3">
                  Limite atteinte — désélectionnez un élément pour en choisir un autre.
                </p>
              )}

              {loadingContent ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c5a059]" />
                </div>
              ) : availableContent.length === 0 ? (
                <p className="text-sm text-charcoal/50 dark:text-white/40 text-center py-4">
                  Aucun contenu disponible
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableContent.map((chapter) => {
                    const isSelected = selectedRefIds.has(chapter.id);
                    const isDisabled = !isSelected && limitReached;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleRefId(chapter.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#c5a059] bg-[#c5a059]/10 dark:bg-[#c5a059]/20'
                            : isDisabled
                              ? 'border-boudoir-200 dark:border-[#c5a059]/10 opacity-40 cursor-not-allowed'
                              : 'border-boudoir-300 dark:border-[#c5a059]/20 hover:border-[#c5a059]/50 dark:hover:border-[#c5a059]/40'
                        }`}>
                        {/* Checkbox */}
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#c5a059] bg-[#c5a059]'
                              : 'border-boudoir-400 dark:border-white/30'
                          }`}>
                          {isSelected && (
                            <span className="material-symbols-outlined text-white text-xs leading-none">
                              check
                            </span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal dark:text-white text-sm truncate">
                            {chapter.protagonistName
                              ? `${chapter.protagonistName} : ${chapter.title}`
                              : chapter.title}
                          </p>
                          {chapter.volumes && chapter.volumes.length > 0 && (
                            <p className="text-xs text-charcoal/60 dark:text-white/50 mt-0.5">
                              {chapter.volumes.length} volume{chapter.volumes.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Validity */}
          <div className="border-t border-boudoir-300 dark:border-[#c5a059]/30 pt-4 text-xs text-charcoal/70 dark:text-white/70">
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>
                Valide jusqu'au{' '}
                {new Date(promotion.endsAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
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
            Annuler
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading || !canApply}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#c5a059] to-[#a0815f] hover:from-[#d4b370] hover:to-[#b09070] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading
              ? 'Application...'
              : isCustom && selectionCount > 1
                ? `Appliquer (${selectionCount})`
                : 'Appliquer'}
          </button>
        </div>
      </div>
    </div>
  );
}
