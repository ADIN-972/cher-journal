import type { PriceScope, PromotionType } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";

export interface PromotionOverallData {
  name: string;
  description?: string;
  scope: PriceScope;
  refId?: string;
  type: PromotionType;
  value?: number;
  startsAt: string;
  endsAt: string;
  maxUses?: number;
  perUserLimit?: number;
  isActive: boolean;
  code?: string;
  priceId?: string;
}

interface PromotionOverallImpactProps {
  promotion: PromotionOverallData;
}

function PromotionOverallImpact({ promotion }: PromotionOverallImpactProps) {
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getScopeLabel = (scope: PriceScope) => {
    const labels: Record<PriceScope, string> = {
      VOLUME: t("promotions.scopes.VOLUME", "Volume"),
      CHAPTER: t("promotions.scopes.CHAPTER", "Chapitre"),
      EPILOGUE: t("promotions.scopes.EPILOGUE", "Épilogue"),
      POV: t("promotions.scopes.POV", "Perspective"),
      COLORING: t("promotions.scopes.COLORING", "Coloriage"),
      BUNDLE: t("promotions.scopes.BUNDLE", "Bundle"),
      SUBSCRIPTION: t("promotions.scopes.SUBSCRIPTION", "Abonnement"),
    };
    return labels[scope];
  };

  return (
    <div className="mt-4 p-3 bg-blue-50 border border-l-8 border-blue-400 rounded-lg text-xs text-blue-800">
      <p>
        {t("promotions.form.summary_intro", undefined, {
          scope: getScopeLabel(promotion.scope),
        }) || `Cette promotion s'applique à ${getScopeLabel(promotion.scope)}`}{" "}
        <strong>
          {promotion.type === "FREE"
            ? t("promotions.form.free_access", "avec accès gratuit")
            : promotion.type === "PERCENT"
              ? t("promotions.form.reduction_percent", undefined, {
                  value: promotion.value ?? 0,
                }) || `-${promotion.value ?? 0}%`
              : t("promotions.form.reduction_amount", undefined, {
                  value: `${((promotion.value || 0) / 100).toFixed(2)}€`,
                }) || `-${((promotion.value || 0) / 100).toFixed(2)}€`}
        </strong>
        {promotion.maxUses || promotion.perUserLimit ? (
          <>
            {" "}
            {t("promotions.form.summary_for", undefined, {
              audience: promotion.perUserLimit
                ? t("promotions.form.max_clients", undefined, {
                    value: promotion.perUserLimit,
                  }) || `maximum ${promotion.perUserLimit} fois par client`
                : t("promotions.form.unlimited_clients", "sans limite par client"),
            }) || "pour"}
            {promotion.maxUses && (
              <>
                {" "}
                {t("promotions.form.summary_total_uses", undefined, {
                  value: promotion.maxUses,
                }) || `(${promotion.maxUses} utilisations maximum au total)`}
              </>
            )}
          </>
        ) : (
          <> {t("promotions.form.all_clients", "pour tous les clients")} </>
        )}{" "}
        {t("promotions.form.summary_period", undefined, {
          start: formatDate(promotion.startsAt),
          end: formatDate(promotion.endsAt),
        }) || `du ${formatDate(promotion.startsAt)} au ${formatDate(promotion.endsAt)}`}
      </p>
    </div>
  );
}

export default PromotionOverallImpact;
