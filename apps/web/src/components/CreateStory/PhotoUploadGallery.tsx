import React, { useRef } from 'react';
import toast from 'react-hot-toast';
import { MdClose, MdImage } from 'react-icons/md';

interface PhotoUploadGalleryProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  maxSizeMb?: number;
}

export default function PhotoUploadGallery({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  maxSizeMb = 5,
}: PhotoUploadGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const validFiles: File[] = [];
    let remainingSlots = maxPhotos - photos.length;

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

    // Read all valid files in parallel
    const readPromises = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          resolve(dataUrl);
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const dataUrls = await Promise.all(readPromises);
      onPhotosChange([...photos, ...dataUrls]);
    } catch (error) {
      toast.error('Erreur lors du chargement des images');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold  text-charcoal dark:text-white italic uppercase tracking-wider">
          Galerie de Références
        </label>
      <div className="flex justify-between items-center">
        
        <span className="text-xs text-gray-500">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {/* Mini Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative group">
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MdClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
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
