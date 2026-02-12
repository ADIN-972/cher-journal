import type { Chapter, Volume } from "@cher-journal/types";
import { MdClose } from "react-icons/md";
import { useState } from "react";
import toast from "react-hot-toast";

type DragDropOverlayProps = {
  isVisible: boolean;
  chapter: Chapter | null;
  volumes: Volume[];
  onDrop: (volumeId: string | null, assetId: string) => Promise<void>;
  onClose: () => void;
  assetId: string | null;
};

export default function DragDropOverlay({
  isVisible,
  chapter,
  volumes,
  onDrop,
  onClose,
  assetId,
}: DragDropOverlayProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isVisible || !chapter || !assetId) return null;

  const handleDrop = async (targetId: string | null) => {
    setIsProcessing(true);
    try {
      await onDrop(targetId, assetId);
      toast.success(
        targetId ? "Image attribuée au volume" : "Image attribuée au chapitre",
      );
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'attribution de l'image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className=" bg-background-light dark:bg-background-dark border border-slate-200 dark:border-white/10  rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Attribuer l'image à:
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Chapitre */}
        <div className="mb-6">
          <button
            onClick={() => handleDrop(null)}
            disabled={isProcessing}
            onMouseEnter={() => setHoveredId("chapter")}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-full p-6 border-2 rounded-lg cursor-pointer transition-all ${
              hoveredId === "chapter"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : " bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
            } disabled:opacity-50 disabled:cursor-not-allowed`}>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white text-left">
              📚 {chapter.title}
            </h3>
            <p className="text-sm text-slate-900 dark:text-white/50 mt-1 text-left">
              Image de couverture du chapitre
            </p>
          </button>
        </div>

        {/* Volumes */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Volumes:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {volumes.map((volume) => (
              <button
                key={volume.id}
                onClick={() => handleDrop(volume.id)}
                disabled={isProcessing}
                onMouseEnter={() => setHoveredId(volume.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  hoveredId === volume.id
                    ? "border-green-500 bg-green-50 shadow-md"
                    : " bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                } disabled:opacity-50 disabled:cursor-not-allowed`}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    #{volume.volumeNumber}
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white/50 line-clamp-2">
                    {volume.title || `Volume ${volume.volumeNumber}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isProcessing}
          className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Fermer
        </button>
      </div>
    </div>
  );
}
