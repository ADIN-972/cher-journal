import { useState, useRef, ChangeEvent } from "react";
import { MdCloudUpload, MdImage, MdClose } from "react-icons/md";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUploadSuccess?: (asset: any | any[]) => void;
  chapterId?: string;
  kind?: "IMAGE" | "COLORING_PAGE";
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  className?: string;
  multiple?: boolean;
}

export default function ImageUpload({
  onUploadSuccess,
  chapterId,
  kind = "IMAGE",
  label,
  accept = "image/png,image/jpeg,image/webp",
  maxSizeMB = 10,
  preview = true,
  className = "",
  multiple = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Type de fichier non accepté. Formats acceptés : ${accept}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Le fichier est trop volumineux. Taille maximale : ${maxSizeMB} MB`;
    }

    return null;
  };

  const handleUpload = async (files: File[]) => {
    if (!chapterId) {
      toast.error("ID du chapitre requis");
      return;
    }

    // Validate all files
    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Create previews
      if (preview) {
        const newPreviews: string[] = [];
        let loadedCount = 0;

        for (const file of validFiles) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            loadedCount++;
            if (loadedCount === validFiles.length) {
              setPreviewUrls((prev) => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        }
      }

      // Upload each file
      const uploadedAssets: any[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("chapterId", chapterId);
        formData.append("kind", kind);
        if (label) {
          formData.append("label", label);
        }

        const response = await fetch("/api/admin/assets/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(
            `${file.name}: ${errorData.error?.message || "Erreur lors de l'upload"}`
          );
          continue;
        }

        const result = await response.json();
        uploadedAssets.push(result.data);
      }

      if (uploadedAssets.length > 0) {
        toast.success(
          `${uploadedAssets.length} image(s) uploadée(s) avec succès`
        );
        if (onUploadSuccess) {
          onUploadSuccess(multiple ? uploadedAssets : uploadedAssets[0]);
        }
      }

      return uploadedAssets.length > 0
        ? multiple
          ? uploadedAssets
          : uploadedAssets[0]
        : null;
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
      setPreviewUrls([]);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleUpload(Array.from(files));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleUpload(Array.from(files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = (index?: number) => {
    if (index !== undefined) {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPreviewUrls([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
        multiple={multiple}
        title="Sélectionner des fichiers"
      />

      {previewUrls.length > 0 ? (
        <div>
          {multiple ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => handleClearPreview(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    title="Supprimer cette image"
                    disabled={uploading}>
                    <MdClose className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <img
                src={previewUrls[0]}
                alt="Preview"
                className="w-full h-64 object-contain border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={() => handleClearPreview()}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                title="Supprimer l'aperçu">
                <MdClose className="w-4 h-4" />
              </button>
            </div>
          )}
          {uploading && (
            <div className="mt-4 bg-black bg-opacity-50 flex items-center justify-center rounded-lg p-4">
              <div className="bg-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Upload en cours...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}>
          {uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 font-medium">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              {dragActive ? (
                <MdCloudUpload className="w-16 h-16 text-blue-600" />
              ) : (
                <MdImage className="w-16 h-16 text-gray-400" />
              )}
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Cliquez pour sélectionner ou glissez-déposez
                </p>
                <p className="text-sm text-gray-500">
                  {accept
                    .split(",")
                    .map((t) => t.split("/")[1])
                    .join(", ")
                    .toUpperCase()}{" "}
                  - Max {maxSizeMB} MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
