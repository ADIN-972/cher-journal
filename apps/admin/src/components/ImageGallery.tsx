import { useState, useEffect } from "react";
import { MdDelete, MdImage, MdColorLens } from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import ImageUpload from "./ImageUpload";
import ConfirmDialog from "./ConfirmDialog";
import { getImageUrl } from "../lib/imageUtils";

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
}

interface ImageGalleryProps {
  chapterId: string;
  showUpload?: boolean;
  onSelectImage?: (asset: Asset) => void;
}

export default function ImageGallery({
  chapterId,
  showUpload = true,
  onSelectImage,
}: ImageGalleryProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [filter, setFilter] = useState<"ALL" | "IMAGE" | "COLORING_PAGE">(
    "ALL"
  );

  useEffect(() => {
    loadAssets();
  }, [chapterId]);

  const loadAssets = async () => {
    try {
      const response = await api.get(`/admin/chapters/${chapterId}/assets`);
      setAssets(response.data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des images");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (asset: Asset) => {
    setAssets([asset, ...assets]);
  };

  const handleDelete = async () => {
    if (!deletingAsset) return;

    try {
      await api.delete(`/admin/assets/${deletingAsset.id}`);
      toast.success("Image supprimée avec succès");
      setAssets(assets.filter((a) => a.id !== deletingAsset.id));
      setDeletingAsset(null);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredAssets =
    filter === "ALL" ? assets : assets.filter((a) => a.kind === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {showUpload && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Uploader une nouvelle image
          </h3>
          <ImageUpload
            chapterId={chapterId}
            onUploadSuccess={handleUploadSuccess}
            multiple={true}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filtrer :</span>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 text-sm rounded ${
            filter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}>
          Tout ({assets.length})
        </button>
        <button
          onClick={() => setFilter("IMAGE")}
          className={`px-3 py-1 text-sm rounded flex items-center space-x-1 ${
            filter === "IMAGE"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}>
          <MdImage className="w-4 h-4" />
          <span>
            Images ({assets.filter((a) => a.kind === "IMAGE").length})
          </span>
        </button>
        <button
          onClick={() => setFilter("COLORING_PAGE")}
          className={`px-3 py-1 text-sm rounded flex items-center space-x-1 ${
            filter === "COLORING_PAGE"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}>
          <MdColorLens className="w-4 h-4" />
          <span>
            Coloriages (
            {assets.filter((a) => a.kind === "COLORING_PAGE").length})
          </span>
        </button>
      </div>

      {/* Gallery */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MdImage className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>Aucune image disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div
                className={`aspect-square bg-gray-100 flex items-center justify-center overflow-hidden ${
                  onSelectImage ? "cursor-pointer" : ""
                }`}
                onClick={() => onSelectImage?.(asset)}>
                <img
                  src={getImageUrl(asset)}
                  alt={asset.label || "Asset"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-3">
                {asset.label && (
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {asset.label}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {asset.width && asset.height
                      ? `${asset.width}×${asset.height}`
                      : "N/A"}
                  </span>
                  <span>{formatFileSize(asset.sizeBytes)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      asset.kind === "IMAGE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                    {asset.kind === "IMAGE" ? "Image" : "Coloriage"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setDeletingAsset(asset)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                  title="Supprimer">
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDelete}
        title="Supprimer l'image"
        message={
          <>
            Êtes-vous sûr de vouloir supprimer cette image ?
            <br />
            <span className="text-red-600">Cette action est irréversible.</span>
          </>
        }
        confirmText="Supprimer"
        danger
      />
    </div>
  );
}
