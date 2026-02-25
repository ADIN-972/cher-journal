import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { MdHistory, MdTrendingUp, MdTrendingDown, MdRefresh } from "react-icons/md";

interface PriceChange {
  id: string;
  priceId: string;
  oldAmountCents: number;
  newAmountCents: number;
  currency: string;
  changedAt: string;
  changedBy?: string;
  reason?: string;
  price: {
    id: string;
    scope: string;
    refId?: string;
    amountCents: number;
  };
}

interface PriceHistoryData {
  items: PriceChange[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PriceHistoryPage() {
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  const [history, setHistory] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    priceId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadHistory();
  }, [currentPage, filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (filter.priceId) params.append("priceId", filter.priceId);
      if (filter.startDate) params.append("startDate", filter.startDate);
      if (filter.endDate) params.append("endDate", filter.endDate);

      const res = await api.get(`/admin/price-history?${params.toString()}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to load price history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number, currency: string = "EUR") => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const getPriceChangePercentage = (oldPrice: number, newPrice: number) => {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      VOLUME: "Tome",
      CHAPTER: "Chapitre",
      EPILOGUE: "Épilogue",
      POV_CHAPTER: "POV Chapitre",
      POV_VOLUME: "POV Volume",
      BUNDLE: "Pack",
      COLORING: "Coloriage",
      SUBSCRIPTION: "Abonnement",
    };
    return labels[scope] || scope;
  };

  if (loading && !history) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MdHistory className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Historique des prix
          </h1>
        </div>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <MdRefresh className="w-5 h-5" />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Prix (optionnel)
            </label>
            <input
              type="text"
              value={filter.priceId}
              onChange={(e) =>
                setFilter({ ...filter, priceId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="uuid..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) =>
                setFilter({ ...filter, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) =>
                setFilter({ ...filter, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg shadow-sm">
        {history && history.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MdHistory className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun changement de prix</p>
            <p className="text-sm mt-2">
              L'historique des modifications de prix apparaîtra ici
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#4d252f]">
            {history?.items.map((change) => {
              const diff = change.newAmountCents - change.oldAmountCents;
              const percentage = getPriceChangePercentage(
                change.oldAmountCents,
                change.newAmountCents
              );
              const isIncrease = diff > 0;

              return (
                <div
                  key={change.id}
                  className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-full ${
                            isIncrease ? "bg-green-100" : "bg-red-100"
                          }`}>
                          {isIncrease ? (
                            <MdTrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <MdTrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getScopeLabel(change.price.scope)}
                            {change.price.refId && (
                              <span className="text-gray-500 text-sm ml-2">
                                (ID: {change.price.refId.substring(0, 8)}...)
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(change.changedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="ml-12 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Ancien prix:
                          </span>
                          <span className="font-medium line-through text-gray-500">
                            {formatPrice(change.oldAmountCents, change.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Nouveau prix:
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(change.newAmountCents, change.currency)}
                          </span>
                        </div>
                        {change.reason && (
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              Raison:
                            </span>
                            <span className="text-sm text-gray-700">
                              {change.reason}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          isIncrease
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {isIncrease ? "+" : ""}
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {formatPrice(Math.abs(diff), change.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {history && history.pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {history.pagination.page} sur{" "}
              {history.pagination.totalPages} ({history.pagination.total}{" "}
              changements)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Précédent
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(history.pagination.totalPages, p + 1)
                  )
                }
                disabled={currentPage === history.pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
