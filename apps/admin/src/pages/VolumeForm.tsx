import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdImage, MdClose, MdArrowBack } from "react-icons/md";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import ImageGallery from "../components/ImageGallery";
import { useI18n } from "../lib/i18n";

interface VolumeFormData {
  title: string;
  waitDuration: number;
  isFinalPaywall: boolean;
  isFree: boolean;
  publishedAt: string | null;
  illustrationAssetId: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
}

export default function VolumeForm() {
  const { chapterId, volumeId } = useParams<{
    chapterId?: string;
    volumeId?: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!!volumeId);
  const [chapterTitle, setChapterTitle] = useState("");
  const [volumeChapterId, setVolumeChapterId] = useState<string>("");
  const [volumeNumber, setVolumeNumber] = useState<number | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [illustrationPreview, setIllustrationPreview] = useState<string | null>(
    null
  );
  const { t } = useI18n();
  const [formData, setFormData] = useState<VolumeFormData>({
    title: "",
    waitDuration: 86400000, // 24h en millisecondes
    isFinalPaywall: false,
    isFree: false,
    publishedAt: null,
    illustrationAssetId: null,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    if (volumeId) {
      loadVolume();
    } else if (chapterId) {
      loadChapterInfo();
    }
  }, [volumeId, chapterId]);

  const loadVolume = async () => {
    try {
      const response = await api.get(`/admin/volumes/${volumeId}`);
      const volume = response.data;
      setFormData({
        title: volume.title || "",
        waitDuration: volume.waitDuration,
        isFinalPaywall: volume.isFinalPaywall,
        isFree: volume.isFree || false,
        publishedAt: volume.publishedAt
          ? new Date(volume.publishedAt).toISOString().slice(0, 16)
          : null,
        illustrationAssetId: volume.illustrationAssetId || null,
        status: volume.status || 'PUBLISHED',
      });
      setVolumeNumber(volume.volumeNumber);
      setVolumeChapterId(volume.chapterId);
      setChapterTitle(volume.chapter?.title || "");
      if (volume.illustrationAsset) {
        const asset = volume.illustrationAsset;
        setIllustrationPreview(
          asset.thumbnailObjectKey
            ? `/uploads/${asset.thumbnailObjectKey}`
            : `/uploads/${asset.objectKey}`
        );
      }
    } catch (error: any) {
      toast.error(t("volume_form.errors.load_volume"));
      navigate(-1);
    } finally {
      setLoadingData(false);
    }
  };

  const loadChapterInfo = async () => {
    try {
      const response = await api.get(`/admin/chapters/${chapterId}`);
      setChapterTitle(response.data.title);
    } catch (error) {
      toast.error(t("volume_form.errors.load_chapter"));
      navigate("/chapters");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t("volume_form.errors.title_required"));
      return;
    }

    if (formData.waitDuration < 0) {
      toast.error(t("volume_form.errors.negative_wait"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        publishedAt: formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : null,
      };

      if (volumeId) {
        await api.patch(`/admin/volumes/${volumeId}`, payload);
        toast.success(t("volume_form.success.updated"));
      } else {
        await api.post(`/admin/chapters/${chapterId}/volumes`, payload);
        toast.success(t("volume_form.success.created"));
      }
      navigate(`/chapters/${chapterId || volumeChapterId}`);
    } catch (error: any) {
      toast.error(error.message || t("volume_form.errors.save"));
    } finally {
      setLoading(false);
    }
  };

  const handleWaitDurationChange = (hours: string) => {
    const value = parseFloat(hours) || 0;
    setFormData({ ...formData, waitDuration: Math.round(value * 3600000) });
  };

  const handleSelectIllustration = (asset: any) => {
    setFormData({ ...formData, illustrationAssetId: asset.id });
    setIllustrationPreview(
      asset.thumbnailObjectKey
        ? `/uploads/${asset.thumbnailObjectKey}`
        : `/uploads/${asset.objectKey}`
    );
    setShowImageSelector(false);
  };

  const handleRemoveIllustration = () => {
    setFormData({ ...formData, illustrationAssetId: null });
    setIllustrationPreview(null);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t("messages.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition mb-6">
        <MdArrowBack className="text-xl text-gray-600" />
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {volumeId
              ? t("volume_form.edit_title")
              : t("volume_form.create_title")}
          </h1>
          {chapterTitle && (
            <p className="text-gray-600">
              {volumeNumber
                ? t("volume_form.chapter_with_volume", undefined, {
                    title: chapterTitle,
                    number: volumeNumber,
                  })
                : t("volume_form.chapter_label", undefined, {
                    title: chapterTitle,
                  })}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          {/* Illustration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-start">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("volume_form.illustration_label")}
              </label>
              {illustrationPreview ? (
                <div className="relative inline-block m-auto">
                  <img
                    src={illustrationPreview}
                    alt={t("volume_form.illustration_alt")}
                    className="h-48 rounded-lg border border-gray-300 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveIllustration}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
                    title={t("volume_form.remove_illustration")}>
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
                    {t("volume_form.choose_illustration")}
                  </span>
                </button>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t("volume_form.illustration_help")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-rows-3 gap-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("volume_form.title_label")}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("volume_form.title_placeholder")}
                  required
                />
              </div>
              {/* Date de publication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("volume_form.publish_date_label")}
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publishedAt: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("volume_form.publish_date_help")}
                </p>
              </div>

              {/* Durée d'attente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("volume_form.wait_label")}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={(formData.waitDuration / 3600000).toFixed(1)}
                  onChange={(e) => handleWaitDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("volume_form.wait_help")}
                </p>
              </div>
            </div>
          </div>
          {/* Final Paywall */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isFinalPaywall}
                onChange={(e) =>
                  setFormData({ ...formData, isFinalPaywall: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {t("volume_form.final_paywall_label")}
                </span>
                <p className="text-xs text-gray-500">
                  {t("volume_form.final_paywall_help")}
                </p>
              </div>
            </label>
          </div>

          {/* Volume gratuit */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) =>
                  setFormData({ ...formData, isFree: e.target.checked })
                }
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {t("volume_form.free_label")}
                </span>
                <p className="text-xs text-gray-500">
                  {t("volume_form.free_help")}
                </p>
              </div>
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de publication
            </label>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'DRAFT' })}
                className={`px-4 py-2 text-sm font-medium border ${
                  formData.status === 'DRAFT'
                    ? 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-l-md`}
              >
                Brouillon
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'SCHEDULED' })}
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  formData.status === 'SCHEDULED'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Planifié
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'PUBLISHED' })}
                className={`px-4 py-2 text-sm font-medium border ${
                  formData.status === 'PUBLISHED'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-r-md`}
              >
                Publié
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Les volumes en brouillon ou planifiés ne seront pas visibles par les lecteurs
            </p>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={loading}>
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}>
              {loading
                ? t("volume_form.saving")
                : volumeId
                  ? t("volume_form.save_edit")
                  : t("volume_form.save_create")}
            </button>
          </div>
        </form>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <Modal
          isOpen={showImageSelector}
          onClose={() => setShowImageSelector(false)}
          title={t("volume_form.modal_title")}>
          <ImageGallery
            chapterId={volumeChapterId || chapterId}
            onSelectImage={(asset) => {
              handleSelectIllustration(asset);
              setShowImageSelector(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
