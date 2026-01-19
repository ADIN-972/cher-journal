import { useState, useEffect } from "react";
import {
  MdDelete,
  MdImage,
  MdColorLens,
  MdFileUpload,
  MdAssignmentInd,
  MdLabel,
  MdAdd,
  MdClose,
} from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import ImageUpload from "./ImageUpload";
import ConfirmDialog from "./ConfirmDialog";
import AssetFilters, { FilterState } from "./AssetFilters";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface AssetTag {
  tag: Tag;
}

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
  isChapterCover?: boolean; // Is used as chapter cover/illustration
  usedByVolumes?: string[]; // List of volume IDs using this as illustration
  usedByVersions?: string[]; // List of version IDs using this as illustration
  tags?: AssetTag[];
}

type ChapterImageGalleryProps = {
  chapterId: string;
  chapter?: any;
  volumes?: any[];
  onAssignClick?: (assetId: string) => void;
};

export default function ChapterImageGallery({
  chapterId,
  chapter: _chapter,
  volumes,
  onAssignClick,
}: ChapterImageGalleryProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [taggingAsset, setTaggingAsset] = useState<Asset | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadAssets();
    loadTags();
  }, [chapterId]);

  useEffect(() => {
    loadAssets();
  }, [filters]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters.kind) params.append("kind", filters.kind);
      if (filters.search) params.append("search", filters.search);
      if (filters.tagIds && filters.tagIds.length > 0) {
        filters.tagIds.forEach((tagId) => params.append("tagIds", tagId));
      }
      if (filters.showDuplicates) params.append("showDuplicates", "true");

      const queryString = params.toString();
      const url = `/admin/chapters/${chapterId}/assets${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      setAssets(response.data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des images");
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await api.get("/admin/asset-tags");
      setAvailableTags(response.data);
    } catch (error: any) {
      console.error("Error loading tags:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAsset) return;
    try {
      await api.delete(
        `/admin/chapters/${chapterId}/assets/${deletingAsset.id}`
      );
      toast.success("Image supprimée avec succès");
      await loadAssets();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleAssetKind = async (asset: Asset) => {
    const newKind = asset.kind === "IMAGE" ? "COLORING_PAGE" : "IMAGE";
    try {
      await api.patch(`/admin/chapters/${chapterId}/assets/${asset.id}`, {
        kind: newKind,
      });
      toast.success(
        `Image marquée comme ${newKind === "COLORING_PAGE" ? "page à colorier" : "image"}`
      );
      await loadAssets();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleUploadSuccess = async () => {
    setShowUpload(false);
    await loadAssets();
  };

  const handleTagAsset = async (assetId: string, tagId: string) => {
    try {
      await api.post(`/admin/assets/${assetId}/tags`, { tagId });
      toast.success("Tag ajouté avec succès");
      await loadAssets();
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout du tag");
    }
  };

  const handleUntagAsset = async (assetId: string, tagId: string) => {
    try {
      await api.delete(`/admin/assets/${assetId}/tags/${tagId}`);
      toast.success("Tag retiré avec succès");
      await loadAssets();
    } catch (error: any) {
      toast.error("Erreur lors du retrait du tag");
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div>
      {/* Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MdFileUpload className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Ajouter des images
              </h3>
              <p className="text-sm text-blue-700">
                Téléchargez des images ou des pages à colorier pour ce chapitre
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            {showUpload ? "Annuler" : "Télécharger"}
          </button>
        </div>

        {showUpload && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <ImageUpload
              chapterId={chapterId}
              onUploadSuccess={handleUploadSuccess}
              multiple={true}
            />
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="mb-6">
        <AssetFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {assets.length} résultat{assets.length > 1 ? "s" : ""}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Chargement des images...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MdImage className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 text-center">
            Aucune image ne correspond aux filtres sélectionnés
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Télécharger une image
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              {/* Image Container */}
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

              {/* Badge */}
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

              {/* Delete Button */}
              <button
                onClick={() => setDeletingAsset(asset)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                title="Supprimer">
                <MdDelete className="w-4 h-4" />
              </button>

              {/* Toggle Kind Button */}
              <button
                onClick={() => toggleAssetKind(asset)}
                className="absolute top-12 right-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                title={
                  asset.kind === "IMAGE"
                    ? "Marquer comme coloriage"
                    : "Marquer comme image"
                }>
                {asset.kind === "IMAGE" ? (
                  <MdColorLens className="w-4 h-4" />
                ) : (
                  <MdImage className="w-4 h-4" />
                )}
              </button>

              {/* Attribution Button */}
              <button
                onClick={() => onAssignClick?.(asset.id)}
                className="absolute top-[5.5rem] right-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                title="Attribuer à un volume ou au chapitre">
                <MdAssignmentInd className="w-4 h-4" />
              </button>

              {/* Tag Button */}
              <button
                onClick={() => setTaggingAsset(asset)}
                className="absolute top-[8rem] right-2 bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-colors"
                title="Gérer les tags">
                <MdLabel className="w-4 h-4" />
              </button>

              {/* Info Section */}
              <div className="p-3 border-t border-gray-200">
                {asset.label && (
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {asset.label}
                  </p>
                )}

                {/* Tags Display */}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {asset.tags.map((assetTag) => (
                      <span
                        key={assetTag.tag.id}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white"
                        style={{
                          backgroundColor: assetTag.tag.color || "#3B82F6",
                        }}>
                        <span>{assetTag.tag.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    {asset.width && asset.height
                      ? `${asset.width}×${asset.height}px`
                      : "Dimension inconnue"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(asset.sizeBytes)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(asset.createdAt).toLocaleDateString("fr-FR")}
                  </p>

                  {/* Usage Info */}
                  {asset.isChapterCover ||
                  asset.usedByVolumes?.length ||
                  asset.usedByVersions?.length ? (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      {asset.isChapterCover && (
                        <p className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          Illustration chapitre
                        </p>
                      )}
                      {asset.usedByVolumes &&
                        asset.usedByVolumes.length > 0 &&
                        asset.usedByVolumes.map((volumeId) => {
                          const volume = volumes?.find(
                            (v) => v.id === volumeId
                          );
                          return (
                            <p
                              key={volumeId}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              Illustration volume {volume?.volumeNumber || "?"}
                            </p>
                          );
                        })}
                      {asset.usedByVersions &&
                        asset.usedByVersions.length > 0 && (
                          <p className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                            Illustration version {asset.usedByVersions.length}
                          </p>
                        )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                      Non utilisée
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'image"
        message={
          deletingAsset
            ? `Êtes-vous sûr de vouloir supprimer cette image ${deletingAsset.kind === "COLORING_PAGE" ? "(page à colorier)" : ""} ? Cette action est irréversible.`
            : ""
        }
        confirmText="Supprimer"
        danger
      />

      {/* Tag Management Modal */}
      {taggingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gérer les tags
              </h3>
              <button
                onClick={() => setTaggingAsset(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {taggingAsset.label && (
              <p className="text-sm text-gray-600 mb-4">
                Image: {taggingAsset.label}
              </p>
            )}

            {/* Current Tags */}
            {taggingAsset.tags && taggingAsset.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Tags actuels:
                </p>
                <div className="flex flex-wrap gap-2">
                  {taggingAsset.tags.map((assetTag) => (
                    <button
                      key={assetTag.tag.id}
                      onClick={() =>
                        handleUntagAsset(taggingAsset.id, assetTag.tag.id)
                      }
                      className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: assetTag.tag.color || "#3B82F6",
                      }}>
                      <span>{assetTag.tag.name}</span>
                      <MdClose className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Ajouter un tag:
              </p>
              {availableTags.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun tag disponible. Créez des tags dans les paramètres.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter(
                      (tag) =>
                        !taggingAsset.tags?.some((at) => at.tag.id === tag.id)
                    )
                    .map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagAsset(taggingAsset.id, tag.id)}
                        className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || "#3B82F6" }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {tag.name}
                        </span>
                        <MdAdd className="w-4 h-4 text-gray-600" />
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setTaggingAsset(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
