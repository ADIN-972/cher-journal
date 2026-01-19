import { useState, useEffect } from "react";
import {
  MdContentCopy,
  MdDelete,
  MdClose,
  MdImage,
  MdColorLens,
  MdWarning,
} from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";

interface Asset {
  id: string;
  kind: "IMAGE" | "COLORING_PAGE";
  label: string | null;
  objectKey: string;
  thumbnailObjectKey?: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  isChapterCover?: boolean;
  usedByVolumes?: string[];
  usedByVersions?: string[];
}

interface DuplicateGroup {
  sha256: string;
  count: number;
  assets: Asset[];
}

interface DuplicateManagerProps {
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  onAssetsDeleted?: () => void;
}

export default function DuplicateManager({
  chapterId,
  isOpen,
  onClose,
  onAssetsDeleted,
}: DuplicateManagerProps) {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDuplicates();
    }
  }, [isOpen, chapterId]);

  const loadDuplicates = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/admin/chapters/${chapterId}/assets/duplicates`
      );
      setDuplicateGroups(response.data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des doublons");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    setDeletingAssetId(assetId);
    try {
      await api.delete(`/admin/chapters/${chapterId}/assets/${assetId}`);
      toast.success("Image supprimée avec succès");
      await loadDuplicates();
      onAssetsDeleted?.();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingAssetId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTotalDuplicates = () => {
    return duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
  };

  const getTotalWastedSpace = () => {
    return duplicateGroups.reduce((sum, group) => {
      const firstAssetSize = group.assets[0]?.sizeBytes || 0;
      return sum + firstAssetSize * (group.count - 1);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MdContentCopy className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Doublons
              </h2>
              <p className="text-sm text-gray-500">
                Fichiers identiques détectés par leur empreinte (SHA256)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Analyse des doublons...</div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Summary Stats */}
            {duplicateGroups.length > 0 && (
              <div className="p-6 bg-orange-50 border-b border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {duplicateGroups.length}
                    </div>
                    <div className="text-sm text-orange-700">
                      Groupe{duplicateGroups.length > 1 ? "s" : ""} de doublons
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {getTotalDuplicates()}
                    </div>
                    <div className="text-sm text-orange-700">
                      Fichier{getTotalDuplicates() > 1 ? "s" : ""} en double
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {formatFileSize(getTotalWastedSpace())}
                    </div>
                    <div className="text-sm text-orange-700">
                      Espace récupérable
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duplicate Groups */}
            <div className="flex-1 overflow-y-auto p-6">
              {duplicateGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MdContentCopy className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500 mb-2">
                    Aucun doublon détecté
                  </p>
                  <p className="text-sm text-gray-400">
                    Tous vos fichiers sont uniques !
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {duplicateGroups.map((group, groupIndex) => (
                    <div
                      key={group.sha256}
                      className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-full font-semibold text-sm">
                              {groupIndex + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {group.count} copies identiques
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                SHA256: {group.sha256.substring(0, 16)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatFileSize(
                              group.assets[0]?.sizeBytes || 0
                            )}{" "}
                            chacun
                          </div>
                        </div>
                      </div>

                      {/* Assets Grid */}
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {group.assets.map((asset) => (
                            <div
                              key={asset.id}
                              className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              {/* Image Preview */}
                              <div className="aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                                <img
                                  src={
                                    asset.thumbnailObjectKey
                                      ? `/uploads/${asset.thumbnailObjectKey}`
                                      : `/uploads/${asset.objectKey}`
                                  }
                                  alt={asset.label || "Image"}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Kind Badge */}
                              <div className="absolute top-2 left-2">
                                {asset.kind === "COLORING_PAGE" ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                                    <MdColorLens className="w-3 h-3" />
                                    <span>Coloriage</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                                    <MdImage className="w-3 h-3" />
                                    <span>Image</span>
                                  </span>
                                )}
                              </div>

                              {/* Usage Warning Badge */}
                              {(asset.isChapterCover ||
                                asset.usedByVolumes?.length ||
                                asset.usedByVersions?.length) && (
                                <div className="absolute top-2 right-2">
                                  <span
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium"
                                    title="Cette image est utilisée">
                                    <MdWarning className="w-3 h-3" />
                                  </span>
                                </div>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                disabled={deletingAssetId === asset.id}
                                className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${
                                  deletingAssetId === asset.id
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                                title="Supprimer cette copie">
                                <MdDelete className="w-4 h-4" />
                              </button>

                              {/* Info */}
                              <div className="p-3 border-t border-gray-200">
                                {asset.label && (
                                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                    {asset.label}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {asset.width && asset.height
                                    ? `${asset.width}×${asset.height}px`
                                    : "Dimension inconnue"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {new Date(asset.createdAt).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </p>

                                {/* Usage Info */}
                                {(asset.isChapterCover ||
                                  asset.usedByVolumes?.length ||
                                  asset.usedByVersions?.length) && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <p className="text-xs text-yellow-700 font-medium">
                                      ⚠️ Utilisée
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Astuce: Gardez une copie et supprimez les autres pour libérer
              de l'espace
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
