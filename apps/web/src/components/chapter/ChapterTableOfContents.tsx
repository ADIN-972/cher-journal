import { ForwardedRef, forwardRef } from "react";
import type { Chapter } from "../../stores/catalogStore";
import { useToast } from "../../hooks/useToast";
import { showInfoToast } from "../../lib/toastHelper";
import WaitTimer from "../WaitTimer";
import api from "../../lib/api";

type Volume = NonNullable<Chapter["volumes"]>[number];

interface ChapterTableOfContentsProps {
  chapter: Chapter;
  selectedPerspective: "narrateur" | "protagonist" | "coloriage" | null;
  isPurchasing: boolean;
  isStartingWait: boolean;
  onOpenVolume: (volume: Volume) => void;
  onStartWait: (volumeNumber: number) => void;
  onUnlock: () => void;
  onFetchChapter: () => void;
  chapterId: string;
}

export default forwardRef<
  HTMLElement,
  ChapterTableOfContentsProps
>(function ChapterTableOfContents(
  {
    chapter,
    selectedPerspective,
    isPurchasing,
    isStartingWait,
    onOpenVolume,
    onStartWait,
    onUnlock,
    onFetchChapter,
    chapterId,
  },
  ref: ForwardedRef<HTMLElement>
) {
  const toast = useToast();

  const renderVolumesList = () => {
    if (!chapter.volumes || chapter.volumes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          Aucun volume disponible pour le moment.
        </div>
      );
    }

    // Get perspective-specific access info
    const perspectiveKey =
      selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR";

    // Filter volumes: show all accessible + first non-accessible for selected perspective
    const volumes = chapter.volumes || [];
    const firstLockedIndex = volumes.findIndex((v) => {
      const perspectiveAccess = v.accessByPerspective?.[perspectiveKey];
      return perspectiveAccess ? !perspectiveAccess.isAccessible : !v.isAccessible;
    });
    const displayedVolumes =
      firstLockedIndex === -1
        ? volumes // All volumes are accessible
        : volumes.slice(0, firstLockedIndex + 1); // All accessible + first locked

    return displayedVolumes.map((volume) => {
      // Get perspective-specific access info, fallback to volume-level access for compatibility
      const perspectiveAccess = volume.accessByPerspective?.[perspectiveKey];
      const isUnlocked = perspectiveAccess
        ? perspectiveAccess.isAccessible
        : volume.isAccessible || false;

      // Determine blockage type and info from perspective-specific data
      const blockageType = perspectiveAccess
        ? perspectiveAccess.blockageType
        : volume.blockageType;
      const blockageInfo = perspectiveAccess
        ? perspectiveAccess.blockageInfo || {}
        : volume.blockageInfo || {};

      // Map blockage types to UI states
      const needsUpgrade =
        blockageType === "PAYWALL" || blockageType === "EPILOGUE";
      const needsEntitlement = blockageType === "WAIT_OR_PAY";

      // Check if wait timer is active
      const hasActiveWait =
        blockageInfo.waitRemaining && blockageInfo.waitRemaining > 0;

      // Backend determines if user can start wait timer (perspective-specific)
      const canStartWait = perspectiveAccess
        ? perspectiveAccess.canStartWait || false
        : volume.canStartWait || false;

      // Get progress for the selected perspective, fallback to NARRATOR
      const progression =
        volume.progressByPerspective?.[perspectiveKey] ??
        volume.progress ??
        0;

      return (
        <div
          key={volume.id}
          onClick={() => onOpenVolume(volume)}
          className={`relative grid grid-cols-[1fr_auto] group flex items-center justify-between p-8  border  rounded-xl hover:border-rose-gold/40 hover:bg-rose-gold/[0.02] transition-all silk-shadow overflow-hidden cursor-pointer ${
            isUnlocked
              ? "bg-white dark:bg-opacity-10 dark:border-opacity-30 border-silk-border"
              : "bg-white/40 dark:bg-black/20 border-silk-border/50  grayscale hover:grayscale-0 hover:opacity-100 transition-all"
          }`}>
          <div className=" grid grid-cols-[auto_1fr] w-full items-center gap-8">
            <div
              className={`text-3xl font-display group-hover:text-rose-gold transition-colors ${
                isUnlocked
                  ? " text-rose-gold/30"
                  : "text-umber dark:text-gray-400 text-opacity-20 "
              } `}>
              {String(volume.volumeNumber).padStart(2, "0")}
            </div>
            <div className="">
              <h3
                className={`text-lg font-bold group-hover:text-terracotta transition-colors  ${
                  isUnlocked
                    ? "  text-terracotta"
                    : "text-umber dark:text-gray-400 text-opacity-50"
                }`}>
                {volume.title}
              </h3>
              <p className="text-sm text-gray-400 italic">
                {isUnlocked
                  ? "Une histoire captivante..."
                  : needsUpgrade
                    ? "Volume Premium - Mise à niveau requise"
                    : needsEntitlement
                      ? "Déverrouillez pour découvrir ce chapitre secret..."
                      : hasActiveWait
                        ? "Compte à rebours en cours..."
                        : "Volume verrouillé"}
              </p>
              {isUnlocked && (
                <div className="">
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-gold h-full rounded-full"
                      style={{ width: `${progression}%` }}></div>
                  </div>
                  <p
                    className={`${
                      progression === 0
                        ? "text-black/40 dark:text-white/40"
                        : "text-gold"
                    }  text-[10px] uppercase font-bold mt-1 tracking-widest`}>
                    {`${
                      progression >= 100
                        ? "Terminé"
                        : progression === 0
                          ? "Pas commencé"
                          : `${progression}% Lu`
                    }`}{" "}
                  </p>
                </div>
              )}
            </div>
          </div>
          {isUnlocked ? (
            <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
              check_circle
            </span>
          ) : needsUpgrade ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Navigate to upgrade page
                showInfoToast(toast, "FEATURE_COMING_SOON_UPGRADE");
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-sm">
                upgrade
              </span>
              Mettre à niveau
            </button>
          ) : hasActiveWait ? (
            <div className="flex flex-col gap-2 items-center">
              <WaitTimer
                remainingMs={blockageInfo.waitRemaining || 0}
                variant="badge"
                onComplete={() => {
                  // Refresh chapter data when timer completes
                  onFetchChapter();
                }}
              />
              <button
                type="button"
                onClick={async (e) => {
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
                    console.error(
                      "Failed to create checkout session for volume:",
                      err
                    );
                    const errorMessage =
                      err.response?.data?.error?.message ||
                      "Erreur lors de la création de la session de paiement.";
                    toast.error(errorMessage);
                  }
                }}
                disabled={isPurchasing}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">
                  {isPurchasing ? "hourglass_empty" : "shopping_cart"}
                </span>
                {isPurchasing
                  ? "Chargement..."
                  : `Acheter juste ce volume`}
              </button>
            </div>
          ) : canStartWait ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
                disabled={isPurchasing}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">
                  {isPurchasing ? "hourglass_empty" : "shopping_cart"}
                </span>
                {isPurchasing
                  ? "Chargement..."
                  : selectedPerspective === "protagonist"
                    ? "Débloquer - Point de vue de la protagoniste"
                    : "Débloquer - Point de vue du narrateur"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartWait(volume.volumeNumber);
                }}
                disabled={isStartingWait}
                className="bg-accent-gold hover:bg-accent-gold/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-sm">
                  {isStartingWait ? "hourglass_empty" : "timer"}
                </span>
                {isStartingWait ? "Chargement..." : "Attendre gratuitement"}
              </button>
            </div>
          ) : (
            <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
              lock
            </span>
          )}
        </div>
      );
    });
  };

  const getPerspectiveName = () => {
    if (!selectedPerspective) return "";
    if (selectedPerspective === "protagonist") return chapter.protagonistName;
    if (selectedPerspective === "coloriage") return "Coloriage";
    return "Narrateur";
  };

  return (
    <section ref={ref} className="mb-20">
      <h2 className="text-3xl font-bold mb-8 border-b border-white/10 pb-4 newsreader italic">
        Table des Matières
        {selectedPerspective && ` - Version ${getPerspectiveName()}`}
      </h2>
      <div className="grid grid-cols-1 gap-4">{renderVolumesList()}</div>
    </section>
  );
});
