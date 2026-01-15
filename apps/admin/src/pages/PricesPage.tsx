import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import type { PriceScope } from "@cher-journal/types";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";

interface Price {
  id: string;
  scope: PriceScope;
  refId?: string;
  amountCents: number;
  currency: string;
  promotions?: any[];
}

export function PricesPage() {
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<PriceScope | "ALL">("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPrices();
  }, [scopeFilter]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (scopeFilter !== "ALL") params.scope = scopeFilter;

      const res = await api.get("/admin/prices", { params });
      setPrices(res.data.data || []);
    } catch (error) {
      console.error("Failed to load prices:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePrice = async (id: string) => {
    if (!confirm(t("prices.confirm_delete"))) return;

    try {
      await api.delete(`/admin/prices/${id}`);
      loadPrices();
    } catch (error) {
      console.error("Failed to delete price:", error);
    }
  };

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const getScopeLabel = (scope: PriceScope) => {
    const labels: Record<PriceScope, string> = {
      VOLUME: t("prices.scope.volume"),
      CHAPTER: t("prices.scope.chapter"),
      EPILOGUE: t("prices.scope.epilogue"),
      POV: t("prices.scope.pov"),
      COLORING: t("prices.scope.coloring"),
      BUNDLE: t("prices.scope.bundle"),
      SUBSCRIPTION: t("prices.scope.subscription"),
    };
    return labels[scope];
  };

  const scopes: Array<PriceScope | "ALL"> = [
    "ALL",
    "VOLUME",
    "CHAPTER",
    "EPILOGUE",
    "POV",
    "COLORING",
    "BUNDLE",
    "SUBSCRIPTION",
  ];

  // Group prices by scope
  const pricesByScope = prices.reduce(
    (acc, price) => {
      if (!acc[price.scope]) {
        acc[price.scope] = [];
      }
      acc[price.scope].push(price);
      return acc;
    },
    {} as Record<PriceScope, Price[]>
  );

  const filteredScopes =
    scopeFilter === "ALL"
      ? (Object.keys(pricesByScope) as PriceScope[])
      : [scopeFilter];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("prices.title")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t("prices.subtitle")}</p>
        </div>
        <button
          onClick={() => {
            // TODO: Navigate to price form or open modal
            console.log("Create new price");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
          <MdAdd className="text-xl" />
          {t("prices.new_price")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("prices.filter_by_scope")}
        </label>
        <div className="flex flex-wrap gap-2">
          {scopes.map((scope) => (
            <button
              key={scope}
              onClick={() => setScopeFilter(scope)}
              className={`px-4 py-2 rounded-lg transition ${
                scopeFilter === scope
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {scope === "ALL"
                ? t("prices.all")
                : getScopeLabel(scope as PriceScope)}
            </button>
          ))}
        </div>
      </div>

      {/* Prices List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">{t("prices.no_prices")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScopes.map((scope) => (
            <div
              key={scope}
              className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Scope header */}
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getScopeLabel(scope)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t("prices.configured_count", undefined, {
                    count: String(pricesByScope[scope]?.length || 0),
                  })}
                </p>
              </div>

              {/* Prices in scope */}
              <div className="divide-y divide-gray-200">
                {pricesByScope[scope]?.map((price) => (
                  <div key={price.id}>
                    <div
                      onClick={() => toggleExpanded(price.id)}
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(price.amountCents)}
                        </p>
                        {price.refId && (
                          <p className="text-sm text-gray-500 mt-1">
                            {t("prices.reference")}: {price.refId}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          {t("prices.promos_count", undefined, {
                            count: String(price.promotions?.length || 0),
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit price - open modal or navigate
                            console.log("Edit price:", price.id);
                          }}
                          className="text-rose-600 hover:text-rose-900 p-2">
                          <MdEdit className="text-xl" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePrice(price.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-2">
                          <MdDelete className="text-xl" />
                        </button>
                        {expandedIds.has(price.id) ? (
                          <MdExpandLess className="text-xl text-gray-400" />
                        ) : (
                          <MdExpandMore className="text-xl text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Promotions for this price */}
                    {expandedIds.has(price.id) &&
                      price.promotions &&
                      price.promotions.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            {t("prices.linked_promotions")}
                          </p>
                          <div className="space-y-2">
                            {price.promotions.map((promo) => (
                              <div
                                key={promo.id}
                                className="p-3 bg-white rounded border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {promo.type === "FREE"
                                        ? t("prices.promo_type.free")
                                        : promo.type === "PERCENT"
                                          ? `-${promo.value}%`
                                          : `-${formatPrice(promo.value * 100)}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(
                                        promo.startsAt
                                      ).toLocaleDateString(locale)}{" "}
                                      →{" "}
                                      {new Date(
                                        promo.endsAt
                                      ).toLocaleDateString(locale)}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                      promo.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                    {promo.isActive
                                      ? t("prices.status.active")
                                      : t("prices.status.inactive")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
