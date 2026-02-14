import type { PriceScope, PromotionType } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import { MdCardGiftcard, MdPercent, MdAttachMoney, MdCalendarToday, MdPeople, MdRepeat, MdPublic } from "react-icons/md";

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
  targetType?: string;
  targetedUsersCount?: number;
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

  const getTypeColor = () => {
    switch (promotion.type) {
      case "FREE":
        return "bg-purple-50 border-purple-400 text-purple-900";
      case "PERCENT":
        return "bg-blue-50 border-blue-400 text-blue-900";
      case "FIXED":
        return "bg-green-50 border-green-400 text-green-900";
      default:
        return "bg-gray-50 border-gray-400 text-gray-900";
    }
  };

  const getTypeIcon = () => {
    switch (promotion.type) {
      case "FREE":
        return <MdCardGiftcard size={16} className="inline mr-1" />;
      case "PERCENT":
        return <MdPercent size={16} className="inline mr-1" />;
      case "FIXED":
        return <MdAttachMoney size={16} className="inline mr-1" />;
      default:
        return null;
    }
  };

  const getReductionText = () => {
    if (promotion.type === "FREE") {
      return "Accès gratuit complet";
    } else if (promotion.type === "PERCENT") {
      return `-${promotion.value ?? 0}%`;
    } else {
      return `-${((promotion.value || 0) / 100).toFixed(2)}€`;
    }
  };

  const getTargetLabel = (targetType?: string) => {
    switch (targetType) {
      case "ALL_USERS":
        return "Tous les utilisateurs";
      case "SPECIFIC_USERS":
        return "Utilisateurs spécifiques";
      case "CRITERIA_BASED":
        return "Basé sur critères";
      default:
        return "Tous les utilisateurs";
    }
  };

  return (
    <div className={`h-full p-4 border border-l-8 rounded-lg text-sm space-y-3 ${getTypeColor()}`}>
      {/* Main reduction info */}
      <div className="font-semibold ">
        {getTypeIcon()}
        <strong>{getReductionText()}</strong> sur {getScopeLabel(promotion.scope)}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs opacity-90">
        {/* Per-user limit */}
        {promotion.perUserLimit !== undefined && promotion.perUserLimit !== null && (
          <div className="flex items-center gap-1.5 col-span-2">
            <MdRepeat size={14} className="opacity-70" />
            <span>
              {promotion.perUserLimit === 0 ? (
                "Illimité par utilisateur"
              ) : (
                <>
                  <strong>{promotion.perUserLimit}x</strong> par utilisateur
                </>
              )}
            </span>
          </div>
        )}

        {/* Global limit */}
        {promotion.maxUses !== undefined && promotion.maxUses !== null && (
          <div className="flex items-center gap-1.5 col-span-2">
            <MdPeople size={14} className="opacity-70" />
            <span>
              {promotion.maxUses === 0 ? (
                "Utilisations illimitées"
              ) : (
                <>
                  <strong>{promotion.maxUses}</strong> utilisations total
                </>
              )}
            </span>
          </div>
        )}

        {/* If no limits specified */}
        {(promotion.maxUses === undefined || promotion.maxUses === null) &&
          (promotion.perUserLimit === undefined || promotion.perUserLimit === null) && (
            <div className="flex items-center gap-1.5 col-span-2">
              <MdPeople size={14} className="opacity-70" />
              <span>Illimité</span>
            </div>
          )}

        {/* Validity period */}
        <div className="flex items-center gap-1.5 col-span-2">
          <MdCalendarToday size={14} className="opacity-70" />
          <span>
            Du <strong>{formatDate(promotion.startsAt)}</strong> au{" "}
            <strong>{formatDate(promotion.endsAt)}</strong>
          </span>
        </div>

        {/* Targeting */}
        <div className="flex items-center gap-1.5 col-span-2">
          <MdPublic size={14} className="opacity-70" />
          <span>
            <strong>{getTargetLabel(promotion.targetType)}</strong>
            {promotion.targetedUsersCount !== undefined && (
              <> ({promotion.targetedUsersCount.toLocaleString()} personne{promotion.targetedUsersCount > 1 ? 's' : ''})</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PromotionOverallImpact;
