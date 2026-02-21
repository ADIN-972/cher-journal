import { useEffect, useState } from "react";
import WaitTimer from "./WaitTimer";
import { Chapter } from "../stores/catalogStore";

interface PurchaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volume: {
    id: string;
    volumeNumber: number;
    title: string;
    price?: number;
    canStartWait?: boolean;
    blockageInfo?: {
      waitRemaining?: number;
      priceFreeToRead?: number;
      pricePaywall?: number;
      priceEpilogue?: number;
    };
  };
  chapter: Chapter;
  chapterTitle: string;
  bundlePrice?: number;
  onPurchaseVolume: () => void;
  onPurchaseChapter: () => void;
  onStartWaitTimer?: (volumeNumber: number) => Promise<void>;
  onRefreshChapter?: () => void;
  activeWaitsCount?: number;
  maxWaitsAllowed?: number;
}

export default function PurchaseDrawer({
  isOpen,
  onClose,
  volume,
  chapterTitle,
  chapter,
  bundlePrice,
  onPurchaseVolume,
  onPurchaseChapter,
  onStartWaitTimer,
  onRefreshChapter,
  activeWaitsCount = 0,
  maxWaitsAllowed = 2,
}: PurchaseDrawerProps) {
  const [isStartingWait, setIsStartingWait] = useState(false);
  // Close drawer on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use price from API (already calculated on backend)

  const hasActiveWait =
    volume.blockageInfo?.waitRemaining && volume.blockageInfo.waitRemaining > 0;
  const canStartWait =
    volume.canStartWait && !hasActiveWait && activeWaitsCount < maxWaitsAllowed;
  const reachedWaitLimit = activeWaitsCount >= maxWaitsAllowed;

  const handleStartWait = async () => {
    if (!onStartWaitTimer || !canStartWait) return;

    setIsStartingWait(true);
    try {
      await onStartWaitTimer(volume.volumeNumber);
      // The parent will refresh chapter data
    } catch (error) {
      console.error("Failed to start wait timer:", error);
    } finally {
      setIsStartingWait(false);
    }
  };

  // Calculate volume price based on volume number and chapter pricing
  const getVolumePriceByNumber = (volumeNum: number) => {
    if (volumeNum <= 8) {
      return chapter.pricing?.priceFreeToRead ?? 0;
    } else if (volumeNum <= 10) {
      return chapter.pricing?.pricePaywall ?? 0;
    } else {
      return chapter.pricing?.priceEpilogue ?? 0;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 dark:bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-background-light dark:bg-gray-900 z-[70] shadow-2xl border-l border-border-warm dark:border-white/5 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-border-warm dark:border-white/5">
          <h2 className="text-2xl sm:text-3xl font-display italic font-bold text-charcoal dark:text-white">
            Débloquer le Volume
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-charcoal/40 dark:text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors text-3xl">
            close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 space-y-6">
          {/* Wait Timer Card - Show if active */}
          {hasActiveWait && (
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 dark:border-amber-400/40 relative overflow-hidden shadow-lg shadow-amber-500/10">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/5 blur-3xl rounded-full animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 dark:bg-orange-400/5 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400 animate-pulse">
                    schedule
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                    Compte à rebours actif
                  </span>
                </div>

                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-4 border border-amber-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-charcoal dark:text-white">
                      Disponible dans
                    </h3>
                    <WaitTimer
                      remainingMs={volume.blockageInfo?.waitRemaining || 0}
                      variant="badge"
                      onComplete={() => {
                        if (onRefreshChapter) onRefreshChapter();
                      }}
                      chapterTitle={chapterTitle}
                      volumeNumber={volume.volumeNumber}
                    />
                  </div>
                  <p className="text-xs text-charcoal/60 dark:text-gray-400">
                    Lecture gratuite après le timer
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                    info
                  </span>
                  <p className="text-xs text-charcoal/70 dark:text-gray-300">
                    Vous recevrez une notification quand le timer sera terminé.
                    Vous pouvez aussi débloquer immédiatement en achetant
                    ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Volume Information */}
          <div className="mt-6">
            <span className="text-[10px]  font-black uppercase tracking-[0.2em] text-accent-gold dark:text-gold mb-3 block">
              Volume {volume.volumeNumber}
            </span>
            <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">
              {volume.title}
            </h3>
            <p className="text-sm text-charcoal/60 dark:text-gray-400">
              du chapitre "{chapterTitle}"
            </p>
          </div>

          {/* Wait to Read Option - Show if not active yet */}
          {!hasActiveWait && volume.canStartWait && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 dark:border-emerald-400/40 relative overflow-hidden shadow-lg shadow-emerald-500/10">
              {/* Animated background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 dark:bg-teal-400/5 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/20 dark:bg-emerald-400/20">
                    <span className="material-symbols-outlined text-2xl text-emerald-600 dark:text-emerald-400">
                      timer
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-charcoal dark:text-white">
                      Attendre pour lire
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                      100% Gratuit
                    </p>
                  </div>
                </div>

                <p className="text-sm text-charcoal/70 dark:text-gray-300 mb-4">
                  Activez un compte à rebours de 24h et accédez gratuitement à
                  ce volume. Vous recevrez une notification quand il sera
                  disponible.
                </p>

                {reachedWaitLimit ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 dark:border-red-500/40 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg mt-0.5">
                        error
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                          Limite atteinte
                        </p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80">
                          Vous avez {maxWaitsAllowed} comptes à rebours actifs.
                          Veuillez attendre qu'un timer se termine pour en
                          démarrer un nouveau.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartWait}
                    disabled={isStartingWait || !canStartWait}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 mb-4">
                    <span className="material-symbols-outlined">
                      {isStartingWait ? "hourglass_empty" : "timer"}
                    </span>
                    {isStartingWait
                      ? "Démarrage..."
                      : "Démarrer le compte à rebours"}
                  </button>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">
                      schedule
                    </span>
                    <span className="text-xs text-charcoal/70 dark:text-gray-300">
                      Timers actifs
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {activeWaitsCount} / {maxWaitsAllowed}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Option 1: Single Volume */}
          <div className="p-6 rounded-xl bg-surface-light dark:bg-gray-800 border border-border-warm dark:border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-5xl text-charcoal/30 dark:text-white/30">
                auto_stories
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold dark:text-gold mb-3 block">
              Option 1 : Volume Unique
            </span>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-charcoal dark:text-white">
                  {String(volume.volumeNumber).padStart(2, "0")}. {volume.title}
                </h3>
                <p className="text-sm text-charcoal/40 dark:text-gray-500 mt-1">
                  Déblocage immédiat du récit
                </p>
              </div>
              <div className="text-2xl font-display font-bold text-accent-gold dark:text-gold">
                {(getVolumePriceByNumber(volume.volumeNumber) / 100).toFixed(2)}
                €
              </div>
            </div>
            <button
              type="button"
              onClick={onPurchaseVolume}
              className="w-full mt-4 py-4 bg-white/50 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10 border border-border-warm dark:border-white/10 hover:border-primary/50 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-charcoal dark:text-white">
              <span className="material-symbols-outlined">shopping_cart</span>
              Acheter ce volume
            </button>
          </div>

          {/* Option 2: Full Chapter Bundle */}
          {chapter.pricing?.bundleDiscountedPrice && (
            <div className="p-6 rounded-xl relative overflow-hidden ring-1 transition-all bg-primary/10 dark:bg-primary/5 border border-primary/30 dark:border-primary/40 ring-primary/20 hover:ring-primary/40">
              <div className="absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full bg-primary/20 dark:bg-primary/10"></div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 text-background-dark dark:text-gray-900 text-[9px] font-black rounded-sm uppercase tracking-wider bg-accent-gold dark:bg-gold">
                  Offre Privilège
                </span>
              </div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-xl font-display italic font-bold text-charcoal dark:text-white">
                    L'Intégrale du Chapitre
                  </h3>
                  <p className="text-sm text-charcoal/60 dark:text-gray-400 mt-1 italic">
                  Tous les volumes accessibles  {/*  + Économisez 25% */}
                  </p>
                </div>
                <div className="text-3xl font-display font-bold text-charcoal dark:text-white">
                  {chapter.pricing.bundleDiscountedPrice
                    ? (chapter.pricing.bundleDiscountedPrice / 100).toFixed(2)
                    : "0.00"}
                  €
                </div>
              </div>
              <button
                type="button"
                onClick={onPurchaseChapter}
                className="w-full mt-6 py-4 text-white rounded-lg font-bold transition-all shadow-xl flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-primary/20">
                <span className="material-symbols-outlined text-xl">
                  auto_awesome
                </span>
                Débloquer le chapitre entier
              </button>
            </div>
          )}

          {/* Le Club Privé - Coming Soon */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 dark:border-purple-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 dark:bg-purple-400/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/10 dark:bg-rose-400/5 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-purple-500 dark:text-purple-400">
                    workspace_premium
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 text-[9px] font-black rounded-full uppercase tracking-wider border border-purple-500/30">
                    Bientôt
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-display italic font-bold text-charcoal dark:text-white mb-2">
                Le Club Privé
              </h3>
              <p className="text-sm text-charcoal/70 dark:text-gray-300 mb-4">
                Accès illimité à toute la bibliothèque. Tous les chapitres, tous
                les volumes, toutes les perspectives.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 text-lg mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-charcoal/60 dark:text-gray-400">
                    Lecture illimitée de tous les contenus
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 text-lg mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-charcoal/60 dark:text-gray-400">
                    Accès anticipé aux nouveaux chapitres
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 text-lg mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-charcoal/60 dark:text-gray-400">
                    Contenus exclusifs et bonus
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 text-lg mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-charcoal/60 dark:text-gray-400">
                    Sans engagement, résiliable à tout moment
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 opacity-60 cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">
                  notifications_active
                </span>
                Me prévenir du lancement
              </button>

              <p className="text-xs text-charcoal/50 dark:text-gray-500 italic mt-3 text-center">
                En préparation • Lancement prévu prochainement
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="pt-6 border-t border-border-warm dark:border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 dark:text-gray-500 mb-6 text-center">
              Paiement Sécurisé
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border-warm dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                <span className="material-symbols-outlined text-accent-gold dark:text-gold text-3xl">
                  credit_card
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/60 dark:text-gray-400">
                  Cartes
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border-warm dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                <span className="material-symbols-outlined text-accent-gold dark:text-gold text-3xl">
                  contactless
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal/60 dark:text-gray-400">
                  Apple Pay
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 text-center border-t border-border-warm dark:border-white/5">
          <p className="text-[10px] text-charcoal/30 dark:text-gray-600 uppercase tracking-[0.1em]">
            Transaction cryptée SSL par Stripe
            <br />
            Accès instantané après validation.
          </p>
        </div>
      </div>
    </>
  );
}
