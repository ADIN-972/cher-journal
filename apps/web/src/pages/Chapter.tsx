import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { showErrorToast } from '../lib/toastHelper';
import api from '../lib/api';
import ReaderDrawer from '../components/ReaderDrawer';
import PurchaseDrawer from '../components/PurchaseDrawer';
import type { Chapter as ChapterType } from '../stores/catalogStore';

/**
 * Decorative Shelf SVG Component
 */
function ShelfSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="252.531" height="267.95" viewBox="0 0 252.531 267.95" className="w-full h-full">
      <defs>
        <linearGradient id="shelf-grad-1" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#e3dcce"/>
          <stop offset="1" stopColor="#ede5dc"/>
        </linearGradient>
        <linearGradient id="shelf-grad-2" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopOpacity="0.322"/>
          <stop offset="1" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="shelf-grad-3" x1="0.5" x2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopOpacity="0.722"/>
          <stop offset="1" stopColor="#545454" stopOpacity="0.588"/>
        </linearGradient>
        <linearGradient id="shelf-grad-4" x1="0.619" y1="0.169" x2="1" y2="0.11" gradientUnits="objectBoundingBox">
          <stop offset="0" stopOpacity="0.31"/>
          <stop offset="1" stopColor="#545454" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="shelf-grad-5" x1="-0.264" x2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopOpacity="0.502"/>
          <stop offset="1" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="shelf-grad-6" y1="0.552" x2="1" y2="0.552" gradientUnits="objectBoundingBox">
          <stop offset="0" stopOpacity="0"/>
          <stop offset="0.707" stopOpacity="0.439"/>
          <stop offset="1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <g transform="translate(0 0)">
        <path d="M10.039,0H241.274l11.077,29H0Z" fill="url(#shelf-grad-1)"/>
        <path d="M10.039,18.95H241.274L252.352,0H0Z" fill="url(#shelf-grad-2)"/>
        <rect width="252" height="8" y="29" fill="#f5f1eb"/>
        <g transform="translate(174 45)">
          <rect width="119" height="222" fill="#53273f"/>
          <path d="M0,0H155L112.027,21H0Z" fill="url(#shelf-grad-3)"/>
          <path d="M0,0H116.862L155,24V204H0Z" fill="url(#shelf-grad-4)"/>
          <rect width="119" height="217" fill="#fff" stroke="#d8d8d8" strokeWidth="1"/>
          <rect width="119" height="224" fill="#fff" stroke="#d8d8d8" strokeWidth="1" y="-4"/>
          <rect width="119" height="229" fill="#fff" stroke="#d8d8d8" strokeWidth="1" y="-8"/>
          <path d="M5,0H137a2,2,0,0,1,2,2V232a2,2,0,0,1-2,2H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z" fill="#53273f"/>
          <path d="M5,0h6a0,0,0,0,1,0,0V234a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z" fill="url(#shelf-grad-5)"/>
          <rect width="10" height="234" fill="url(#shelf-grad-6)" x="-11"/>
        </g>
      </g>
    </svg>
  );
}

/**
 * MODERN BOOKSHELF Chapter Page
 * Design inspired by premium online bookstores
 * - Featured volume with 3D perspective
 * - Grid of book cards with metadata
 * - Accessible and locked volume sections
 */

