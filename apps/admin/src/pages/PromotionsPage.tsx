import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Promotion, PriceScope, PromotionType } from "@cher-journal/types";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
  MdExpandMore,
  MdExpandLess,
  MdViewList,
  MdViewModule,
} from "react-icons/md";
import { useI18n } from "../lib/i18n";
import SegmentedToggle from "../components/SegmentedToggle";
import SmartTableGrid, { SmartTableColumn } from "../components/SmartTableGrid";
import { TableAction } from "../components/TableGrid";
import PromotionCard from "../components/PromotionCard";

interface PromotionWithStats extends Promotion {
  _count?: {
    applied: number;
  };
  targetedUsersCount?: number;
}

export function PromotionsPage() {
  const { t } = useI18n();
  const [promotions, setPromotions] = useState<PromotionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<PriceScope | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<boolean | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const navigate = useNavigate();

  useEffect(() => {
    loadPromotions();
  }, [scopeFilter, activeFilter]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (scopeFilter !== "ALL") params.scope = scopeFilter;
      if (activeFilter !== "ALL") params.isActive = activeFilter;

      const res = await api.get("/admin/promotions", { params });
      setPromotions(res.data.promotions || []);
    } catch (error) {
      console.error("Failed to load promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePromotion = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/promotions/${id}`, { isActive: !isActive });
      loadPromotions();
    } catch (error) {
      console.error("Failed to toggle promotion:", error);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Supprimer cette promotion ?")) return;

    try {
      await api.delete(`/admin/promotions/${id}`);
      loadPromotions();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const getScopeLabel = (scope: PriceScope) => {
    return t(`promotions.scopes.${scope}`);
  };

  const getTypeLabel = (type: PromotionType) => {
    return t(`promotions.types.${type}`);
  };

  const getTypeValue = (promo: Promotion) => {
    if (promo.type === "PERCENT") return `-${promo.value}%`;
    if (promo.type === "FIXED") return `-${formatPrice(promo.value || 0)}`;
    return "Gratuit";
  };

  const isActive = (promo: Promotion) => {
    if (!promo.isActive) return false;
    const now = new Date();
    return now >= new Date(promo.startsAt) && now <= new Date(promo.endsAt);
  };

  const columns: SmartTableColumn<PromotionWithStats>[] = useMemo(
    () => [
      {
        id: "scope",
        header: t("promotions.table.scope"),
        render: (promo) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            {getScopeLabel(promo.scope)}
          </span>
        ),
        defaultVisible: true,
      },
      {
        id: "type",
        header: t("promotions.table.type"),
        render: (promo) => getTypeLabel(promo.type),
        defaultVisible: true,
      },
      {
        id: "reduction",
        header: t("promotions.table.reduction"),
        render: (promo) => (
          <span className="text-sm font-semibold text-green-600">
            {getTypeValue(promo)}
          </span>
        ),
        defaultVisible: true,
      },
      {
        id: "period",
        header: t("promotions.table.period"),
        render: (promo) => (
          <div className="flex flex-col">
            <span>{formatDate(promo.startsAt)}</span>
            <span className="text-xs text-gray-400">
              → {formatDate(promo.endsAt)}
            </span>
          </div>
        ),
        defaultVisible: true,
      },
      {
        id: "usages",
        header: t("promotions.table.usages"),
        render: (promo) => (
          <>
            {promo._count?.applied || 0}
            {promo.maxUses && ` / ${promo.maxUses}`}
          </>
        ),
        defaultVisible: true,
      },
      {
        id: "status",
        header: t("promotions.table.status"),
        render: (promo) =>
          isActive(promo) ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t("promotions.filters.active")}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {t("promotions.filters.inactive")}
            </span>
          ),
        align: "center",
        defaultVisible: true,
      },
    ],
    [t]
  );

  const actions: TableAction<PromotionWithStats>[] = useMemo(
    () => [
      {
        onClick: (promo) => togglePromotion(promo.id, promo.isActive),
        render: (promo) => (
          <button
            onClick={() => togglePromotion(promo.id, promo.isActive)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            style={{
              backgroundColor: promo.isActive ? "#10b981" : "#d1d5db",
            }}
            title={
              promo.isActive
                ? t("promotions.toggle_off")
                : t("promotions.toggle_on")
            }>
            <span
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              style={{
                transform: promo.isActive
                  ? "translateX(24px)"
                  : "translateX(4px)",
              }}
            />
          </button>
        ),
      },

      {
        onClick: (promo) => navigate(`/promotions/${promo.id}`),
        className:
          "bg-green-50 border border-green-400 rounded-md p-2 text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 w-full justify-center ",
        icon: <MdEdit className="w-4 h-4" />,
      },
      {
        //label: 'Supprimer',
        onClick: (promo) => deletePromotion(promo.id),
        className:
          "bg-red-50 border border-red-400 rounded-md p-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 w-full justify-center ",
        icon: <MdDelete className="w-4 h-4" />,
      },
    ],
    [t, navigate]
  );

  const scopes: Array<PriceScope | "ALL"> = [
    "ALL",
    "VOLUME",
    "CHAPTER",
    "EPILOGUE",
    "POV_CHAPTER",
    "POV_VOLUME",
    "COLORING",
    "BUNDLE",
    "SUBSCRIPTION",
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("promotions.title")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("promotions.subtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/promotions/new")}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
          <MdAdd className="text-xl" />
          {t("promotions.new_promotion")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Scope Filter - Button Group */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("promotions.filters.scope")}
            </label>
            <div className="flex flex-wrap gap-2">
              {scopes.map((scope) => (
                <button
                  key={scope}
                  onClick={() => setScopeFilter(scope)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    scopeFilter === scope
                      ? "bg-rose-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {scope === "ALL"
                    ? t("promotions.filters.all")
                    : getScopeLabel(scope as PriceScope)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter - Button Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("promotions.filters.status")}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeFilter === "ALL"
                    ? "bg-rose-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {t("promotions.filters.all")}
              </button>
              <button
                onClick={() => setActiveFilter(true)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeFilter === true
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {t("promotions.filters.active")}
              </button>
              <button
                onClick={() => setActiveFilter(false)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeFilter === false
                    ? "bg-gray-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {t("promotions.filters.inactive")}
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("promotions.filters.view", "Vue")}
            </label>
            <SegmentedToggle
              ariaLabel={t("promotions.filters.view", "Vue")}
              value={viewMode}
              onChange={(v) => setViewMode(v as "list" | "card")}
              options={[
                {
                  value: "list",
                  label: t("promotions.filters.list_view", "Vue liste"),
                  icon: <MdViewList className="text-xl" />,
                },
                {
                  value: "card",
                  label: t("promotions.filters.card_view", "Vue cartes"),
                  icon: <MdViewModule className="text-xl" />,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Promotions List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">{t("promotions.no_promotions")}</p>
        </div>
      ) : viewMode === "card" ? (
        /* Card View with PromotionCard component */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {promotions.map((promo) => (
            <PromotionCard
              key={promo.id}
              promotion={promo}
              onEdit={(id) => navigate(`/promotions/${id}`)}
              onDelete={deletePromotion}
            />
          ))}
        </div>
      ) : (
        /* List/Table View */
        <SmartTableGrid
          listName="promotions"
          data={promotions}
          columns={columns}
          actions={actions}
          getItemId={(promo) => promo.id}
          loading={loading}
          emptyMessage={t("promotions.no_promotions")}
          isActiveField="isActive"
        />
      )}
    </div>
  );
}
