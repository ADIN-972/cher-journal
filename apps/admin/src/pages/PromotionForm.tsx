import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { PriceScope, PromotionType } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import {
  MdArrowBack,
  MdSave,
  MdDelete,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import ToggleButton from "../components/ToggleButton";
import PromotionOverallImpact, { PromotionOverallData } from "../components/PromotionOverallImpact";
import TargetingSelector from "../components/TargetingSelector";

export function PromotionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  const [formData, setFormData] = useState<PromotionOverallData>({
    name: "",
    description: "",
    scope: "VOLUME",
    type: "PERCENT",
    value: 0,
    startsAt: new Date().toISOString().split("T")[0],
    endsAt: new Date(Date.now() + 24 * 3600000).toISOString().split("T")[0],
    isActive: true,
    code: undefined,
    priceId: undefined,
    maxUses: undefined,
    perUserLimit: undefined,
    refId: undefined,
    targetType: "ALL_USERS",
    targetedUsersCount: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);
  const [targeting, setTargeting] = useState({
    targetType: "ALL_USERS" as "ALL_USERS" | "SPECIFIC_USERS" | "CRITERIA_BASED",
    targetUserIds: [] as string[],
    targetCriteria: {} as any,
  });
  const [targetedUsersCount, setTargetedUsersCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isEdit) {
      loadPromotion();
    }
    loadPrices();
  }, [isEdit, id]);

  // Update formData with targeting data and recalculate targeted count
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetType: targeting.targetType,
    }));
    calculateTargetedCount();
  }, [targeting]);

  // Sync targetedUsersCount to formData whenever it changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      targetedUsersCount,
    }));
  }, [targetedUsersCount]);

  const calculateTargetedCount = async () => {
    try {
      const response = await api.post("/admin/promotions/preview-targeting", targeting);
      setTargetedUsersCount(response.data.targetedUsersCount);
    } catch (error) {
      console.error("Failed to calculate targeted count:", error);
    }
  };

  const loadPromotion = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/admin/promotions/${id}`);
      console.log("API Response:", res);
      console.log("API Response data:", res.data);

      // Check if data is nested under res.data.data or directly in res.data
      const promo = res.data.data || res.data;
      console.log("Loading promotion data:", promo);

      if (!promo || !promo.name) {
        throw new Error("Invalid promotion data structure");
      }

      setFormData({
        name: promo.name || "",
        description: promo.description || "",
        scope: promo.scope,
        refId: promo.refId || undefined,
        type: promo.type,
        value: promo.value !== null ? promo.value : undefined,
        startsAt: new Date(promo.startsAt).toISOString().split("T")[0],
        endsAt: new Date(promo.endsAt).toISOString().split("T")[0],
        maxUses: promo.maxUses !== null ? promo.maxUses : undefined,
        perUserLimit: promo.perUserLimit !== null ? promo.perUserLimit : undefined,
        isActive: promo.isActive,
        code: promo.code || undefined,
        priceId: promo.priceId || undefined,
        targetType: promo.targetType || "ALL_USERS",
        targetedUsersCount: undefined,
      });

      // Load targeting data
      if (promo.targetType || promo.targetUserIds || promo.targetCriteria) {
        setTargeting({
          targetType: promo.targetType || "ALL_USERS",
          targetUserIds: promo.targetUserIds || [],
          targetCriteria: promo.targetCriteria || {},
        });
      }

      console.log("FormData set successfully");
    } catch (err) {
      console.error("Error loading promotion:", err);
      setError(
        t("promotions.form.error_load", "Error loading promotion")
      );
    }
  };

  const loadPrices = async () => {
    try {
      const res = await api.get("/admin/prices");
      setPrices(res.data.data || []);
    } catch (err) {
      console.error("Failed to load prices:", err);
    }
  };

  const calculatePreview = async () => {
    if (!formData.priceId) {
      setPreviewPrice(null);
      return;
    }

    try {
      const res = await api.get(
        "/admin/prices/" + formData.priceId + "/calculate"
      );
      setPreviewPrice(res.data.data.finalPrice);
    } catch (err) {
      console.error("Failed to calculate price:", err);
    }
  };

  useEffect(() => {
    calculatePreview();
  }, [formData.priceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        scope: formData.scope,
        refId: formData.refId,
        type: formData.type,
        value: formData.type === "FREE" ? null : formData.value,
        startsAt: new Date(formData.startsAt),
        endsAt: new Date(formData.endsAt),
        maxUses: formData.maxUses,
        perUserLimit: formData.perUserLimit,
        isActive: formData.isActive,
        code: formData.code,
        priceId: formData.priceId,
        targetType: targeting.targetType,
        targetUserIds: targeting.targetUserIds,
        targetCriteria: targeting.targetCriteria,
      };

      if (isEdit) {
        await api.patch(`/admin/promotions/${id}`, payload);
      } else {
        await api.post("/admin/promotions", payload);
      }

      navigate("/promotions");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || t("promotions.form.error_save")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!confirm(t("promotions.confirm_delete"))) return;

    try {
      await api.delete(`/admin/promotions/${id}`);
      navigate("/promotions");
    } catch (err) {
      setError(t("promotions.form.error_delete"));
    }
  };

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
      VOLUME: t("promotions.scopes.VOLUME"),
      CHAPTER: t("promotions.scopes.CHAPTER"),
      EPILOGUE: t("promotions.scopes.EPILOGUE"),
      POV: t("promotions.scopes.POV"),
      COLORING: t("promotions.scopes.COLORING"),
      BUNDLE: t("promotions.scopes.BUNDLE"),
      SUBSCRIPTION: t("promotions.scopes.SUBSCRIPTION"),
    };
    return labels[scope];
  };

  const getTypeLabel = (type: PromotionType) => {
    const labels: Record<PromotionType, string> = {
      PERCENT: t("promotions.types.PERCENT"),
      FIXED: t("promotions.types.FIXED"),
      FREE: t("promotions.types.FREE"),
    };
    return labels[type];
  };

  const scopeOptions: Array<{ value: PriceScope; label: string }> = [
    { value: "VOLUME", label: t("promotions.scopes.VOLUME") },
    { value: "CHAPTER", label: t("promotions.scopes.CHAPTER") },
    { value: "EPILOGUE", label: t("promotions.scopes.EPILOGUE") },
    { value: "POV", label: t("promotions.scopes.POV") },
    { value: "COLORING", label: t("promotions.scopes.COLORING") },
    { value: "BUNDLE", label: t("promotions.scopes.BUNDLE") },
    { value: "SUBSCRIPTION", label: t("promotions.scopes.SUBSCRIPTION") },
  ];

  const typeOptions: Array<{ value: PromotionType; label: string }> = [
    { value: "PERCENT", label: `${t("promotions.types.PERCENT")} (%)` },
    { value: "FIXED", label: `${t("promotions.types.FIXED")} (€)` },
    { value: "FREE", label: t("promotions.types.FREE") },
  ];

  const relevantPrices = prices.filter((p) => p.scope === formData.scope);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/promotions")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit
              ? t("promotions.edit_promotion")
              : t("promotions.create_promotion")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit
              ? t("promotions.form.subtitle_edit", t("promotions.subtitle"))
              : t("promotions.form.subtitle_create", t("promotions.subtitle"))}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Name and Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t("promotions.form.name_label", "Nom de la promotion")} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder={t("promotions.form.name_placeholder", "Ex: Soldes d'été -20%")}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {t("promotions.form.explanation_name", "Ce nom sera visible par les administrateurs uniquement")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t("promotions.form.description_label", "Description")}
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder={t("promotions.form.description_placeholder", "Description optionnelle de la promotion...")}
              />
              <p className="text-xs text-gray-500 mt-2">
                {t("promotions.form.explanation_description", "Description interne pour vous aider à identifier cette promotion")}
              </p>
            </div>
          </div>

          {/* Scope, Type, Value - 3 columns on large screens, 1 on small */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t("promotions.form.scope_label")}
              </label>
              <div className="flex flex-wrap gap-2">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        scope: opt.value,
                        priceId: undefined,
                      })
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      formData.scope === opt.value
                        ? "bg-rose-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t("promotions.form.explanation_scope_selection")}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t("promotions.form.type_label")}
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as PromotionType,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                {typeOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {formData.type === "PERCENT"
                  ? t("promotions.form.explanation_type_percent_short")
                  : formData.type === "FIXED"
                    ? t("promotions.form.explanation_type_fixed_short")
                    : t("promotions.form.explanation_type_free_short")}
              </p>
            </div>

            {formData.type !== "FREE" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {formData.type === "PERCENT"
                    ? t("promotions.form.percent")
                    : t("promotions.form.amount") + " (en centimes)"}
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.type === "PERCENT" ? "100" : "99999"}
                  step="1"
                  value={formData.value || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={
                    formData.type === "PERCENT"
                      ? t("promotions.form.example_percent", "Ex: 20")
                      : "Ex: 50 (pour 0.50€)"
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.type === "PERCENT"
                    ? t("promotions.form.explanation_value_percent")
                    : "Entrez la valeur en centimes (ex: 50 pour 0.50€, 200 pour 2.00€)"}
                </p>
              </div>
            )}
            {formData.type === "FREE" && (
              <div className="bg-white rounded-lg shadow-sm p-6 opacity-50">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t("promotions.form.value")}
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">
                    {t("promotions.types.FREE")}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t("promotions.form.not_applicable")}
                </p>
              </div>
            )}
          </div>

          {/* Price Link */}
          {relevantPrices.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {t("promotions.form.associated_price")}
              </label>
              <select
                value={formData.priceId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceId: e.target.value || undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                <option value="">{t("promotions.form.select_price")}</option>
                {relevantPrices.map((price) => (
                  <option
                    key={price.id}
                    value={price.id}>
                    {formatPrice(price.amountCents)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {t("promotions.form.explanation_price_linked")}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              {t("promotions.form.section_period")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t("promotions.form.start_date")}
                </label>
                <input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, startsAt: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t("promotions.form.end_date")}
                </label>
                <input
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, endsAt: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {t("promotions.form.explanation_period")}
            </p>
          </div>

          {/* Limits */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              {t("promotions.form.section_limits")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t("promotions.form.max_uses")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxUses || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUses: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={t("promotions.form.unlimited")}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t("promotions.form.explanation_max_uses")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {t("promotions.form.per_user")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.perUserLimit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perUserLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={t("promotions.form.unlimited")}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t("promotions.form.explanation_per_user")}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
              {t("promotions.form.limits_example")}
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Code Promo
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Code (optionnel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase() || undefined,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent uppercase"
                    placeholder="EX: SUMMER2024"
                  />
                  {isEdit && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await api.post(
                            `/admin/promotions/${id}/generate-code`
                          );
                          setFormData({
                            ...formData,
                            code: res.data.code,
                          });
                        } catch (err) {
                          console.error("Failed to generate code:", err);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Générer
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Laissez vide pour ne pas utiliser de code. Le code sera
                  automatiquement converti en majuscules.
                </p>
              </div>
              {formData.code && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Code actif: <span className="font-bold">{formData.code}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Les utilisateurs pourront utiliser ce code lors du paiement
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Targeting */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Ciblage Utilisateurs
            </p>
            <TargetingSelector value={targeting} onChange={setTargeting} />
            <p className="text-xs text-gray-500 mt-3">
              Définissez quels utilisateurs peuvent bénéficier de cette promotion. Par défaut, tous les utilisateurs actifs sont ciblés.
            </p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              {t("promotions.form.section_status")}
            </p>
            <ToggleButton
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
              ariaLabel={t("promotions.form.active")}
              variant="green"
              label={t("promotions.form.active")}
              description={t("promotions.form.explanation_status_toggle")}
            />
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800">
              {t("promotions.form.explanation_status_period")}
            </div>
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="lg:col-span-1">
          {/* Unified Summary Card */}
          <div
            className={`rounded-lg shadow-sm p-6 border-2 relative ${
              formData.isActive
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 dashed border-gray-300"
            }`}>
            <div className="absolute top-4 right-4">
              {formData.isActive ? (
                <MdCheckCircle className="text-3xl text-green-600" />
              ) : (
                <MdCancel className="text-3xl text-gray-400" />
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-6">
              {t("promotions.form.summary_impact")}
            </h3>

            {/* Overall impact */}
            <PromotionOverallImpact promotion={formData} />

            <h2 className="text-lg font-bold text-gray-900 my-6">
              {t("promotions.form.details")}
            </h2>
            <div className="space-y-5 mt-4">
              {/* Scope Section */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {t("promotions.form.section_content_type")}
                </p>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  {getScopeLabel(formData.scope)}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {formData.scope === "VOLUME"
                    ? t("promotions.form.explanation_scope_volume")
                    : formData.scope === "CHAPTER"
                      ? t("promotions.form.explanation_scope_chapter")
                      : formData.scope === "EPILOGUE"
                        ? t("promotions.form.explanation_scope_epilogue")
                        : formData.scope === "POV"
                          ? t("promotions.form.explanation_scope_pov")
                          : formData.scope === "COLORING"
                            ? t("promotions.form.explanation_scope_coloring")
                            : formData.scope === "BUNDLE"
                              ? t("promotions.form.explanation_scope_bundle")
                              : t(
                                  "promotions.form.explanation_scope_subscription"
                                )}
                </p>
              </div>

              {/* Type Section */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {t("promotions.form.section_reduction_type")}
                </p>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  {getTypeLabel(formData.type)}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {formData.type === "PERCENT"
                    ? t("promotions.form.explanation_type_percent")
                    : formData.type === "FIXED"
                      ? t("promotions.form.explanation_type_fixed")
                      : t("promotions.form.explanation_type_free")}
                </p>
              </div>

              {/* Value Section */}
              {formData.type !== "FREE" && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    {t("promotions.form.section_value")}
                  </p>
                  <p className="text-sm font-bold text-green-600 mb-2">
                    {formData.type === "PERCENT"
                      ? t("promotions.form.reduction_percent", undefined, {
                          value: formData.value ?? 0,
                        }) || `-${formData.value ?? 0}%`
                      : t("promotions.form.reduction_amount", undefined, {
                          value: formatPrice(formData.value || 0),
                        }) || `-${formatPrice(formData.value || 0)}`}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {formData.type === "PERCENT"
                      ? t(
                          "promotions.form.explanation_value_percent",
                          undefined,
                          {
                            value: formData.value ?? 0,
                          }
                        ) || `Réduction de ${formData.value ?? 0}% sur le prix`
                      : t(
                          "promotions.form.explanation_value_fixed",
                          undefined,
                          {
                            value: formatPrice(formData.value || 0),
                          }
                        ) || `Réduction de ${formatPrice(formData.value || 0)} sur le prix`}
                  </p>
                  {formData.value === 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {t("promotions.form.alert_zero_value")}
                    </div>
                  )}
                </div>
              )}

              {/* Dates Section */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {t("promotions.form.section_period")}
                </p>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  {formatDate(formData.startsAt)} →{" "}
                  {formatDate(formData.endsAt)}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t("promotions.form.explanation_period")}
                </p>
              </div>

              {/* Limits Section */}
              {(formData.maxUses || formData.perUserLimit) && (
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    {t("promotions.form.section_limits")}
                  </p>
                  <div className="space-y-2">
                    {formData.maxUses && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {t("promotions.form.summary_total_uses", undefined, {
                            value: formData.maxUses,
                          }) || `${formData.maxUses} utilisations maximum au total`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t(
                            "promotions.form.explanation_max_uses",
                            undefined,
                            {
                              value: formData.maxUses,
                            }
                          ) || `Cette promotion peut être utilisée ${formData.maxUses} fois au total par tous les utilisateurs`}
                        </p>
                      </div>
                    )}
                    {formData.perUserLimit && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {t("promotions.form.max_clients", undefined, {
                            value: formData.perUserLimit,
                          }) || `Maximum ${formData.perUserLimit} fois par client`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t(
                            "promotions.form.explanation_per_user",
                            undefined,
                            {
                              value: formData.perUserLimit,
                            }
                          ) || `Chaque utilisateur peut utiliser cette promotion ${formData.perUserLimit} fois maximum`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {t("promotions.form.section_status")}
                </p>
                <p
                  className={`text-sm font-bold mb-2 ${
                    formData.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                  {formData.isActive
                    ? `✅ ${t("promotions.form.active")}`
                    : `❌ ${t("promotions.form.inactive")}`}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {formData.isActive
                    ? t("promotions.form.explanation_status_active")
                    : t("promotions.form.explanation_status_inactive")}
                </p>
              </div>

              {/* Targeting Preview */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {t("promotions.form.targeting_section", "Ciblage")}
                </p>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  {targeting.targetType === "ALL_USERS"
                    ? "Tous les utilisateurs"
                    : targeting.targetType === "SPECIFIC_USERS"
                      ? "Utilisateurs spécifiques"
                      : "Basé sur critères"}
                </p>
                <div className="space-y-2">
                  {targeting.targetType === "SPECIFIC_USERS" && (
                    <div>
                      <p className="text-xs text-gray-600">
                        {targeting.targetUserIds?.length || 0} email(s)
                      </p>
                    </div>
                  )}
                  {targeting.targetType === "CRITERIA_BASED" && (
                    <div>
                      <p className="text-xs text-gray-600">
                        Critères avancés configurés
                      </p>
                    </div>
                  )}
                  <div className="p-3 bg-indigo-50 rounded border border-indigo-200 mt-3">
                    <p className="text-xs text-indigo-700 font-medium">
                      Utilisateurs ciblés:
                    </p>
                    <p className="text-2xl font-bold text-indigo-900 mt-1">
                      {targetedUsersCount !== undefined ? targetedUsersCount.toLocaleString() : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Preview if linked */}
              {formData.priceId && previewPrice !== null && (
                <div className="bg-white rounded border-2 border-rose-200 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    {t("promotions.form.price_example")}
                  </p>
                  {relevantPrices.find((p) => p.id === formData.priceId) &&
                    (() => {
                      const price = relevantPrices.find(
                        (p) => p.id === formData.priceId
                      );
                      if (!price) return null;
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              {t("promotions.form.usual_price")}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatPrice(price.amountCents)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              {t("promotions.form.discounted_price")}
                            </span>
                            <span className="text-sm font-bold text-green-600">
                              {formatPrice(previewPrice || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-700">
                              {t("promotions.form.customer_savings")}
                            </span>
                            <span className="text-sm font-bold text-green-700">
                              -
                              {formatPrice(
                                price.amountCents - (previewPrice || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-2 flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/promotions")}
            className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium">
            {t("promotions.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-400 transition font-medium">
            <MdSave className="text-xl" />
            {loading ? t("promotions.saving") : t("promotions.save")}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium flex items-center gap-2">
              <MdDelete className="text-xl" />
              {t("promotions.delete")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
