import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack, MdSave, MdAdd, MdDelete } from "react-icons/md";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";

interface BundleItem {
  id?: string;
  type: "CHAPTER" | "VOLUME";
  chapterId: string;
  volumeFrom?: number;
  volumeTo?: number;
  displayOrder: number;
}

interface BundleFormData {
  name: string;
  description: string;
  slug: string;
  amountCents: number;
  originalAmountCents: number;
  currency: string;
  isActive: boolean;
  imageUrl: string;
  validFrom: string;
  validUntil: string;
  maxPurchases: number | null;
  items: BundleItem[];
}

interface Chapter {
  id: string;
  title: string;
  volumeCount?: number;
}

export default function BundleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BundleFormData>({
    name: "",
    description: "",
    slug: "",
    amountCents: 0,
    originalAmountCents: 0,
    currency: "EUR",
    isActive: true,
    imageUrl: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 3600000)
      .toISOString()
      .split("T")[0],
    maxPurchases: null,
    items: [],
  });

  useEffect(() => {
    loadChapters();
    if (isEdit && id) {
      loadBundle(id);
    }
  }, [id, isEdit]);

  const loadChapters = async () => {
    try {
      const response = await api.get("/admin/chapters");
      setChapters(response.data.data || response.data || []);
    } catch (error: any) {
      toast.error(t("bundles.error_load_chapters"));
      console.error("Error loading chapters:", error);
    }
  };

  const loadBundle = async (bundleId: string) => {
    try {
      setLoadingData(true);
      const response = await api.get(`/admin/bundles/${bundleId}`);
      const bundle = response.data.data || response.data;

      setFormData({
        name: bundle.name || "",
        description: bundle.description || "",
        slug: bundle.slug || "",
        amountCents: bundle.amountCents || 0,
        originalAmountCents: bundle.originalAmountCents || 0,
        currency: bundle.currency || "EUR",
        isActive: bundle.isActive ?? true,
        imageUrl: bundle.imageUrl || "",
        validFrom: bundle.validFrom
          ? new Date(bundle.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: bundle.validUntil
          ? new Date(bundle.validUntil).toISOString().split("T")[0]
          : "",
        maxPurchases: bundle.maxPurchases ?? null,
        items: (bundle.items || []).map((item: any, index: number) => ({
          id: item.id,
          type: item.type || "CHAPTER",
          chapterId: item.chapterId || "",
          volumeFrom: item.volumeFrom ?? undefined,
          volumeTo: item.volumeTo ?? undefined,
          displayOrder: item.displayOrder ?? index,
        })),
      });
    } catch (error: any) {
      toast.error(t("bundles.error_load_bundle"));
      console.error("Error loading bundle:", error);
      navigate("/bundles");
    } finally {
      setLoadingData(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setFormData({ ...formData, slug });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("bundles.validation_name_required");
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t("bundles.validation_slug_required");
    }

    if (formData.amountCents < 0) {
      newErrors.amountCents = t("bundles.validation_price_negative");
    }

    if (formData.originalAmountCents < 0) {
      newErrors.originalAmountCents = t("bundles.validation_original_price_negative");
    }

    if (formData.items.length === 0) {
      newErrors.items = t("bundles.validation_items_required");
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.chapterId) {
        newErrors[`item_${index}_chapter`] = t("bundles.validation_chapter_required");
      }

      if (item.type === "VOLUME") {
        if (!item.volumeFrom) {
          newErrors[`item_${index}_volumeFrom`] = t("bundles.validation_volume_from_required");
        }
        if (item.volumeTo && item.volumeFrom && item.volumeTo < item.volumeFrom) {
          newErrors[`item_${index}_volumeTo`] =
            t("bundles.validation_volume_to_invalid");
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculatePrice = async () => {
    if (formData.items.length === 0) {
      alert(t("bundles.validation_min_items_calculate"));
      return;
    }

    try {
      const response = await api.post("/admin/bundles/calculate-price", {
        items: formData.items,
      });

      if (response.success && response.data) {
        setFormData({
          ...formData,
          originalAmountCents: response.data.originalAmountCents,
        });
        alert(
          `${t("bundles.label_price")}: €${(response.data.originalAmountCents / 100).toFixed(2)}`
        );
      }
    } catch (error: any) {
      console.error("Error calculating price:", error);
      alert(t("bundles.error_load_bundle") + ": " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("bundles.validation_errors"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        validFrom: formData.validFrom
          ? new Date(formData.validFrom).toISOString()
          : null,
        validUntil: formData.validUntil
          ? new Date(formData.validUntil).toISOString()
          : null,
        items: formData.items.map((item) => ({
          type: item.type,
          chapterId: item.chapterId,
          volumeFrom: item.type === "VOLUME" ? item.volumeFrom : undefined,
          volumeTo: item.type === "VOLUME" ? item.volumeTo : undefined,
          displayOrder: item.displayOrder,
        })),
      };

      if (isEdit) {
        await api.patch(`/admin/bundles/${id}`, payload);
        toast.success(t("bundles.success_updated"));
      } else {
        await api.post("/admin/bundles", payload);
        toast.success(t("bundles.success_created"));
      }

      navigate("/bundles");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        t("common.error");
      toast.error(errorMessage);
      console.error("Error saving bundle:", error);
    } finally {
      setLoading(false);
    }
  };

  const addBundleItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          type: "CHAPTER",
          chapterId: "",
          displayOrder: formData.items.length,
        },
      ],
    });
  };

  const removeBundleItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateBundleItem = (index: number, updates: Partial<BundleItem>) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], ...updates };
    setFormData({ ...formData, items: newItems });
  };

  const formatPrice = (cents: number): string => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  const handlePriceChange = (
    field: "amountCents" | "originalAmountCents",
    euros: string
  ) => {
    const value = parseFloat(euros) || 0;
    setFormData({ ...formData, [field]: Math.round(value * 100) });
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("common.loading")}</div>
      </div>
    );
  }

  const discountPercent =
    formData.originalAmountCents > 0
      ? Math.round(
          ((formData.originalAmountCents - formData.amountCents) /
            formData.originalAmountCents) *
            100
        )
      : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/bundles")}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
          <MdArrowBack className="text-xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t("bundles.page_title_edit") : t("bundles.page_title_create")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit
              ? t("bundles.page_description_edit")
              : t("bundles.page_description_create")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("bundles.section_basic")}
            </h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_name")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("bundles.placeholder_name")}
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("bundles.placeholder_description")}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_slug")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("bundles.placeholder_slug")}
                    required
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    Auto-Generate
                  </button>
                </div>
                {errors.slug && (
                  <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t("bundles.help_slug")}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("bundles.section_pricing")}</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Bundle Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_price")} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={(formData.amountCents / 100).toFixed(2)}
                  onChange={(e) =>
                    handlePriceChange("amountCents", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amountCents ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("bundles.placeholder_price")}
                  required
                />
                {errors.amountCents && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.amountCents}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.amountCents} cents = {formatPrice(formData.amountCents)}
                </p>
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_original_price")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={(formData.originalAmountCents / 100).toFixed(2)}
                    onChange={(e) =>
                      handlePriceChange("originalAmountCents", e.target.value)
                    }
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.originalAmountCents
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder={t("bundles.placeholder_original_price")}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCalculatePrice}
                    disabled={formData.items.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap">
                    Auto-calculer
                  </button>
                </div>
                {errors.originalAmountCents && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.originalAmountCents}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t("bundles.help_price_calculation")}
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bundles.label_currency")}
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Discount: {discountPercent}% off • Save{" "}
                  {formatPrice(
                    formData.originalAmountCents - formData.amountCents
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Bundle Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("bundles.section_items")}
              </h2>
              <button
                type="button"
                onClick={addBundleItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <MdAdd className="text-xl" />
                {t("bundles.button_add_item")}
              </button>
            </div>

            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.items}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t("bundles.items_empty")}</p>
                </div>
              ) : (
                formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBundleItem(index)}
                        className="text-red-600 hover:text-red-700 transition">
                        <MdDelete className="text-xl" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            updateBundleItem(index, {
                              type: e.target.value as "CHAPTER" | "VOLUME",
                              volumeFrom: undefined,
                              volumeTo: undefined,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="CHAPTER">Full Chapter</option>
                          <option value="VOLUME">Volume Range</option>
                        </select>
                      </div>

                      {/* Chapter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chapter *
                        </label>
                        <select
                          value={item.chapterId}
                          onChange={(e) =>
                            updateBundleItem(index, {
                              chapterId: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`item_${index}_chapter`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          required>
                          <option value="">Select a chapter...</option>
                          {chapters.map((chapter) => (
                            <option key={chapter.id} value={chapter.id}>
                              {chapter.title}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}_chapter`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`item_${index}_chapter`]}
                          </p>
                        )}
                      </div>

                      {/* Volume From (only for VOLUME type) */}
                      {item.type === "VOLUME" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Volume From *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.volumeFrom || ""}
                              onChange={(e) =>
                                updateBundleItem(index, {
                                  volumeFrom: parseInt(e.target.value) || undefined,
                                })
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[`item_${index}_volumeFrom`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="1"
                            />
                            {errors[`item_${index}_volumeFrom`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`item_${index}_volumeFrom`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Volume To
                            </label>
                            <input
                              type="number"
                              min={item.volumeFrom || 1}
                              value={item.volumeTo || ""}
                              onChange={(e) =>
                                updateBundleItem(index, {
                                  volumeTo: parseInt(e.target.value) || undefined,
                                })
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[`item_${index}_volumeTo`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Leave empty for single volume"
                            />
                            {errors[`item_${index}_volumeTo`] && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[`item_${index}_volumeTo`]}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Optional: Leave empty to include only volume "From"
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("bundles.section_availability")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Valid From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Max Purchases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Purchases
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxPurchases || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPurchases: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for unlimited purchases
                </p>
              </div>
            </div>
          </div>

          {/* Image & Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("bundles.section_image")}
            </h2>
            <div className="space-y-4">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/bundle-image.jpg"
                />
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </p>
                  <img
                    src={formData.imageUrl}
                    alt="Bundle preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Active Status */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                    <p className="text-xs text-gray-500">
                      Bundle is available for purchase when active
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Sidebar - Right Column */}
        <div className="lg:col-span-1">
          <div
            className={`rounded-lg shadow-sm p-6 sticky top-6 ${
              formData.isActive
                ? "bg-green-50 border-2 border-green-200"
                : "bg-gray-50 border-2 border-gray-300"
            }`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Bundle Preview
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">Name</p>
                <p className="text-base font-bold text-gray-900">
                  {formData.name || "Untitled Bundle"}
                </p>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">Price</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(formData.amountCents)}
                  </p>
                  {formData.originalAmountCents > formData.amountCents && (
                    <p className="text-lg text-gray-500 line-through">
                      {formatPrice(formData.originalAmountCents)}
                    </p>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Save {discountPercent}%
                  </p>
                )}
              </div>

              {/* Items Count */}
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">
                  Included Items
                </p>
                <p className="text-base font-medium text-gray-900">
                  {formData.items.length} item{formData.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-gray-600 uppercase mb-1">Status</p>
                <p
                  className={`text-base font-bold ${
                    formData.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                  {formData.isActive ? "✓ Active" : "✗ Inactive"}
                </p>
              </div>

              {/* Validity Period */}
              {(formData.validFrom || formData.validUntil) && (
                <div>
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Valid Period
                  </p>
                  <p className="text-sm text-gray-700">
                    {formData.validFrom || "Start"} →{" "}
                    {formData.validUntil || "End"}
                  </p>
                </div>
              )}

              {/* Max Purchases */}
              {formData.maxPurchases && (
                <div>
                  <p className="text-xs text-gray-600 uppercase mb-1">
                    Purchase Limit
                  </p>
                  <p className="text-sm text-gray-700">
                    {formData.maxPurchases} purchases max
                  </p>
                </div>
              )}

              {/* Item List */}
              {formData.items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-300">
                  <p className="text-xs text-gray-600 uppercase mb-2">
                    Items Preview
                  </p>
                  <ul className="space-y-2">
                    {formData.items.map((item, index) => {
                      const chapter = chapters.find(
                        (c) => c.id === item.chapterId
                      );
                      return (
                        <li
                          key={index}
                          className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>
                            {chapter?.title || "Unknown Chapter"}
                            {item.type === "VOLUME" &&
                              item.volumeFrom &&
                              ` (Vol. ${item.volumeFrom}${
                                item.volumeTo ? `-${item.volumeTo}` : ""
                              })`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-2 flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/bundles")}
            className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium"
            disabled={loading}>
            {t("bundles.button_cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
            <MdSave className="text-xl" />
            {loading ? t("bundles.button_save") : isEdit ? t("bundles.button_update") : t("bundles.button_create")}
          </button>
        </div>
      </form>
    </div>
  );
}
