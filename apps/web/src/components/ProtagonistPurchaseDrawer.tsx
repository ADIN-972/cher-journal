import { useEffect, useState } from "react";
import api from "../lib/api";
import PromotionBadge from "./PromotionBadge";
import { Chapter } from "../stores/catalogStore";

interface PromotionInfo {
  type: 'PERCENT' | 'FIXED' | 'FREE';
  value?: number;
  discountAmount?: number; // in cents (for display purposes)
}

interface ProtagonistPurchaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  volume: {
    id: string;
    volumeNumber: number;
    title: string;
  };
  chapter: Chapter;
  chapterTitle: string;
  volumePromotion?: PromotionInfo;
  bundlePromotion?: PromotionInfo;
  onPurchaseVolume: () => void;
  onPurchaseChapter: () => void;
}

export default function ProtagonistPurchaseDrawer({
  isOpen,
  onClose,
  volume,
  chapter,
  chapterTitle,
  volumePromotion,
  bundlePromotion,
  onPurchaseVolume,
  onPurchaseChapter,
}: ProtagonistPurchaseDrawerProps) {
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

  const [clubInfo, setClubInfo] = useState<{ priceCents: number; discountPercent: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getClubInfo().then(setClubInfo).catch(() => {});
    }
  }, [isOpen]);

  const bundleDiscountPercent = clubInfo?.discountPercent ?? 0;

  if (!isOpen) return null;

  // Get PROTAGONIST perspective unlock price
  const getProtagonistVolumePrice = () => {
    return chapter.pricing?.priceProtagonistUnlock ?? 99; // Default to 0,99€
  };

  // Calculate total price for all volumes in PROTAGONIST perspective
  const calculateProtagenistBundlePrice = () => {
    if (!chapter.volumes) return 0;
    const perspectiveKey = "PROTAGONIST";
    const protagonistPrice = getProtagonistVolumePrice();
    let totalPrice = 0;

    chapter.volumes.forEach((vol) => {
      const perspectiveAccess = vol.accessByPerspective?.[perspectiveKey];
      // Only count volumes not yet accessible for PROTAGONIST
      if (!perspectiveAccess?.isAccessible) {
        totalPrice += protagonistPrice;
      }
    });

    // Apply bundle discount from config
    return Math.round(totalPrice * (1 - bundleDiscountPercent / 100));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 dark:bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-background-light dark:bg-gray-900 z-[70] shadow-2xl border-l border-rose-500/20 dark:border-rose-400/10 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-rose-500/20 dark:border-rose-400/10 bg-gradient-to-r from-rose-500/5 to-pink-500/5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display italic font-bold text-charcoal dark:text-white">
              Point de vue de la Protagoniste
            </h2>
            <p className="text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold mt-1">
              Déblocage immédiat
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="material-symbols-outlined text-charcoal/40 dark:text-gray-400 hover:text-charcoal dark:hover:text-white transition-colors text-3xl">
            close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 space-y-6">
          {/* Volume Information Card */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/30 dark:border-rose-400/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-400/5 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 mb-3 block">
                Volume {volume.volumeNumber}
              </span>
              <h3 className="text-2xl font-bold text-charcoal dark:text-white mb-2">
                {volume.title}
              </h3>
              <p className="text-sm text-charcoal/60 dark:text-gray-400">
                du chapitre "{chapterTitle}"
              </p>
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-3 italic">
                Accès au point de vue exclusif de la protagoniste
              </p>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            {/* Option 1: Single Volume */}
            <div className="p-6 rounded-xl bg-surface-light dark:bg-gray-800 border-2 border-rose-500/30 dark:border-rose-400/20 relative overflow-hidden group hover:border-rose-500/50 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-5xl text-rose-500 dark:text-rose-400">
                  favorite
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 mb-3 block">
                  Volume Unique
                </span>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-charcoal dark:text-white">
                      {String(volume.volumeNumber).padStart(2, "0")}. {volume.title}
                    </h3>
                    <p className="text-sm text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                      Protagoniste
                    </p>
                  </div>
                  <div className="relative">
                    {volumePromotion && (
                      <PromotionBadge
                        type={volumePromotion.type}
                        discountPercentage={volumePromotion.type === 'PERCENT' ? volumePromotion.value : undefined}
                        discountAmount={volumePromotion.type === 'FIXED' ? volumePromotion.discountAmount : undefined}
                        size="medium"
                      />
                    )}
                    <div className="text-3xl font-display font-bold text-rose-600 dark:text-rose-400">
                      {(getProtagonistVolumePrice() / 100).toFixed(2)}
                      <span className="text-lg">€</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onPurchaseVolume}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Débloquer ce volume
                </button>
              </div>
            </div>

            {/* Option 2: Full Chapter Bundle */}
            {calculateProtagenistBundlePrice() > 0 && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-rose-900/20 to-pink-900/10 border-2 border-rose-500/50 dark:border-rose-400/40 ring-1 ring-rose-500/20 relative overflow-hidden group hover:ring-rose-500/40 transition-all">
                <div className="absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full bg-rose-500/20 dark:bg-rose-500/10"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-black rounded-sm uppercase tracking-wider">
                      Offre Complète
                    </span>
                    <span className="text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 px-2 py-1 rounded font-semibold">
                      Économisez {bundleDiscountPercent}%
                    </span>
                  </div>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-xl font-display italic font-bold text-charcoal dark:text-white">
                        Tous les volumes
                      </h3>
                      <p className="text-sm text-charcoal/60 dark:text-gray-400 mt-1">
                        Accès complet au point de vue de la protagoniste
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="relative inline-block">
                        {bundlePromotion && (
                          <PromotionBadge
                            type={bundlePromotion.type}
                            discountPercentage={bundlePromotion.type === 'PERCENT' ? bundlePromotion.value : undefined}
                            discountAmount={bundlePromotion.type === 'FIXED' ? bundlePromotion.discountAmount : undefined}
                            size="medium"
                          />
                        )}
                        <div className="text-3xl font-display font-bold text-rose-600 dark:text-rose-400">
                          {(calculateProtagenistBundlePrice() / 100).toFixed(2)}
                          <span className="text-lg">€</span>
                        </div>
                      </div>
                      <p className="text-xs text-charcoal/50 dark:text-gray-500 mt-1 line-through">
                        {(
                          (getProtagonistVolumePrice() *
                            (chapter.volumes?.length || 0)) /
                          100
                        ).toFixed(2)}
                        €
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onPurchaseChapter}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 hover:shadow-rose-600/60">
                    <span className="material-symbols-outlined text-xl">
                      auto_awesome
                    </span>
                    Débloquer tous les volumes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-lg mt-0.5 flex-shrink-0">
                info
              </span>
              <div>
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">
                  Point de vue exclusif
                </p>
                <p className="text-xs text-charcoal/70 dark:text-gray-300">
                  Accédez à l'histoire depuis le point de vue intime et personnel
                  de la protagoniste. Une perspective unique et captivante.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 mb-3">
              Ce que vous obtenez :
            </p>
            {[
              "Accès immédiat au contenu",
              "Point de vue de la protagoniste",
              "Accès à vie au volume",
              "Lecture sans limite",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 dark:text-rose-400 text-sm">
                  check_circle
                </span>
                <span className="text-sm text-charcoal/70 dark:text-gray-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 text-center border-t border-rose-500/20 dark:border-rose-400/10 bg-gradient-to-r from-rose-500/5 to-pink-500/5">
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
