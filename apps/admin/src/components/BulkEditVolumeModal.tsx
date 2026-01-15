import { useState, useEffect } from 'react';
import Modal from './Modal';

interface BulkEditVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: BulkVolumeUpdates) => Promise<void>;
  selectedCount: number;
}

export interface BulkVolumeUpdates {
  title?: string;
  waitDuration?: number;
  isFinalPaywall?: boolean;
  publishedAt?: string | null;
  isFree?: boolean;
}

export default function BulkEditVolumeModal({
  isOpen,
  onClose,
  onSubmit,
  selectedCount,
}: BulkEditVolumeModalProps) {
  const [formData, setFormData] = useState<{
   
    updateWaitDuration: boolean;
    waitDuration: number;
    updateIsFinalPaywall: boolean;
    isFinalPaywall: boolean;
    updatePublishedAt: boolean;
    publishedAt: string;
    updateIsFree: boolean;
    isFree: boolean;
  }>({
    updateWaitDuration: false,
    waitDuration: 24,
    updateIsFinalPaywall: false,
    isFinalPaywall: false,
    updatePublishedAt: false,
    publishedAt: '',
    updateIsFree: false,
    isFree: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: BulkVolumeUpdates = {};


      if (formData.updateWaitDuration) {
        updates.waitDuration = formData.waitDuration * 60 * 60 * 1000; // Convert hours to ms
      }

      if (formData.updateIsFinalPaywall) {
        updates.isFinalPaywall = formData.isFinalPaywall;
      }

      if (formData.updateIsFree) {
        updates.isFree = formData.isFree;
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
      updateWaitDuration: false,
      waitDuration: 24,
      updateIsFinalPaywall: false,
      isFinalPaywall: false,
      updatePublishedAt: false,
      publishedAt: '',
      updateIsFree: false,
      isFree: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Édition en masse">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>{selectedCount}</strong> volume(s) sélectionné(s)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Cochez les champs que vous souhaitez modifier. Seuls les champs cochés seront mis à jour.
            </p>
          </div>

         
          {/* Wait Duration */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updateWaitDuration}
                onChange={(e) => setFormData({ ...formData, updateWaitDuration: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Modifier la durée d'attente</span>
            </label>
            {formData.updateWaitDuration && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={formData.waitDuration}
                  onChange={(e) => setFormData({ ...formData, waitDuration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">heures</span>
              </div>
            )}
          </div>

          {/* Is Free */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updateIsFree}
                onChange={(e) => setFormData({ ...formData, updateIsFree: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Modifier la gratuité des volumes</span>
            </label>
            {formData.updateIsFree && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Est un volume gratuit</span>
              </label>
            )}
          </div>

          {/* Is Final Paywall */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updateIsFinalPaywall}
                onChange={(e) => setFormData({ ...formData, updateIsFinalPaywall: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Modifier le statut paywall final</span>
            </label>
            {formData.updateIsFinalPaywall && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFinalPaywall}
                  onChange={(e) => setFormData({ ...formData, isFinalPaywall: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Est un paywall final (volume 11+)</span>
              </label>
            )}
          </div>

          {/* Published At */}
          <div className="border border-gray-200 rounded-md p-3">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={formData.updatePublishedAt}
                onChange={(e) => setFormData({ ...formData, updatePublishedAt: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Modifier la date de publication</span>
            </label>
            {formData.updatePublishedAt && (
              <input
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
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
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || (!formData.updateIsFree && !formData.updateWaitDuration && !formData.updateIsFinalPaywall && !formData.updatePublishedAt)}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mise à jour...' : `Mettre à jour ${selectedCount} volume(s)`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
