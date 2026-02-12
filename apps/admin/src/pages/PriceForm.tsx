import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { PriceScope } from "@cher-journal/types";
import { useI18n } from "../lib/i18n";
import { MdArrowBack, MdSave, MdDelete } from "react-icons/md";

interface PriceFormData {
  scope: PriceScope;
  refId?: string;
  amountCents: number;
  currency: string;
}

export function PriceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { t, language } = useI18n();
  const locale = language === "en" ? "en-US" : "fr-FR";

  const [formData, setFormData] = useState<PriceFormData>({
    scope: "VOLUME",
    amountCents: 0,
    currency: "EUR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      loadPrice();
    }
  }, [isEdit, id]);

  const loadPrice = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/admin/prices/${id}`);
      const price = res.data.data || res.data;
      setFormData({
        scope: price.scope,
        refId: price.refId || undefined,
        amountCents: price.amountCents,
        currency: price.currency,
      });
    } catch (err) {
      setError(t("prices.form.error_load"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await api.patch(`/admin/prices/${id}`, formData);
      } else {
        await api.post("/admin/prices", formData);
      }
      navigate("/prices");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || t("prices.form.error_save")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("prices.form.confirm_delete"))) return;

    try {
      await api.delete(`/admin/prices/${id}`);
      navigate("/prices");
    } catch (err) {
      setError(t("prices.form.error_delete"));
    }
  };

  const formatPrice = (cents: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: formData.currency,
    }).format(cents / 100);
  };

  const getScopeLabel = (scope: PriceScope): string => {
    return t(`prices.scope.${scope.toLowerCase()}`);
  };

  const scopeOptions: Array<{ value: PriceScope; label: string }> = [
    { value: "VOLUME", label: t("prices.scope.volume") },
    { value: "CHAPTER", label: t("prices.scope.chapter") },
    { value: "EPILOGUE", label: t("prices.scope.epilogue") },
    { value: "POV", label: t("prices.scope.pov") },
    { value: "COLORING", label: t("prices.scope.coloring") },
    { value: "BUNDLE", label: t("prices.scope.bundle") },
    { value: "SUBSCRIPTION", label: t("prices.scope.subscription") },
  ];

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/prices")}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t("prices.form.edit_title") : t("prices.form.create_title")}
          </h1>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left column - Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scope selection card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t("prices.form.scope_label")}
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {t("prices.form.scope_help")}
            </p>
            <div className="flex flex-wrap gap-2">
              {scopeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, scope: opt.value })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    formData.scope === opt.value
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t("prices.form.amount_label")}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.amountCents}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountCents: Number(e.target.value),
                })
              }
              placeholder={t("prices.form.amount_placeholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("prices.form.amount_help")}
            </p>
          </div>

          {/* Currency selection card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t("prices.form.currency_label")}
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {/* Optional RefId input card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t("prices.form.refid_label")}
            </label>
            <input
              type="text"
              value={formData.refId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  refId: e.target.value || undefined,
                })
              }
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("prices.form.refid_help")}
            </p>
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t("prices.form.preview_title")}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">
                  {t("prices.form.scope")}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {getScopeLabel(formData.scope)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">
                  {t("prices.form.price")}
                </p>
                <p className="text-2xl font-bold text-rose-600">
                  {formatPrice(formData.amountCents)}
                </p>
              </div>

              {formData.refId && (
                <div>
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    {t("prices.form.refid_label")}
                  </p>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {formData.refId}
                  </p>
                </div>
              )}

              {/* Example calculation */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded">
                <p className="text-xs text-blue-800">
                  {t(
                    "prices.form.example_help",
                    `${formData.amountCents} cents = ${formatPrice(
                      formData.amountCents
                    )}`,
                    {
                      cents: String(formData.amountCents),
                      euros: formatPrice(formData.amountCents),
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="lg:col-span-2 flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/prices")}
            className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-400 transition"
          >
            <MdSave className="text-xl" />
            {loading ? t("common.loading_ellipsis") : t("common.save")}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 transition"
            >
              <MdDelete className="text-xl" />
              {t("common.delete")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
