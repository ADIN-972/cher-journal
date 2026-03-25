import { useState, useEffect } from "react";
import { api } from "../lib/api";

export const CLUB_FEATURES = [
  { icon: "auto_stories", text: "Tous les chapitres Narrateur en accès immédiat" },
  { icon: "timer_off", text: "Plus de timer d'attente" },
  { icon: "loyalty", textFn: (d: number) => `-${d}% sur la perspective Protagoniste` },
  { icon: "new_releases", text: "Nouveautés en avant-première" },
  { icon: "palette", text: "Galerie de coloriage exclusive" },
  { icon: "download", text: "Téléchargement pour lecture hors-ligne" },
  { icon: "block", text: "Sans publicité" },
];

const COMPARISON = [
  { label: "Chapitres gratuits", free: true, club: true },
  { label: "Accès immédiat (sans timer)", free: false, club: true },
  { label: "Chapitres premium", free: false, club: true },
  { label: "Avant-premières", free: false, club: true },
  { label: "Coloriages", free: false, club: true },
];

interface ClubPriveTeaserProps {
  /** Show the comparison table below the card */
  showComparison?: boolean;
  /** Show the "no subscription" status card above */
  showStatus?: boolean;
  /** Compact mode for embedding in drawers */
  compact?: boolean;
  /** Custom CTA label */
  ctaLabel?: string;
  /** Called when user clicks subscribe */
  onSubscribe?: () => void;
}

export default function ClubPriveTeaser({
  showComparison = true,
  showStatus = false,
  compact = false,
  ctaLabel,
  onSubscribe,
}: ClubPriveTeaserProps) {
  const [clubInfo, setClubInfo] = useState<{ priceCents: number; discountPercent: number } | null>(null);

  useEffect(() => {
    api.getClubInfo().then(setClubInfo).catch(() => {});
  }, []);

  const discountPercent = clubInfo?.discountPercent ?? 0;
  const formatPrice = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

  const handleSubscribe = async () => {
    if (onSubscribe) {
      onSubscribe();
      return;
    }
    try {
      const successUrl = `${window.location.origin}/account/subscription?success=1`;
      const cancelUrl = `${window.location.origin}/account/subscription`;
      const session = await api.createSubscriptionCheckout(successUrl, cancelUrl);
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      console.error("Failed to create subscription checkout:", err);
    }
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-8"}>
      {/* Status card */}
      {showStatus && (
        <div className="bg-white dark:bg-boudoir-900/30 rounded-2xl border border-boudoir-200 dark:border-boudoir-800 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-[#c5a059]/30 mb-3 block">
            card_membership
          </span>
          <p className="text-charcoal dark:text-white/70 italic">
            Vous n'avez pas d'abonnement actif
          </p>
        </div>
      )}

      {/* Club Privé Card */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 dark:border-purple-400/30 bg-gradient-to-br from-[#1A0A14] to-[#0D0509]">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-500/15 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-rose-500/10 blur-3xl"></div>

        <div className={`relative z-10 ${compact ? "p-6" : "p-8 md:p-10"}`}>
          {/* Header */}
          <h3 className={`${compact ? "text-2xl" : "text-3xl md:text-4xl"} font-display italic text-white mb-5`}>
            <span className={`material-symbols-outlined ${compact ? "text-3xl" : "text-4xl"} text-purple-400 mr-3`}>
              workspace_premium
            </span>
            Le Club Privé
          </h3>

          <p className={`text-white/60 leading-relaxed ${compact ? "mb-4 text-sm" : "mb-8"} max-w-xl`}>
            Accès illimité à tous les chapitres en perspective Narrateur.
            Accès immédiat, sans attente.
            {discountPercent > 0 && ` -${discountPercent}% sur la perspective Protagoniste.`}
          </p>

          {/* Features */}
          <div className={`grid grid-cols-1 ${compact ? "gap-2 mb-4" : "md:grid-cols-2 gap-3 mb-8"}`}>
            {CLUB_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg mt-0.5">
                  check_circle
                </span>
                <span className={`text-white/70 ${compact ? "text-xs" : "text-sm"}`}>
                  {"textFn" in f ? f.textFn(discountPercent) : f.text}
                </span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className={`text-center ${compact ? "py-4" : "py-6"} border-t border-purple-500/20`}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
              À partir de
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`${compact ? "text-3xl" : "text-5xl"} font-bold text-white`}>
                {clubInfo ? formatPrice(clubInfo.priceCents) : "..."}
              </span>
              <span className="text-white/40 text-sm">/ mois</span>
            </div>
            <p className="text-white/30 text-xs mt-2">
              Sans engagement, résiliable à tout moment
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleSubscribe}
            className={`w-full ${compact ? "py-3" : "py-4"} bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30 mt-4`}
          >
            <span className="material-symbols-outlined">
              notifications_active
            </span>
            {ctaLabel || "Me prévenir du lancement"}
          </button>

          <p className="text-white/30 text-xs italic mt-4 text-center">
            En préparation — Lancement prévu prochainement
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div>
          <h3 className="text-xl font-display italic text-charcoal dark:text-white mb-4">
            Gratuit vs Club Privé
          </h3>
          <div className="bg-white dark:bg-boudoir-900/30 rounded-2xl border border-boudoir-200 dark:border-boudoir-800 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_80px] px-6 py-3 border-b border-boudoir-200 dark:border-boudoir-800 bg-boudoir-50 dark:bg-boudoir-900/50">
              <span></span>
              <span className="text-xs font-semibold text-charcoal/50 dark:text-white/40 uppercase tracking-wider text-center">
                Gratuit
              </span>
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider text-center">
                Club
              </span>
            </div>

            {COMPARISON.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_80px_80px] px-6 py-4 ${
                  i < COMPARISON.length - 1 ? "border-b border-boudoir-100 dark:border-boudoir-800/50" : ""
                }`}
              >
                <span className="text-sm text-charcoal dark:text-white/80">{row.label}</span>
                <span className="flex justify-center">
                  <span className={`material-symbols-outlined text-lg ${row.free ? "text-green-500" : "text-gray-300 dark:text-gray-600"}`}>
                    {row.free ? "check" : "close"}
                  </span>
                </span>
                <span className="flex justify-center">
                  <span className={`material-symbols-outlined text-lg ${row.club ? "text-purple-500" : "text-gray-300 dark:text-gray-600"}`}>
                    {row.club ? "check" : "close"}
                  </span>
                </span>
              </div>
            ))}

            {/* Protagonist row with discount */}
            <div className="grid grid-cols-[1fr_80px_80px] px-6 py-4">
              <span className="text-sm text-charcoal dark:text-white/80">Vue Protagoniste</span>
              <span className="flex justify-center">
                <span className="material-symbols-outlined text-lg text-gray-300 dark:text-gray-600">close</span>
              </span>
              <span className="flex justify-center">
                <span className="text-xs font-bold text-purple-500">-{discountPercent}%</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
