import { useState, useEffect } from "react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { MdPeople, MdTrendingUp, MdRefresh } from "react-icons/md";

interface PromotionCriteria {
  minOrders?: number;
  maxOrders?: number;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  registeredAfter?: string;
  registeredBefore?: string;
  hasOrderType?: string[];
  roles?: ("USER" | "ADMIN")[];
}

interface TargetingPreview {
  targetType: "ALL_USERS" | "SPECIFIC_USERS" | "CRITERIA_BASED";
  targetUserIds?: string[];
  targetCriteria?: PromotionCriteria;
}

interface TargetingSelectorProps {
  value: TargetingPreview;
  onChange: (value: TargetingPreview) => void;
}

export default function TargetingSelector({
  value,
  onChange,
}: TargetingSelectorProps) {
  const [targetedCount, setTargetedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate targeted users count when criteria change
  useEffect(() => {
    calculateTargetedCount();
  }, [value]);

  const calculateTargetedCount = async () => {
    try {
      setLoading(true);
      const response = await api.post("/admin/promotions/preview-targeting", value);
      setTargetedCount(response.data.targetedUsersCount);
    } catch (error) {
      console.error("Failed to calculate targeted count:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetTypeChange = (targetType: TargetingPreview["targetType"]) => {
    onChange({
      ...value,
      targetType,
      targetUserIds: targetType === "SPECIFIC_USERS" ? value.targetUserIds || [] : undefined,
      targetCriteria: targetType === "CRITERIA_BASED" ? value.targetCriteria || {} : undefined,
    });
  };

  const handleCriteriaChange = (
    key: keyof PromotionCriteria,
    criteriaValue: any
  ) => {
    onChange({
      ...value,
      targetCriteria: {
        ...value.targetCriteria,
        [key]: criteriaValue,
      },
    });
  };

  const clearCriteria = () => {
    onChange({
      ...value,
      targetCriteria: {},
    });
  };

  return (
    <div className="space-y-4">
      {/* Target Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de ciblage
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleTargetTypeChange("ALL_USERS")}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              value.targetType === "ALL_USERS"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 hover:border-gray-300"
            }`}>
            <MdPeople className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Tous les utilisateurs</div>
          </button>

          <button
            type="button"
            onClick={() => handleTargetTypeChange("SPECIFIC_USERS")}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              value.targetType === "SPECIFIC_USERS"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 hover:border-gray-300"
            }`}>
            <MdPeople className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Utilisateurs spécifiques</div>
          </button>

          <button
            type="button"
            onClick={() => handleTargetTypeChange("CRITERIA_BASED")}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              value.targetType === "CRITERIA_BASED"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 hover:border-gray-300"
            }`}>
            <MdTrendingUp className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Critères avancés</div>
          </button>
        </div>
      </div>

      {/* Specific Users Input */}
      {value.targetType === "SPECIFIC_USERS" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emails des utilisateurs (un par ligne)
          </label>
          <textarea
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="user1@example.com&#10;user2@example.com"
            value={value.targetUserIds?.join("\n") || ""}
            onChange={(e) => {
              const emails = e.target.value
                .split("\n")
                .map((email) => email.trim())
                .filter((email) => email.length > 0);
              onChange({
                ...value,
                targetUserIds: emails,
              });
            }}
            onKeyDown={(e) => {
              // Allow Enter to create a new line, don't submit form
              if (e.key === "Enter") {
                e.stopPropagation();
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Entrez les emails des utilisateurs ciblés, un par ligne
          </p>
        </div>
      )}

      {/* Criteria-Based Targeting */}
      {value.targetType === "CRITERIA_BASED" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Critères de ciblage
            </h3>
            <button
              type="button"
              onClick={clearCriteria}
              className="text-xs text-gray-600 hover:text-gray-900 underline">
              Réinitialiser
            </button>
          </div>

          {/* Number of Orders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Commandes minimum
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={value.targetCriteria?.minOrders || ""}
                onChange={(e) =>
                  handleCriteriaChange(
                    "minOrders",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Commandes maximum
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Illimité"
                value={value.targetCriteria?.maxOrders || ""}
                onChange={(e) =>
                  handleCriteriaChange(
                    "maxOrders",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>

          {/* Total Spent */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Montant dépensé min (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                value={
                  value.targetCriteria?.minTotalSpent
                    ? (value.targetCriteria.minTotalSpent / 100).toFixed(2)
                    : ""
                }
                onChange={(e) =>
                  handleCriteriaChange(
                    "minTotalSpent",
                    e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined
                  )
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Montant dépensé max (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Illimité"
                value={
                  value.targetCriteria?.maxTotalSpent
                    ? (value.targetCriteria.maxTotalSpent / 100).toFixed(2)
                    : ""
                }
                onChange={(e) =>
                  handleCriteriaChange(
                    "maxTotalSpent",
                    e.target.value
                      ? Math.round(parseFloat(e.target.value) * 100)
                      : undefined
                  )
                }
              />
            </div>
          </div>

          {/* Registration Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Inscrit après
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={value.targetCriteria?.registeredAfter || ""}
                onChange={(e) =>
                  handleCriteriaChange("registeredAfter", e.target.value || undefined)
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Inscrit avant
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={value.targetCriteria?.registeredBefore || ""}
                onChange={(e) =>
                  handleCriteriaChange("registeredBefore", e.target.value || undefined)
                }
              />
            </div>
          </div>

          {/* Order Types */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Types de commandes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["CHAPTER", "PREORDER", "BUNDLE", "COLORING"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      value.targetCriteria?.hasOrderType?.includes(type) || false
                    }
                    onChange={(e) => {
                      const current = value.targetCriteria?.hasOrderType || [];
                      const updated = e.target.checked
                        ? [...current, type]
                        : current.filter((t) => t !== type);
                      handleCriteriaChange("hasOrderType", updated);
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Targeted Count Display */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-indigo-900">
              Utilisateurs ciblés
            </div>
            {loading ? (
              <div className="text-xs text-indigo-600 mt-1">
                Calcul en cours...
              </div>
            ) : (
              <div className="text-2xl font-bold text-indigo-700 mt-1">
                {targetedCount !== null ? targetedCount.toLocaleString() : "-"}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={calculateTargetedCount}
            disabled={loading}
            className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50">
            <MdRefresh
              className={`w-5 h-5 text-indigo-700 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="text-xs text-indigo-600 mt-2">
          {value.targetType === "ALL_USERS" && "Tous les utilisateurs actifs"}
          {value.targetType === "SPECIFIC_USERS" &&
            `${value.targetUserIds?.length || 0} email(s) spécifié(s)`}
          {value.targetType === "CRITERIA_BASED" && "Basé sur les critères définis"}
        </div>
      </div>
    </div>
  );
}
