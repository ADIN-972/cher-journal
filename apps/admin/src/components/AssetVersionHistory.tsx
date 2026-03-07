import { useState, useEffect } from "react";
import {
  MdHistory,
  MdClose,
  MdImage,
  MdColorLens,
  MdFileUpload,
  MdDownload,
} from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
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
  version: number;
  originalAssetId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AssetVersionHistoryProps {
  assetId: string;
  isOpen: boolean;
  onClose: () => void;
  onVersionCreated?: () => void;
}

export default function AssetVersionHistory({
  assetId,
  isOpen,
  onClose,
  onVersionCreated,
}: AssetVersionHistoryProps) {
  const [versions, setVersions] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionLabel, setVersionLabel] = useState("");

  useEffect(() => {
    if (isOpen && assetId) {
      loadVersions();
    }
  }, [isOpen, assetId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/assets/${assetId}/versions`);
      setVersions(response.data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des versions");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleCreateVersion = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (versionLabel) {
        formData.append("label", versionLabel);
      }

      await api.post(`/admin/assets/${assetId}/versions`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Nouvelle version créée avec succès");
      setSelectedFile(null);
      setVersionLabel("");
      await loadVersions();
      onVersionCreated?.();
    } catch (error: any) {
      toast.error("Erreur lors de la création de la version");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getVersionBadgeColor = (version: Asset, index: number) => {
    if (index === 0) return "bg-green-500"; // Latest version
    if (version.version === 1) return "bg-blue-500"; // Original version
    return "bg-gray-500"; // Intermediate versions
  };

  const getVersionLabel = (version: Asset, index: number) => {
    if (index === 0) return "Version actuelle";
    if (version.version === 1) return "Version originale";
    return `Version ${version.version}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MdHistory className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Historique des Versions
              </h2>
              <p className="text-sm text-gray-500">
                Toutes les versions de cet asset
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
            <div className="text-gray-500">Chargement des versions...</div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Upload New Version Section */}
            <div className="p-6 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start space-x-4">
                <MdFileUpload className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Créer une nouvelle version
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Téléchargez une nouvelle version de cet asset. La version
                    actuelle sera conservée dans l'historique.
                  </p>

                  <div className="space-y-3">
                    {/* File Input */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Fichier
                      </label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
                      />
                      {selectedFile && (
                        <p className="mt-1 text-xs text-blue-700">
                          Fichier sélectionné: {selectedFile.name} (
                          {formatFileSize(selectedFile.size)})
                        </p>
                      )}
                    </div>

                    {/* Label Input */}
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Label (optionnel)
                      </label>
                      <input
                        type="text"
                        value={versionLabel}
                        onChange={(e) => setVersionLabel(e.target.value)}
                        placeholder="Ex: Correction couleurs, Version finale..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Upload Button */}
                    <button
                      onClick={handleCreateVersion}
                      disabled={!selectedFile || uploading}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        !selectedFile || uploading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}>
                      <MdFileUpload className="w-5 h-5" />
                      <span>
                        {uploading
                          ? "Téléchargement..."
                          : "Créer la nouvelle version"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MdHistory className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg text-gray-500 mb-2">
                    Aucune version trouvée
                  </p>
                  <p className="text-sm text-gray-400">
                    Cet asset n'a qu'une seule version
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {versions.length} version{versions.length > 1 ? "s" : ""}{" "}
                    trouvée{versions.length > 1 ? "s" : ""}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Image Preview */}
                        <div className="aspect-square bg-gray-100  overflow-hidden flex items-center justify-center">
                          <img
                            src={getImageUrl(version)}
                            alt={version.label || "Version"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Version Badge */}
                        <div className="absolute top-2 left-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 ${getVersionBadgeColor(
                              version,
                              index,
                            )} text-white rounded-full text-xs font-bold`}>
                            <span>v{version.version}</span>
                          </span>
                        </div>

                        {/* Kind Badge */}
                        <div className="absolute top-2 right-2">
                          {version.kind === "COLORING_PAGE" ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                              <MdColorLens className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                              <MdImage className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Download Button */}
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'https://api.moncherjournal.com'}/uploads/${version.objectKey}`}
                          download
                          className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Télécharger cette version">
                          <MdDownload className="w-4 h-4" />
                        </a>

                        {/* Info */}
                        <div className="p-3 border-t-2 border-gray-200">
                          <div
                            className={`text-xs font-semibold mb-1 ${
                              index === 0
                                ? "text-green-700"
                                : version.version === 1
                                  ? "text-blue-700"
                                  : "text-gray-700"
                            }`}>
                            {getVersionLabel(version, index)}
                          </div>

                          {version.label && (
                            <p className="text-sm font-medium text-gray-900 truncate mb-2">
                              {version.label}
                            </p>
                          )}

                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                              {version.width && version.height
                                ? `${version.width}×${version.height}px`
                                : "Dimension inconnue"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(version.sizeBytes)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Créé le{" "}
                              {new Date(version.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            {version.updatedAt !== version.createdAt && (
                              <p className="text-xs text-gray-400">
                                Modifié le{" "}
                                {new Date(version.updatedAt).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Les versions précédentes sont conservées et peuvent être
              téléchargées
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
