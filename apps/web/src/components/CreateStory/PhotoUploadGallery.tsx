import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MdClose, MdImage } from 'react-icons/md';
import { api } from '../../lib/api';

interface PhotoUploadGalleryProps {
  photos: string[]; // asset IDs
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  maxSizeMb?: number;
}

interface PhotoPreview {
  url: string; // uploaded image URL from server
  dataUrl: string; // local preview URL (used while uploading)
  isUploading?: boolean;
}

export default function PhotoUploadGallery({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  maxSizeMb = 5,
}: PhotoUploadGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const validFiles: File[] = [];
    let remainingSlots = maxPhotos - (photos.length + previews.length);

    // Validate all files first
    for (const file of files) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error(`Format non supporté: ${file.name}. Utilisez JPG ou PNG.`);
        continue;
      }

      if (file.size > maxBytes) {
        toast.error(
          `Fichier trop gros: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB > ${maxSizeMb}MB)`
        );
        continue;
      }

      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxPhotos} photos autorisées`);
        break;
      }

      validFiles.push(file);
      remainingSlots--;
    }

    // Create data URLs and upload files in parallel
    const readPromises = validFiles.map((file) => {
      return new Promise<{ file: File; dataUrl: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          resolve({ file, dataUrl });
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const fileDataPairs = await Promise.all(readPromises);

      // Upload files in parallel
      const uploadPromises = fileDataPairs.map(async (pair) => {
        try {
          const formData = new FormData();
          formData.append('file', pair.file);
          formData.append('currentPhotoCount', String(photos.length + previews.length));

          const response = await api.upload('/custom-stories/photos/upload', formData);

          // Extract just the filename from the response
          // Backend returns id as filename, but if it contains a path, extract just the filename
          let id = response.data?.id || '';
          if (id && id.includes('/')) {
            id = id.split('/').pop() || '';
          }

          return {
            success: true,
            id,
            url: response.data?.url || '',
            dataUrl: pair.dataUrl,
          };
        } catch (error: any) {
          toast.error(`Erreur lors de l'upload de ${pair.file.name}`);
          return {
            success: false,
            id: '',
            url: '',
            dataUrl: pair.dataUrl,
          };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Filter successful uploads
      const successfulIds = uploadResults
        .filter((result) => result.success)
        .map((result) => result.url);

      const successfulPreviews = uploadResults
        .filter((result) => result.success)
        .map((result) => ({
          url: result.url,
          dataUrl: result.dataUrl,
          isUploading: false,
        }));

      // Update previews and photos
      setPreviews((prev) => [...prev, ...successfulPreviews]);

      // Update parent form data with asset IDs (filter out any data URLs from existing photos)
      const validPhotos = photos.filter((id) => !id.startsWith('data:'));
      onPhotosChange([...validPhotos, ...successfulIds]);

      if (successfulIds.length > 0) {
        toast.success(`${successfulIds.length} photo(s) uploadée(s)`);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des images');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    // Remove from uploaded photos
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const handleRemovePreview = (index: number) => {
    // Remove from local previews
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold  text-charcoal dark:text-white italic uppercase tracking-wider">
          Galerie de Références
        </label>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {photos.length + previews.length}/{maxPhotos} photos
        </span>
      </div>

      {/* Mini Gallery - Uploaded photos + Previews */}
      {(photos.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Uploaded photos */}
          {photos.map((photoUrl, idx) => (
            <div
              key={`uploaded-${idx}`}
              className="relative group">
              <img
                src={photoUrl}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdClose size={16} />
              </button>
            </div>
          ))}
          {/* Preview photos (being uploaded) */}
          {previews.map((preview, idx) => (
            <div
              key={`preview-${idx}`}
              className="relative group">
              <img
                src={preview.dataUrl}
                alt={`Preview ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg dark:border-gray-700 opacity-75"
              />
              {preview.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-red-500" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemovePreview(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {photos.length + previews.length < maxPhotos && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-red-400 transition-colors cursor-pointer text-center">
          <MdImage className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cliquez pour télécharger des photos
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPG/PNG max {maxSizeMb}MB par fichier
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple

            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
