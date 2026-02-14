import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { showInfoToast } from '../../lib/toastHelper';

interface Volume {
  id: string;
  title: string;
  volumeNumber: number;
  wordCount?: number;
  publishedAt?: string;
  price?: number;
  isPurchased?: boolean;
  canWaitToRead?: boolean;
}

interface VolumeListProps {
  volumes: Volume[];
  chapterTitle: string;
}

export default function VolumeList({ volumes, chapterTitle }: VolumeListProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loadingVolumeId, setLoadingVolumeId] = useState<string | null>(null);

  const handleRead = (volumeId: string) => {
    navigate(`/reader/${volumeId}`);
  };

  const handlePurchase = async (volumeId: string) => {
    setLoadingVolumeId(volumeId);
    // TODO: Implement purchase flow (Phase 4)
    console.log('Purchase volume:', volumeId);
    showInfoToast(toast, 'FEATURE_COMING_SOON_PURCHASE');
    setLoadingVolumeId(null);
  };

  const handleWaitToRead = async (volumeId: string) => {
    setLoadingVolumeId(volumeId);
    // TODO: Implement wait-to-read (Phase 4)
    console.log('Wait to read volume:', volumeId);
    showInfoToast(toast, 'FEATURE_COMING_SOON_WAIT');
    setLoadingVolumeId(null);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuit';
    return `${(price / 100).toFixed(2)} €`;
  };

  const formatWordCount = (count?: number) => {
    if (!count) return null;
    return `${count.toLocaleString('fr-FR')} mots`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Volumes de "{chapterTitle}"
      </h2>

      {volumes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucun volume disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {volumes.map((volume) => (
            <div
              key={volume.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Volume Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded">
                      Volume {volume.volumeNumber}
                    </span>
                    {volume.isPurchased && (
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                        ✓ Acheté
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {volume.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {volume.wordCount && (
                      <span>{formatWordCount(volume.wordCount)}</span>
                    )}
                    {volume.publishedAt && (
                      <span>
                        Publié le{' '}
                        {new Date(volume.publishedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="text-lg font-bold text-indigo-600">
                      {formatPrice(volume.price)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {volume.isPurchased ? (
                    <button
                      onClick={() => handleRead(volume.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Lire
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePurchase(volume.id)}
                        disabled={loadingVolumeId === volume.id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                      >
                        {loadingVolumeId === volume.id ? 'Chargement...' : 'Acheter'}
                      </button>

                      {volume.canWaitToRead && (
                        <button
                          onClick={() => handleWaitToRead(volume.id)}
                          disabled={loadingVolumeId === volume.id}
                          className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          {loadingVolumeId === volume.id
                            ? 'Chargement...'
                            : 'Attendre pour lire'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
