import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import type { Volume } from "@cher-journal/types";
import toast from "react-hot-toast";

type BulkEditTitlesDrawerProps = {
  isOpen: boolean;
  volumes: Volume[];
  onClose: () => void;
  onSave: (updates: Record<string, string>) => Promise<void>;
};

export default function BulkEditTitlesDrawer({
  isOpen,
  volumes,
  onClose,
  onSave,
}: BulkEditTitlesDrawerProps) {
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize titles from volumes
    const initialTitles: Record<string, string> = {};
    volumes.forEach((volume) => {
      initialTitles[volume.id] =
        volume.title || `Volume ${volume.volumeNumber}`;
    });
    setTitles(initialTitles);
  }, [volumes, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(titles);
      toast.success("Titres des volumes mis à jour");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Éditer les titres</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {volumes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun volume à éditer
            </p>
          ) : (
            volumes.map((volume) => (
              <div
                key={volume.id}
                className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Volume {volume.volumeNumber}
                </label>
                <input
                  type="text"
                  value={titles[volume.id] || ""}
                  onChange={(e) =>
                    setTitles({
                      ...titles,
                      [volume.id]: e.target.value,
                    })
                  }
                  placeholder={`Titre du volume ${volume.volumeNumber}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
