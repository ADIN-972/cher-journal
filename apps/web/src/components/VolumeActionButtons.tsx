import { useState } from "react";
import type { Chapter } from "../stores/catalogStore";
import { useToast } from "../hooks/useToast";
import { showInfoToast } from "../lib/toastHelper";
import WaitTimer from "./WaitTimer";
import api from "../lib/api";

type Volume = NonNullable<Chapter["volumes"]>[number];

interface VolumeActionButtonsProps {
  volume: Volume;
  selectedPerspective: "narrateur" | "protagonist" | "coloriage" | null;
  isPurchasing: boolean;
  isStartingWait: boolean;
  needsUpgrade: boolean;
  hasActiveWait: boolean;
  canStartWait: boolean;
  blockageInfo: any;
  chapterId: string;
  onOpenVolume: (volume: Volume) => void;
  onStartWait: (volumeNumber: number) => void;
  onFetchChapter: () => void;
}

export default function VolumeActionButtons({
  volume,
  selectedPerspective,
  isPurchasing,
  isStartingWait,
  needsUpgrade,
  hasActiveWait,
  canStartWait,
  blockageInfo,
  chapterId,
  onOpenVolume,
  onStartWait,
  onFetchChapter,
}: VolumeActionButtonsProps) {
  const toast = useToast();
  const [showSecondaryAction, setShowSecondaryAction] = useState(false);

  const handlePurchaseVolume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chapterId) return;
    try {
      const volumeVersionScope =
        selectedPerspective === "protagonist" ? "ALL" : "BASE";
      const { url } = await api.createCheckoutSession({
        chapterId: chapterId,
        type: "VOLUME",
        volumeNumber: volume.volumeNumber,
        versionScope: volumeVersionScope,
        successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
      });
      if (url) window.location.href = url;
    } catch (err: any) {
      console.error("Failed to create checkout session for volume:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Erreur lors de la création de la session de paiement.";
      toast.error(errorMessage);
    }
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenVolume(volume);
  };

  const handleStartWait = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartWait(volume.volumeNumber);
  };

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    showInfoToast(toast, "FEATURE_COMING_SOON_UPGRADE");
  };

  // State: Needs Upgrade
  if (needsUpgrade) {
    return (
      <div className="flex justify-center sm:justify-start">
        <button
          type="button"
          onClick={handleUpgrade}
          className="group relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined inline text-sm sm:text-base mr-1.5">
            upgrade
          </span>
          <span className="hidden sm:inline">Mettre à niveau</span>
          <span className="sm:hidden">Upgrade</span>
        </button>
      </div>
    );
  }

  // State: Active Wait Timer
  if (hasActiveWait) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-stretch justify-center sm:justify-start">
        <div className="flex-shrink-0">
          <WaitTimer
            remainingMs={blockageInfo.waitRemaining || 0}
            variant="badge"
            onComplete={() => onFetchChapter()}
          />
        </div>
        <button
          type="button"
          onClick={handlePurchaseVolume}
          disabled={isPurchasing}
          className="group relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:scale-100 w-full sm:w-auto">
          <span className="material-symbols-outlined inline text-sm sm:text-base mr-1.5">
            {isPurchasing ? "hourglass_empty" : "shopping_cart"}
          </span>
          <span className="hidden sm:inline">
            {isPurchasing ? "Chargement..." : "Acheter ce volume"}
          </span>
          <span className="sm:hidden">
            {isPurchasing ? "..." : "Acheter"}
          </span>
        </button>
      </div>
    );
  }

  // State: Can Start Wait (primary unlock + secondary wait)
  if (canStartWait) {
    const primaryLabel =
      selectedPerspective === "protagonist"
        ? "Débloquer - Protagoniste"
        : "Débloquer - Narrateur";

    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 w-full sm:w-auto">
        {/* Primary Action - Always visible */}
        <button
          type="button"
          onClick={handleUnlock}
          disabled={isPurchasing}
          className="group relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center sm:justify-start gap-1.5 flex-1 sm:flex-none">
          <span className="material-symbols-outlined text-sm sm:text-base">
            {isPurchasing ? "hourglass_empty" : "shopping_cart"}
          </span>
          <span className="hidden sm:inline">
            {isPurchasing ? "Chargement..." : primaryLabel}
          </span>
          <span className="sm:hidden">
            {isPurchasing ? "..." : "Débloquer"}
          </span>
        </button>

        {/* Secondary Action - Responsive visibility */}
        {selectedPerspective === "narrateur" && (
          <>
            {/* Desktop: Always visible button */}
            <button
              type="button"
              onClick={handleStartWait}
              disabled={isStartingWait}
              className="hidden sm:flex group relative px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden bg-accent-gold hover:bg-accent-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:scale-100 items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base">
                {isStartingWait ? "hourglass_empty" : "timer"}
              </span>
              {isStartingWait ? "Chargement..." : "Attendre gratuitement"}
            </button>

            {/* Mobile: Dropdown toggle */}
            <div className="sm:hidden relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSecondaryAction(!showSecondaryAction);
                }}
                className="w-full px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 bg-boudoir-100 dark:bg-boudoir-900/40 text-boudoir-700 dark:text-boudoir-300 hover:bg-boudoir-200 dark:hover:bg-boudoir-900/60 border border-boudoir-300/40 dark:border-boudoir-700/40 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  {showSecondaryAction ? "expand_less" : "expand_more"}
                </span>
                Plus d'options
              </button>

              {/* Dropdown menu */}
              {showSecondaryAction && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-boudoir-950 rounded-2xl shadow-xl border border-boudoir-200/40 dark:border-boudoir-800/40 backdrop-blur-sm z-10 min-w-max">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleStartWait(e);
                      setShowSecondaryAction(false);
                    }}
                    disabled={isStartingWait}
                    className="w-full px-4 py-2.5 rounded-lg font-semibold text-xs transition-all duration-300 bg-accent-gold hover:bg-accent-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">
                      {isStartingWait ? "hourglass_empty" : "timer"}
                    </span>
                    {isStartingWait ? "Chargement..." : "Attendre"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // No action available
  return null;
}
