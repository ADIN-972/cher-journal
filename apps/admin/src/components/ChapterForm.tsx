import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MdImage, MdClose } from "react-icons/md";
import { useI18n } from "../lib/i18n";
import Modal from "./Modal";
import ImageGallery from "./ImageGallery";

interface ChapterFormData {
  title: string;
  protagonistName: string;
  status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  priceFreeToRead: number;
  pricePaywall: number;
  priceEpilogue: number;
  publishedAt: string | null;
  coverAssetId: string | null;
}

interface ChapterFormProps {
  chapterId?: string;
  initialData?: Partial<ChapterFormData>;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ChapterForm({
  chapterId,
  initialData,
  onSubmit,
  onCancel,
}: ChapterFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ChapterFormData>({
    title: initialData?.title || "",
    protagonistName: initialData?.protagonistName || "",
    status: initialData?.status || "DRAFT",
    priceFreeToRead: initialData?.priceFreeToRead || 0,
    pricePaywall: initialData?.pricePaywall || 0,
    priceEpilogue: initialData?.priceEpilogue || 0,
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt as any).toISOString().slice(0, 16)
      : null,
    coverAssetId: (initialData?.coverAssetId as string | null) || null,
  });
  const [loading, setLoading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Load cover preview when initialData changes
  useEffect(() => {
    if (initialData?.coverAsset) {
      const asset = initialData.coverAsset as any;
      setCoverPreview(
        asset.thumbnailObjectKey
          ? `/uploads/${asset.thumbnailObjectKey}`
          : `/uploads/${asset.objectKey}`
      );
    }
  }, [initialData]);

  const handleSelectCover = (asset: any) => {
    setFormData({ ...formData, coverAssetId: asset.id });
    setCoverPreview(
      asset.thumbnailObjectKey
        ? `/uploads/${asset.thumbnailObjectKey}`
        : `/uploads/${asset.objectKey}`
    );
  };

  const handleRemoveCover = () => {
    setFormData({ ...formData, coverAssetId: null });
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t("chapter_form.title_required", "Le titre est requis"));
      return;
    }

    if (!formData.protagonistName.trim()) {
      toast.error(
        t(
          "chapter_form.protagonist_required",
          "Le nom du protagoniste est requis"
        )
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(
        chapterId
          ? t("chapter_form.toast.updated", "Chapitre modifié avec succès")
          : t("chapter_form.toast.created", "Chapitre créé avec succès")
      );
      onCancel();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.title", "Titre")} *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t(
            "chapter_form.title_placeholder",
            "Ex: Le Mystère de la Forêt"
          )}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.protagonist", "Nom du protagoniste")} *
        </label>
        <input
          type="text"
          value={formData.protagonistName}
          onChange={(e) =>
            setFormData({ ...formData, protagonistName: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("chapter_form.protagonist_placeholder", "Ex: Emma")}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.status", "Statut")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "DRAFT" })}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              formData.status === "DRAFT"
                ? "bg-gray-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {t("chapter_form.status_draft", "Brouillon")}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "IN_PROGRESS" })}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              formData.status === "IN_PROGRESS"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {t("chapter_form.status_in_progress", "En cours")}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              formData.status === "PUBLISHED"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {t("chapter_form.status_published", "Publié")}
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.cover_image", "Image de couverture")}
        </label>
        {!chapterId ? (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              {t(
                "chapter_form.cover_create_first",
                "Créez d'abord le chapitre pour pouvoir ajouter une image de couverture"
              )}
            </p>
          </div>
        ) : coverPreview ? (
          <div className="relative inline-block">
            <img
              src={coverPreview}
              alt="Couverture"
              className="h-48 rounded-lg border border-gray-300 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveCover}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
              title={t("chapter_form.remove_image", "Retirer l'image")}>
              <MdClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowImageSelector(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors flex flex-col items-center justify-center space-y-2">
            <MdImage className="w-12 h-12 text-gray-400" />
            <span className="text-sm text-gray-600">
              {t(
                "chapter_form.choose_cover",
                "Choisir une image de couverture"
              )}
            </span>
          </button>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("chapter_form.cover_desc", "Image affichée pour ce chapitre")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.price_free_to_read", "Prix free-to-read (€)")}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={(formData.priceFreeToRead / 100).toFixed(2)}
            onChange={(e) =>
              setFormData({
                ...formData,
                priceFreeToRead: Math.round(
                  parseFloat(e.target.value || "0") * 100
                ),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t(
              "chapter_form.price_free_to_read_desc",
              "Prix pour volumes standards (après timer)"
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.price_paywall", "Prix paywall (€)")}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={(formData.pricePaywall / 100).toFixed(2)}
            onChange={(e) =>
              setFormData({
                ...formData,
                pricePaywall: Math.round(
                  parseFloat(e.target.value || "0") * 100
                ),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t(
              "chapter_form.price_paywall_desc",
              "Prix pour volumes paywall (finaux)"
            )}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.price_epilogue", "Prix épilogue (€)")}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={(formData.priceEpilogue / 100).toFixed(2)}
            onChange={(e) =>
              setFormData({
                ...formData,
                priceEpilogue: Math.round(
                  parseFloat(e.target.value || "0") * 100
                ),
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t(
              "chapter_form.price_epilogue_desc",
              "Prix pour volumes &gt;10 (0 = timer uniquement)"
            )}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.publish_date", "Date de publication")}
        </label>
        <input
          type="datetime-local"
          value={formData.publishedAt || ""}
          onChange={(e) =>
            setFormData({ ...formData, publishedAt: e.target.value || null })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t(
            "chapter_form.publish_date_desc",
            "Si définie, les volumes de ce chapitre ne pourront pas démarrer leur décompte avant cette date"
          )}
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={loading}>
          {t("common.cancel", "Annuler")}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}>
          {loading
            ? t("common.loading_ellipsis", "Enregistrement...")
            : chapterId
              ? t("common.edit", "Modifier")
              : t("chapter_form.create", "Créer")}
        </button>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && chapterId && (
        <Modal
          isOpen={showImageSelector}
          onClose={() => setShowImageSelector(false)}
          title={t(
            "chapter_form.select_cover",
            "Sélectionner une image de couverture"
          )}>
          <ImageGallery
            chapterId={chapterId}
            onSelectImage={(asset) => {
              handleSelectCover(asset);
              setShowImageSelector(false);
            }}
          />
        </Modal>
      )}
    </form>
  );
}
