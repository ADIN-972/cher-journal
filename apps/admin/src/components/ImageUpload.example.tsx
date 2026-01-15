// Exemple d'utilisation des composants d'upload d'images

import { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ImageGallery from '../components/ImageGallery';
import Modal from '../components/Modal';

// Dans un composant (ex: ChapterDetail, VolumeForm, etc.)

export default function ExampleUsage() {
  const [showGallery, setShowGallery] = useState(false);
  const chapterId = 'your-chapter-id';

  // 1. Upload simple avec preview
  const handleSimpleUpload = (asset: any) => {
    console.log('Image uploadée:', asset);
    // Faire quelque chose avec l'asset (ex: associer à un volume)
  };

  // 2. Galerie d'images avec sélection
  const handleSelectImage = (asset: any) => {
    console.log('Image sélectionnée:', asset);
    // Utiliser l'image (ex: définir comme illustration)
    setShowGallery(false);
  };

  return (
    <div className="space-y-6">
      {/* Simple upload */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Upload simple</h3>
        <ImageUpload
          chapterId={chapterId}
          onUploadSuccess={handleSimpleUpload}
          kind="IMAGE"
          maxSizeMB={5}
        />
      </div>

      {/* Bouton pour ouvrir la galerie */}
      <button
        onClick={() => setShowGallery(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Gérer les images
      </button>

      {/* Modal avec galerie complète */}
      <Modal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        title="Galerie d'images"
      >
        <ImageGallery
          chapterId={chapterId}
          showUpload={true}
          onSelectImage={handleSelectImage}
        />
      </Modal>
    </div>
  );
}

// ===== Utilisation dans VolumeForm =====
// Pour associer une illustration à un volume:

interface VolumeFormData {
  title: string;
  illustrationAssetId: string | null;
  // ... autres champs
}

function VolumeFormExample() {
  const [formData, setFormData] = useState<VolumeFormData>({
    title: '',
    illustrationAssetId: null,
  });
  const [showImageSelector, setShowImageSelector] = useState(false);

  const handleSelectIllustration = (asset: any) => {
    setFormData({ ...formData, illustrationAssetId: asset.id });
    setShowImageSelector(false);
  };

  return (
    <div>
      {/* Champ illustration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Illustration du volume
        </label>
        {formData.illustrationAssetId ? (
          <div className="relative inline-block">
            <img
              src={`/uploads/${formData.illustrationAssetId}`}
              alt="Illustration"
              className="h-32 rounded border"
            />
            <button
              onClick={() => setFormData({ ...formData, illustrationAssetId: null })}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowImageSelector(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400"
          >
            Choisir une image
          </button>
        )}
      </div>

      <Modal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        title="Sélectionner une illustration"
      >
        <ImageGallery
          chapterId="chapter-id"
          showUpload={true}
          onSelectImage={handleSelectIllustration}
        />
      </Modal>
    </div>
  );
}