export default function Chapter() {
  const { id: chapterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [chapter, setChapter] = useState<ChapterType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<{ id: string; volumeNumber: number } | null>(null);
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false);
  const [selectedVolumeForPurchase, setSelectedVolumeForPurchase] = useState<any>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!chapterId) return;

    const fetchChapter = async () => {
      try {
        setLoading(true);
        const data = await api.getChapter(chapterId);
        setChapter(data);
        setError(null);
      } catch (err) {
        showErrorToast(toast, 'CHAPTER_NOT_FOUND');
        setError('Failed to load chapter');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId, toast]);

  const handleReadVolume = (volume: any) => {
    setSelectedVolume({
      id: volume.id,
      volumeNumber: volume.volumeNumber,
    });
    setReaderOpen(true);
  };

  const handlePurchaseVolume = (volumeNumber: number) => {
    const volume = chapter?.volumes?.find((v: any) => v.volumeNumber === volumeNumber);
    if (volume) {
      setSelectedVolumeForPurchase(volume);
      setPurchaseDrawerOpen(true);
    }
  };

  const handlePurchasePerspective = async (volumeNumber: number) => {
    if (!chapterId) return;
    try {
      setIsPurchasing(true);
      const { url } = await api.createCheckoutSession({
        chapterId,
        type: 'PERSPECTIVE',
        volumeNumber,
        successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
        cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
      });
      window.location.href = url;
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
      setIsPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-amber-200 border-t-eros-gold rounded-full animate-spin"></div>
          <p className="text-amber-900/60 font-light">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-lg shadow-sm p-12 border border-amber-100">
          <h2 className="text-xl font-serif text-amber-900 mb-4">Chapitre Introuvable</h2>
          <p className="text-amber-800/70 font-light mb-8">Ce chapitre n'existe pas ou n'est pas accessible.</p>
          <button
            type="button"
            onClick={() => navigate('/catalogue')}
            className="px-8 py-2.5 bg-eros-gold text-amber-950 font-medium hover:bg-eros-gold/90 transition-all rounded text-sm"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const allVolumes = chapter.volumes || [];
  const accessibleVolumes = allVolumes.filter((v: any) => v.isAccessible);
  const lockedVolumes = allVolumes.filter((v: any) => !v.isAccessible);
  const featuredVolume = accessibleVolumes[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 relative overflow-hidden">
      {/* Decorative Shelf SVG Background */}
      <div className="absolute top-0 right-0 opacity-5 pointer-events-none w-1/3 h-1/3">
        <ShelfSVG />
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <h1 className="text-3xl md:text-4xl font-serif text-amber-950 mb-2">
          {chapter.title}
        </h1>
        {chapter.accroche_marketing && (
          <p className="text-amber-800/60 font-light text-sm">
            {chapter.accroche_marketing}
          </p>
        )}
      </div>

      {/* Featured Section */}
      {featuredVolume && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Featured Book Info */}
              <div className="md:col-span-1">
                <p className="text-xs text-eros-gold font-semibold uppercase tracking-widest mb-3">
                  À Découvrir
                </p>
                <h2 className="text-2xl font-serif text-amber-950 mb-3">
                  {featuredVolume.title}
                </h2>
                <p className="text-amber-800/70 font-light text-sm leading-relaxed mb-6">
                  {(featuredVolume as any).description || chapter.description}
                </p>

                {/* Stats */}
                {(featuredVolume as any).wordCount && (
                  <div className="flex gap-6 mb-6 text-sm text-amber-900/70">
                    <div>
                      <p className="text-xs uppercase tracking-wide font-semibold text-amber-950">
                        {(((featuredVolume as any).wordCount || 0) / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs">Mots</p>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleReadVolume(featuredVolume)}
                    className="w-full py-3 bg-eros-gold text-amber-950 font-semibold rounded-lg hover:bg-eros-gold/90 transition-all text-sm uppercase tracking-wide"
                  >
                    📖 Lire Maintenant
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurchasePerspective(featuredVolume.volumeNumber)}
                    className="w-full py-3 border-2 border-eros-lavande text-eros-lavande font-semibold rounded-lg hover:bg-eros-lavande/10 transition-all text-sm uppercase tracking-wide"
                  >
                    🔓 Perspective Protagoniste
                  </button>
                </div>
              </div>

              {/* Featured Book Cover - 3D */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative w-full max-w-xs">
                  <div className="relative" style={{ perspective: '1200px' }}>
                    {/* Shadow */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/8 blur-2xl rounded-full"></div>

                    {/* Book Cover */}
                    <div
                      className="relative rounded-lg overflow-hidden shadow-2xl"
                      style={{
                        backgroundImage: (featuredVolume as any).illustrationAsset?.url
                          ? `url(${(featuredVolume as any).illustrationAsset.url})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        aspectRatio: '3/4',
                        transform: 'rotateY(-12deg) rotateX(4deg)',
                      }}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent"></div>

                      {/* Book Spine */}
                      <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20"></div>
                    </div>
                  </div>

                  {/* Volume Badge */}
                  <div className="absolute -top-4 -right-4 w-14 h-14 bg-eros-gold text-amber-950 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white">
                    {featuredVolume.volumeNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Volumes Section */}
      {accessibleVolumes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 mb-12">
          <h3 className="text-xs font-semibold text-eros-gold uppercase tracking-widest mb-6">
            Volumes Accessibles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessibleVolumes.map((volume: any) => (
              <VolumeCard
                key={volume.volumeNumber}
                volume={volume}
                onRead={() => handleReadVolume(volume)}
                onBuyPerspective={() => handlePurchasePerspective(volume.volumeNumber)}
                isPurchasing={isPurchasing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Volumes Section */}
      {lockedVolumes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <h3 className="text-xs font-semibold text-eros-pink uppercase tracking-widest mb-6">
            Volumes Verrouillés
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lockedVolumes.map((volume: any) => (
              <LockedVolumeCard
                key={volume.volumeNumber}
                volume={volume}
                onBuy={() => handlePurchaseVolume(volume.volumeNumber)}
                isPurchasing={isPurchasing}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reader Drawer */}
      {selectedVolume && chapter && (
        <ReaderDrawer
          isOpen={readerOpen}
          onClose={() => {
            setReaderOpen(false);
            if (chapterId) {
              api.getChapter(chapterId).then(setChapter);
            }
          }}
          volumeId={selectedVolume.id}
          chapterId={chapterId!}
          volumeNumber={selectedVolume.volumeNumber}
          onPurchasePerspective={handlePurchasePerspective}
        />
      )}

      {/* Purchase Drawer */}
      {selectedVolumeForPurchase && chapter && (
        <PurchaseDrawer
          isOpen={purchaseDrawerOpen}
          onClose={() => {
            setPurchaseDrawerOpen(false);
            setSelectedVolumeForPurchase(null);
          }}
          volume={selectedVolumeForPurchase}
          chapter={chapter}
          chapterTitle={chapter.title}
          onPurchaseVolume={async () => {
            if (!chapterId) return;
            try {
              setIsPurchasing(true);
              const { url } = await api.createCheckoutSession({
                chapterId,
                type: 'VOLUME',
                volumeNumber: selectedVolumeForPurchase.volumeNumber,
                versionScope: 'BASE',
                successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
                cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
              });
              window.location.href = url;
            } catch (err: any) {
              console.error('Failed to create checkout session:', err);
              showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
              setIsPurchasing(false);
            }
          }}
          onPurchaseChapter={async () => {
            if (!chapterId) return;
            try {
              setIsPurchasing(true);
              const { url } = await api.createCheckoutSession({
                chapterId,
                type: 'CHAPTER',
                versionScope: 'BASE',
                successUrl: `${window.location.origin}/chapters/${chapterId}?purchase=success`,
                cancelUrl: `${window.location.origin}/chapters/${chapterId}?purchase=cancelled`,
              });
              window.location.href = url;
            } catch (err: any) {
              console.error('Failed to create checkout session:', err);
              showErrorToast(toast, 'CHECKOUT_SESSION_FAILED');
              setIsPurchasing(false);
            }
          }}
        />
      )}
    </div>
  );
}

/**
 * Volume Card - Accessible volumes
 */
function VolumeCard({
  volume,
  onRead,
  onBuyPerspective,
  isPurchasing,
}: {
  volume: any;
  onRead?: () => void;
  onBuyPerspective?: () => void;
  isPurchasing?: boolean;
}) {
  const coverUrl = (volume as any).illustrationAsset?.url;
  const protag = volume.pricing?.priceProtagonistUnlock ? (volume.pricing.priceProtagonistUnlock / 100).toFixed(2) : null;
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Cover Image */}
      <div
        className="relative w-full aspect-[3/4] bg-gradient-to-br from-amber-100 to-amber-50 overflow-hidden"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Hover Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-end p-4 space-y-3">
            <button
              type="button"
              onClick={onRead}
              disabled={isPurchasing}
              className="w-full py-2.5 bg-eros-gold text-amber-950 font-semibold text-xs rounded-lg hover:bg-eros-gold/90 transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              Lire
            </button>
            {protag && (
              <button
                type="button"
                onClick={onBuyPerspective}
                disabled={isPurchasing}
                className="w-full py-2.5 bg-eros-lavande text-white font-semibold text-xs rounded-lg hover:bg-eros-lavande/90 transition-all disabled:opacity-50 uppercase tracking-wide"
              >
                Protag. {protag}€
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <p className="text-xs text-eros-gold font-semibold uppercase tracking-wider mb-2">
          Vol. {volume.volumeNumber}
        </p>
        <h4 className="font-serif text-sm text-amber-950 leading-tight line-clamp-2">
          {volume.title}
        </h4>
      </div>
    </div>
  );
}

/**
 * Locked Volume Card
 */
function LockedVolumeCard({
  volume,
  onBuy,
  isPurchasing,
}: {
  volume: any;
  onBuy?: () => void;
  isPurchasing?: boolean;
}) {
  const coverUrl = (volume as any).illustrationAsset?.url;
  const [showAction, setShowAction] = useState(false);

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setShowAction(true)}
      onMouseLeave={() => setShowAction(false)}
    >
      {/* Cover Image - Grayscale */}
      <div
        className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden opacity-60 hover:opacity-75 transition-opacity"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
        }}
      >
        {/* Lock Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="text-4xl">🔒</span>
        </div>

        {/* Hover Overlay */}
        {showAction && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end p-4">
            <button
              type="button"
              onClick={onBuy}
              disabled={isPurchasing}
              className="w-full py-2.5 bg-eros-pink text-white font-semibold text-xs rounded-lg hover:bg-eros-pink/90 transition-all disabled:opacity-50 uppercase tracking-wide"
            >
              Acheter
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <p className="text-xs text-eros-pink font-semibold uppercase tracking-wider mb-2">
          Vol. {volume.volumeNumber}
        </p>
        <h4 className="font-serif text-sm text-amber-950 leading-tight line-clamp-2">
          {volume.title}
        </h4>
      </div>
    </div>
  );
}
