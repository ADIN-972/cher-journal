import { useEffect, useState } from 'react';

interface ColoringPage {
  id: string;
  title: string;
  pageNumber: number;
  thumbnailUrl?: string;
  isAvailable: boolean;
}

interface ColoringGalleryProps {
  chapterId: string;
}

export default function ColoringGallery({ chapterId }: ColoringGalleryProps) {
  const [coloringPages, setColoringPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch coloring pages from API once implemented
    // For now, we'll show a coming soon message
    setIsLoading(false);
  }, [chapterId]);

  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8">
      {/* Coming Soon Section */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border-2 border-rose-200 p-12 sm:p-16 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-md">
            <svg
              className="w-12 h-12 text-rose-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-rose-900 mb-4">
            Livre de Coloriage
          </h2>

          {/* Description */}
          <p className="text-lg text-rose-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Explorez notre collection exclusive de pages à colorier inspirées par l'histoire de ce chapitre. Une expérience créative et relaxante vous attend très bientôt.
          </p>

          {/* Badge */}
          <div className="inline-block bg-white px-6 py-2 rounded-full border border-rose-300 mb-8">
            <span className="text-rose-600 font-semibold">Bientôt disponible</span>
          </div>

          {/* Info Text */}
          <p className="text-sm text-rose-600 italic">
            Cette fonctionnalité arrive prochainement. Revenez-nous bientôt !
          </p>
        </div>

        {/* Future Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-rose-100">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Designs Exclusifs</h3>
            <p className="text-sm text-gray-600">
              Coloriages spécialement conçus pour ce chapitre
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-rose-100">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="font-semibold text-gray-900 mb-2">Téléchargement</h3>
            <p className="text-sm text-gray-600">
              Téléchargez et imprimez vos pages préférées
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-rose-100">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Partage</h3>
            <p className="text-sm text-gray-600">
              Partagez vos créations avec la communauté
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
