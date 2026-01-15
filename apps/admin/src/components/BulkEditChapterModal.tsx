import { useState } from "react";
import Modal from "./Modal";

interface BulkEditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: BulkChapterUpdates) => Promise<void>;
  selectedCount: number;
}

export interface BulkChapterUpdates {
  status?: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  priceFreeToRead?: number;
  pricePaywall?: number;
  priceEpilogue?: number;
  publishedAt?: string | null;
}

export default function BulkEditChapterModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
}: BulkEditChapterModalProps) {
  const [formData, setFormData] = useState<{
    updateStatus: boolean;
    status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
    updatePriceFreeToRead: boolean;
    priceFreeToRead: number;
    updatePricePaywall: boolean;
    pricePaywall: number;
    updatePriceEpilogue: boolean;
    priceEpilogue: number;
    updatePublishedAt: boolean;
    publishedAt: string;
  }>({
    updateStatus: false,
    status: "DRAFT",
    updatePriceFreeToRead: false,
    priceFreeToRead: 0,
    updatePricePaywall: false,
    pricePaywall: 0,
    updatePriceEpilogue: false,
    priceEpilogue: 0,
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

      if (formData.updatePriceFreeToRead) {
        updates.priceFreeToRead = Math.round(formData.priceFreeToRead * 100); // Convert to cents
      }

      if (formData.updatePricePaywall) {
        updates.pricePaywall = Math.round(formData.pricePaywall * 100);
      }

      if (formData.updatePriceEpilogue) {
        updates.priceEpilogue = Math.round(formData.priceEpilogue * 100);
      }

      if (formData.updatePublishedAt) {
        updates.publishedAt = formData.publishedAt || null;
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
      updatePriceFreeToRead: false,
      priceFreeToRead: 0,
      updatePricePaywall: false,
      pricePaywall: 0,
      updatePriceEpilogue: false,
      priceEpilogue: 0,
      updatePublishedAt: false,
      publishedAt: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Édition en masse des chapitres">
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

          {/* Price Free to Read */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updatePriceFreeToRead}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    updatePriceFreeToRead: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Modifier le prix Base
              </span>
            </label>
            {formData.updatePriceFreeToRead && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceFreeToRead}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceFreeToRead: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  €
                </span>
              </div>
            )}
          </div>

          {/* Price Paywall */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updatePricePaywall}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    updatePricePaywall: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Modifier le prix Paywall
              </span>
            </label>
            {formData.updatePricePaywall && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePaywall}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePaywall: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  €
                </span>
              </div>
            )}
          </div>

          {/* Price Epilogue */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updatePriceEpilogue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    updatePriceEpilogue: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Modifier le prix Épilogue
              </span>
            </label>
            {formData.updatePriceEpilogue && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceEpilogue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceEpilogue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  €
                </span>
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
    </Modal>
  );
}
