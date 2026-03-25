import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import ClubPriveTeaser, { CLUB_FEATURES } from "../ClubPriveTeaser";

interface SubscriptionData {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING" | "INCOMPLETE";
  planName: string;
  priceAmountCents: number;
  currency: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  ACTIVE: {
    label: "Actif",
    class:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  },
  PAST_DUE: {
    label: "En retard",
    class:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  },
  CANCELLED: {
    label: "Résilié",
    class: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  },
  TRIALING: {
    label: "Essai gratuit",
    class: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  },
  INCOMPLETE: {
    label: "Incomplet",
    class: "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300",
  },
};

export default function Subscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [clubInfo, setClubInfo] = useState<{
    priceCents: number;
    discountPercent: number;
  } | null>(null);

  useEffect(() => {
    fetchSubscription();
    api
      .getClubInfo()
      .then(setClubInfo)
      .catch(() => {});
  }, []);

  const discountPercent = clubInfo?.discountPercent ?? 0;

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getUserSubscription();
      setSubscription(data);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const successUrl = `${window.location.origin}/account/subscription?success=1`;
      const cancelUrl = `${window.location.origin}/account/subscription`;
      const session = await api.createSubscriptionCheckout(
        successUrl,
        cancelUrl,
      );
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (err) {
      console.error("Failed to create subscription checkout:", err);
      setError("Impossible de créer la session de paiement.");
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous garderez l'accès jusqu'à la fin de la période facturée.",
      )
    ) {
      return;
    }
    setIsCancelling(true);
    try {
      const updated = await api.cancelSubscription();
      setSubscription(updated);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      setError("Impossible de résilier votre abonnement.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (cents: number) =>
    `${(cents / 100).toFixed(2).replace(".", ",")} €`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div>
        <h2 className="text-3xl font-display italic text-[#c5a059] mb-6">
          Mon Abonnement
        </h2>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-2xl border border-red-300 dark:border-red-800 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">
            error
          </span>
          <p className="text-red-800 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchSubscription}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display italic text-[#c5a059] mb-2">
        Mon Abonnement
      </h2>
      <p className="text-charcoal dark:text-white/70 mb-8">
        Gérez votre abonnement et vos avantages.
      </p>

      {subscription ? (
        /* ─── Active Subscription ─── */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#c5a059]/10 to-[#c5a059]/5 dark:from-[#2d1620]/60 dark:to-[#2d1620]/40 rounded-2xl border border-[#c5a059]/30 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[#c5a059] text-3xl">
                    workspace_premium
                  </span>
                  <h3 className="text-2xl font-display italic text-charcoal dark:text-white">
                    Plan {subscription.planName}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[subscription.status]?.class || ""}`}>
                  {STATUS_CONFIG[subscription.status]?.label || "Inconnu"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#c5a059]">
                  {formatPrice(subscription.priceAmountCents)}
                </p>
                <p className="text-sm text-charcoal dark:text-white/70">
                  par mois
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {CLUB_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-lg">
                    {f.icon}
                  </span>
                  <span className="text-charcoal dark:text-white/70">
                    {"textFn" in f && f.textFn ? f.textFn(discountPercent) : f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Billing Info */}
            <div className="flex items-center gap-2 text-sm text-charcoal dark:text-white/70 mb-6">
              <span className="material-symbols-outlined text-base">
                calendar_today
              </span>
              <span>
                Prochain renouvellement le{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  "fr-FR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
            </div>

            {/* Cancel */}
            <button
              disabled={isCancelling}
              className="w-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 py-3 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCancel}>
              {isCancelling ? "Résiliation en cours..." : "Résilier"}
            </button>

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Votre abonnement sera résilié à la fin de la période facturée.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── No Subscription: Club Privé Teaser ─── */
        <ClubPriveTeaser showStatus showComparison onSubscribe={handleSubscribe} />
      )}
    </div>
  );
}
