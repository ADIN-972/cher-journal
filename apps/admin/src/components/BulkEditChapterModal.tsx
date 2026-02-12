import { useState } from "react";
import Drawer from "./Drawer";
import { useI18n } from "../lib/i18n";

interface BulkEditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: BulkChapterUpdates) => Promise<void>;
  selectedCount: number;
}

export interface BulkChapterUpdates {
  status?: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  publishedAt?: string | null;
}

export default function BulkEditChapterModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
}: BulkEditChapterModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<{
    updateStatus: boolean;
    status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
    updatePublishedAt: boolean;
    publishedAt: string;
  }>({
    updateStatus: false,
    status: "DRAFT",
    updatePublishedAt: false,
    publishedAt: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: BulkChapterUpdates = {};

      if (formData.updateStatus) {
        updates.status = formData.status;
      }

      if (formData.updatePublishedAt) {
        updates.publishedAt = formData.publishedAt
          ? new Date(formData.publishedAt).toISOString()
          : null;
      }

      await onSubmit(updates);
      handleClose();
    } catch (error) {
      // Error is handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      updateStatus: false,
      status: "DRAFT",
      updatePublishedAt: false,
      publishedAt: "",
    });
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={t("chapters_page.bulk.title", "Édition en masse des chapitres")}
      width="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>{selectedCount}</strong> chapitre(s) sélectionné(s)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Cochez les champs que vous souhaitez modifier. Seuls les champs
              cochés seront mis à jour.
            </p>
          </div>

          {/* Status */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updateStatus}
                onChange={(e) =>
                  setFormData({ ...formData, updateStatus: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Modifier le statut
              </span>
            </label>
            {formData.updateStatus && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    formData.status === "DRAFT"
                      ? "bg-gray-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  Brouillon
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, status: "IN_PROGRESS" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    formData.status === "IN_PROGRESS"
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  En cours
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, status: "PUBLISHED" })
                  }
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    formData.status === "PUBLISHED"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  Publié
                </button>
              </div>
            )}
          </div>

          {/* Published At */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updatePublishedAt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    updatePublishedAt: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Modifier la date de publication
              </span>
            </label>
            {formData.updatePublishedAt && (
              <input
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) =>
                  setFormData({ ...formData, publishedAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={t("chapter_form.publish_date", "Date de publication")}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">
            {loading ? "Mise à jour..." : "Appliquer les modifications"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
