import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MdImage, MdClose } from "react-icons/md";
import { useI18n } from "../lib/i18n";
import Modal from "./Modal";
import ImageGallery from "./ImageGallery";

// Available genres (enum values from Prisma)
const AVAILABLE_GENRES = [
  "PASSIONS_CHARNELLES",
  "ROMANCES_TENDRES",
  "MYSTERIES_SENSUELS",
  "INTERDITS",
  "CONQUETES",
  "REVES_SECRETS",
  "PASSION_BRUTALE",
  "AMOUR_COMPLIQUE",
  "DESIR_NOCTURNE",
  "LIBERATION",
  "DECOUVERTE_DE_SOI",
  "INTIMITE_PSYCHOLOGIQUE",
  "EVEIL_DU_DESIR",
  "RELATIONS_TRANSFORMATRICES",
  "MEMOIRE_DU_CORPS"
];

interface ChapterFormData {
  title: string;
  protagonistName: string;
  description: string | null;
  genres: string[];
  status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
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
    description: (initialData?.description as string | null) || null,
    genres: (initialData?.genres as string[]) || [],
    status: initialData?.status || "DRAFT",
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

  // Initialize genres correctly when initialData changes
  useEffect(() => {
    if (initialData?.genres) {
      const genreArray = initialData.genres as any[];
      const genreStrings = Array.isArray(genreArray)
        ? genreArray.map((g) => (typeof g === "string" ? g : g.genre))
        : [];
      setFormData((prev) => ({ ...prev, genres: genreStrings }));
    }
  }, [initialData?.genres]);

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
      // Convert datetime-local format to ISO 8601 if publishedAt is set
      const dataToSubmit = {
        ...formData,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : null,
      };

      await onSubmit(dataToSubmit);
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
          {t("chapter_form.description", "Préface / Description")}
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value || null })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          rows={4}
          placeholder={t(
            "chapter_form.description_placeholder",
            "Écrivez une préface ou description pour présenter ce chapitre..."
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t(
            "chapter_form.description_help",
            "Cette préface sera affichée aux lecteurs avant le début du chapitre"
          )}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t("chapter_form.genres", "Genres")}
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  genres: formData.genres.includes(genre)
                    ? formData.genres.filter((g) => g !== genre)
                    : [...formData.genres, genre],
                });
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                formData.genres.includes(genre)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}>
              {t(`genres.${genre}`, genre)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {t(
            "chapter_form.genres_help",
            "Sélectionnez un ou plusieurs genres qui décrivent ce chapitre"
          )}
        </p>
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
