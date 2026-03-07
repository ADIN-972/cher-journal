import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MdImage, MdClose } from "react-icons/md";
import { useI18n, useGenreLabels } from "../lib/i18n";
import { getImageUrl } from "../lib/imageUtils";
import Modal from "./Modal";
import ImageGallery from "./ImageGallery";

interface ChapterFormData {
  title: string;
  protagonistName: string;
  description: string | null;
  genres: string[];
  status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  publishedAt: string | null;
  coverAssetId: string | null;
  accroche_classic: string | null;
  accroche_dark: string | null;
  accroche_love: string | null;
  accroche_marketing: string | null;
  accroche_dark_collection: string | null;
  niveau_intensite: number;
  niveau_douceur: number;
  niveau_danger: number;
  niveau_transformation: number;
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
  const { labels: genreLabels, genres: availableGenres } = useGenreLabels();
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
    accroche_classic: (initialData as any)?.accroche_classic || null,
    accroche_dark: (initialData as any)?.accroche_dark || null,
    accroche_love: (initialData as any)?.accroche_love || null,
    accroche_marketing: (initialData as any)?.accroche_marketing || null,
    accroche_dark_collection: (initialData as any)?.accroche_dark_collection || null,
    niveau_intensite: (initialData as any)?.niveau_intensite || 3,
    niveau_douceur: (initialData as any)?.niveau_douceur || 3,
    niveau_danger: (initialData as any)?.niveau_danger || 3,
    niveau_transformation: (initialData as any)?.niveau_transformation || 3,
  });
  const [loading, setLoading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Sync form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData?.title || "",
        protagonistName: initialData?.protagonistName || "",
        description: (initialData?.description as string | null) || null,
        genres: Array.isArray(initialData?.genres)
          ? (initialData.genres as any[]).map((g) =>
              typeof g === "string" ? g : g.genre
            )
          : [],
        status: initialData?.status || "DRAFT",
        publishedAt: initialData?.publishedAt
          ? new Date(initialData.publishedAt as any).toISOString().slice(0, 16)
          : null,
        coverAssetId: (initialData?.coverAssetId as string | null) || null,
        accroche_classic: (initialData as any)?.accroche_classic || null,
        accroche_dark: (initialData as any)?.accroche_dark || null,
        accroche_love: (initialData as any)?.accroche_love || null,
        accroche_marketing: (initialData as any)?.accroche_marketing || null,
        accroche_dark_collection: (initialData as any)?.accroche_dark_collection || null,
        niveau_intensite: (initialData as any)?.niveau_intensite || 3,
        niveau_douceur: (initialData as any)?.niveau_douceur || 3,
        niveau_danger: (initialData as any)?.niveau_danger || 3,
        niveau_transformation: (initialData as any)?.niveau_transformation || 3,
      });
    }
  }, [initialData]);

  // Load cover preview when initialData changes
  useEffect(() => {
    if ((initialData as any)?.coverAsset) {
      const asset = (initialData as any).coverAsset as any;
      setCoverPreview(getImageUrl(asset));
    } else {
      // Clear preview if no cover asset
      setCoverPreview(null);
    }
  }, [initialData]);

  const handleSelectCover = (asset: any) => {
    setFormData({ ...formData, coverAssetId: asset.id });
    setCoverPreview(getImageUrl(asset));
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
      <div className=" p-6">
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
            "Ex: Le Mystère de la Forêt",
          )}
          required
        />
      </div>

      <div className=" p-6">
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

      <div className=" p-6">
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
            "Écrivez une préface ou description pour présenter ce chapitre...",
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t(
            "chapter_form.description_help",
            "Cette préface sera affichée aux lecteurs avant le début du chapitre",
          )}
        </p>
      </div>

      <div className=" p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t("chapter_form.genres", "Genres")}
        </label>
        <div className="flex flex-wrap gap-2">
          {availableGenres.map((genre) => (
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
              {genreLabels[genre]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {t(
            "chapter_form.genres_help",
            "Sélectionnez un ou plusieurs genres qui décrivent ce chapitre",
          )}
        </p>
      </div>

      <div className=" p-6">
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
            {t("chapter_form.status_draft", t("chapter.status_draft"))}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "IN_PROGRESS" })}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              formData.status === "IN_PROGRESS"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {t(
              "chapter_form.status_in_progress",
              t("chapter.status_in_progress"),
            )}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              formData.status === "PUBLISHED"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {t("chapter_form.status_published", t("chapter.status_published"))}
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className=" p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("chapter_form.cover_image", "Image de couverture")}
        </label>
        {!chapterId ? (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              {t(
                "chapter_form.cover_create_first",
                "Créez d'abord le chapitre pour pouvoir ajouter une image de couverture",
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
                "Choisir une image de couverture",
              )}
            </span>
          </button>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("chapter_form.cover_desc", "Image affichée pour ce chapitre")}
        </p>
      </div>

      <div className=" p-6">
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
            "Si définie, les volumes de ce chapitre ne pourront pas démarrer leur décompte avant cette date",
          )}
        </p>
      </div>

      {/* Accroches Section */}
      <div className="pt-6 border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("chapter_form.accroches", "Accroches")}
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.accroche_classic", "Accroche Classique")}
          </label>
          <textarea
            value={formData.accroche_classic || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                accroche_classic: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={2}
            placeholder={t(
              "chapter_form.accroche_classic_placeholder",
              "Accroche classique pour cette histoire...",
            )}
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.accroche_dark", "Accroche Sombre")}
          </label>
          <textarea
            value={formData.accroche_dark || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                accroche_dark: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={2}
            placeholder={t(
              "chapter_form.accroche_dark_placeholder",
              "Accroche sombre et intense...",
            )}
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.accroche_love", "Accroche Amour")}
          </label>
          <textarea
            value={formData.accroche_love || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                accroche_love: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={2}
            placeholder={t(
              "chapter_form.accroche_love_placeholder",
              "Accroche romantique...",
            )}
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("chapter_form.accroche_marketing", "Accroche Marketing")}
          </label>
          <textarea
            value={formData.accroche_marketing || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                accroche_marketing: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={2}
            placeholder={t(
              "chapter_form.accroche_marketing_placeholder",
              "Accroche pour la promotion...",
            )}
          />
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t(
              "chapter_form.accroche_dark_collection",
              "Accroche Collection Sombre",
            )}
          </label>
          <textarea
            value={formData.accroche_dark_collection || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                accroche_dark_collection: e.target.value || null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={2}
            placeholder={t(
              "chapter_form.accroche_dark_collection_placeholder",
              "Accroche pour la collection sombre...",
            )}
          />
        </div>
      </div>

      {/* Emotional Levels Section */}
      <div className="pt-6 border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("chapter_form.emotional_levels", "Niveaux Émotionnels")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-rows-[1fr_auto]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("chapter_form.niveau_intensite", "Intensité")}
              <span className="text-xs text-gray-500">
                (
                {t(
                  "chapter_form.niveau_intensite_description",
                  "force du désir, tension charnelle",
                )}
                )
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.niveau_intensite}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    niveau_intensite: parseInt(e.target.value),
                  })
                }
                className="flex-1"
                title={t("chapter_form.niveau_intensite", "Intensité")}
              />
              <span className="text-lg font-bold text-gray-700 w-8">
                {formData.niveau_intensite}
              </span>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("chapter_form.niveau_douceur", "Douceur")}{" "}
              <span className="text-xs text-gray-500 italic px-2">
                (
                {t(
                  "chapter_form.niveau_douceur_description",
                  "tendresse, vulnérabilité, délicatesse",
                )}
                )
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.niveau_douceur}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    niveau_douceur: parseInt(e.target.value),
                  })
                }
                className="flex-1"
                title={t("chapter_form.niveau_douceur", "Douceur")}
              />
              <span className="text-lg font-bold text-gray-700 w-8">
                {formData.niveau_douceur}
              </span>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("chapter_form.niveau_danger", "Danger")}{" "}
              <span className="text-xs text-gray-500 italic px-2">
                (
                {t(
                  "chapter_form.niveau_danger_description",
                  "risque émotionnel, social, moral ou physique",
                )}
                )
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.niveau_danger}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    niveau_danger: parseInt(e.target.value),
                  })
                }
                className="flex-1"
                title={t("chapter_form.niveau_danger", "Danger")}
              />
              <span className="text-lg font-bold text-gray-700 w-8">
                {formData.niveau_danger}
              </span>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("chapter_form.niveau_transformation", "Transformation")}{" "}
              <span className="text-xs text-gray-500 italic px-2">
                (
                {t(
                  "chapter_form.niveau_transformation_description",
                  "évolution des personnages, changements majeurs, impact profond sur les personnages et l'intrigue",
                )}
                )
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.niveau_transformation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    niveau_transformation: parseInt(e.target.value),
                  })
                }
                className="flex-1"
                title={t(
                  "chapter_form.niveau_transformation",
                  "Transformation",
                )}
              />
              <span className="text-lg font-bold text-gray-700 w-8">
                {formData.niveau_transformation}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 -mx-6  px-6 py-4 flex w-full justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700"
          disabled={loading}>
          {t("common.cancel", "Annuler")}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
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
            "Sélectionner une image de couverture",
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
