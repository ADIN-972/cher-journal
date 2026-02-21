interface EndOfVolumeUIProps {
  volumeNumber: number;
  chapterId: string;
  perspective?: 'NARRATOR' | 'PROTAGONIST';
  nextVolume?: {
    id?: string;
    volumeNumber?: number;
    price?: number;
    isAccessible?: boolean;
    blockageType?: string;
    blockageInfo?: any;
  } | null;
  onClose: () => void;
  onStartWait?: () => void;
  onPurchase?: (type: 'freeToRead' | 'paywall' | 'epilogue' | 'narratorChapter' | 'protagonistChapter') => void;
  onReadNext?: (volumeId: string, volumeNumber: number) => void;
  totalVolumes?: number;
  allVolumesOwned?: boolean;
  chapterPrice?: number;
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatTime(ms: number): string {
  if (!ms || ms <= 0) return 'disponible';

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}j ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes}min`;
  }
}

export default function EndOfVolumeUI({
  volumeNumber,
  chapterId,
  perspective,
  nextVolume,
  onClose,
  onStartWait,
  onPurchase,
  onReadNext,
  totalVolumes = 10,
  allVolumesOwned = false,
  chapterPrice,
}: EndOfVolumeUIProps) {
  // PROTAGONIST price per volume (0.99€)
  const protagonistPrice = 99;
  const isProtagonist = perspective === 'PROTAGONIST';

  // Determine if this is the last volume
  const isLastVolume = !nextVolume || volumeNumber >= totalVolumes;

  // If last volume: Show minimal completion message
  if (isLastVolume) {
    return (
      <div className="mt-12 text-center">
        <div className="inline-block bg-gold/10 dark:bg-gold/5 border border-gold/30 dark:border-gold/20 rounded-lg px-8 py-6">
          <div className="mb-3">
            <span className="material-symbols-outlined text-4xl text-gold">
              check_circle
            </span>
          </div>
          <h3 className="text-xl font-serif mb-2 text-gray-900 dark:text-white">
            Volume terminé !
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Merci d'avoir lu ce volume
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
            Retour au chapitre
          </button>
        </div>
      </div>
    );
  }

  // Case 1: Next volume exists and is accessible
  if (nextVolume?.isAccessible && nextVolume.id && nextVolume.volumeNumber && onReadNext) {
    return (
      <div className="mt-12 max-w-2xl mx-auto">
        <div className={`bg-gradient-to-br ${isProtagonist
          ? 'from-rose-500/10 via-pink-50/50 to-rose-500/10 dark:from-rose-500/5 dark:via-gray-800/50 dark:to-rose-500/5 border border-rose-500/30 dark:border-rose-500/20'
          : 'from-gold/10 via-amber-50/50 to-gold/10 dark:from-gold/5 dark:via-gray-800/50 dark:to-gold/5 border border-gold/30 dark:border-gold/20'} rounded-xl p-8 text-center shadow-lg`}>
          <div className="mb-4">
            <span className={`material-symbols-outlined text-5xl ${isProtagonist ? 'text-rose-500' : 'text-gold'} mb-2`}>
              {isProtagonist ? 'favorite' : 'auto_stories'}
            </span>
          </div>
          <h3 className="text-2xl font-serif mb-2 text-gray-900 dark:text-white">
            Volume terminé !
          </h3>
          <p className={`${isProtagonist ? 'text-rose-700 dark:text-rose-300' : 'text-gray-600 dark:text-gray-400'} mb-6`}>
            {isProtagonist
              ? 'Continuez avec le point de vue de la Protagoniste'
              : 'Envie de découvrir la suite ?'}
          </p>

          <div className="flex flex-col gap-4 justify-center">
            {/* Read next volume button */}
            <button
              type="button"
              onClick={() => onReadNext(nextVolume.id!, nextVolume.volumeNumber!)}
              className={`${isProtagonist ? 'flex-1' : 'flex-1 sm:flex-none'} px-6 py-4 ${isProtagonist
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
                : 'bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90'} text-white rounded-lg shadow-md hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
                <span className="font-semibold">
                  Lire le volume suivant
                </span>
              </div>
            </button>

            {/* Buy chapter button - hidden if all volumes owned */}
            {!allVolumesOwned && (
              <button
                type="button"
                onClick={() => onPurchase?.(isProtagonist ? 'protagonistChapter' : 'narratorChapter')}
                className={`flex-1 px-6 py-4 ${isProtagonist
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-600/40 hover:shadow-rose-600/60 border-2 border-rose-400/50'
                  : 'bg-gradient-to-r from-gold/80 to-amber-500/80 hover:from-gold hover:to-amber-500 border-2 border-gold/50'} text-white rounded-lg shadow-md hover:shadow-lg transition-all`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                  <span className="font-semibold">
                    Tout le chapitre
                  </span>
                </div>
                <p className="text-sm text-white/90">
                  {chapterPrice ? formatPrice(chapterPrice) : 'Tous les volumes'}
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Next volume exists but is blocked
  if (nextVolume && !nextVolume.isAccessible) {
    // Special case: Paywall (volume 8)
    if (nextVolume.blockageType === 'PAYWALL') {
      const price = nextVolume.price;

      return (
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-purple-500/10 border border-purple-300/50 dark:border-purple-500/30 rounded-xl p-8 text-center shadow-lg">
            <div className="mb-4">
              <span className="material-symbols-outlined text-5xl text-purple-500 mb-2">
                workspace_premium
              </span>
            </div>
            <h3 className="text-2xl font-serif mb-2 text-gray-900 dark:text-white">
              Volumes Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Accédez aux volumes 9 et 10 pour découvrir le dénouement de l'histoire
            </p>

            <button
              type="button"
              onClick={() => onPurchase?.('paywall')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-lg">
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">
                  upgrade
                </span>
                <span>
                  Débloquer {price ? formatPrice(price) : 'Prix non disponible'}
                </span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // Special case: Epilogue (volume 10)
    if (nextVolume.blockageType === 'EPILOGUE') {
      const price = nextVolume.price;

      return (
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gold/20 via-amber-500/20 to-gold/20 dark:from-gold/10 dark:via-amber-500/10 dark:to-gold/10 border border-gold/50 dark:border-gold/30 rounded-xl p-8 text-center shadow-lg">
            <div className="mb-4">
              <span className="material-symbols-outlined text-5xl text-gold mb-2">
                auto_awesome
              </span>
            </div>
            <h3 className="text-2xl font-serif mb-2 text-gray-900 dark:text-white">
              Épilogues Exclusifs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Découvrez les épilogues secrets et plongez encore plus profondément dans l'univers
            </p>

            <button
              type="button"
              onClick={() => onPurchase?.('epilogue')}
              className="px-8 py-4 bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-lg">
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">
                  favorite
                </span>
                <span>
                  Débloquer {price ? formatPrice(price) : 'Prix non disponible'}
                </span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // General case: WAIT_OR_PAY blockage (volumes 1-7)
    if (nextVolume.blockageType === 'WAIT_OR_PAY') {
      const { waitRemaining } = nextVolume.blockageInfo || {};
      const price = isProtagonist ? protagonistPrice : nextVolume.price;

      return (
        <div className="mt-12 max-w-2xl mx-auto">
          <div className={`bg-gradient-to-br ${isProtagonist
            ? 'from-rose-500/10 via-pink-50/50 to-rose-500/10 dark:from-rose-500/5 dark:via-gray-800/50 dark:to-rose-500/5 border border-rose-500/30 dark:border-rose-500/20'
            : 'from-gold/10 via-amber-50/50 to-gold/10 dark:from-gold/5 dark:via-gray-800/50 dark:to-gold/5 border border-gold/30 dark:border-gold/20'} rounded-xl p-8 text-center shadow-lg`}>
            <div className="mb-4">
              <span className={`material-symbols-outlined text-5xl ${isProtagonist ? 'text-rose-500' : 'text-gold'} mb-2`}>
                {isProtagonist ? 'favorite' : 'auto_stories'}
              </span>
            </div>
            <h3 className="text-2xl font-serif mb-2 text-gray-900 dark:text-white">
              Volume terminé !
            </h3>
            <p className={`${isProtagonist ? 'text-rose-700 dark:text-rose-300' : 'text-gray-600 dark:text-gray-400'} mb-6`}>
              {isProtagonist
                ? 'Continuez avec le point de vue de la Protagoniste'
                : 'Envie de découvrir la suite ?'}
            </p>

            <div className="flex flex-col gap-4 justify-center">
              {/* Wait option - only for NARRATOR */}
              {!isProtagonist && (
                <button
                  type="button"
                  onClick={onStartWait}
                  className="flex-1 sm:flex-none px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold hover:bg-gold/5 dark:hover:border-gold dark:hover:bg-gold/10 transition-all group">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 group-hover:text-gold">
                      schedule
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Attendre gratuitement
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {waitRemaining ? formatTime(waitRemaining) : 'Disponible bientôt'}
                  </p>
                </button>
              )}

              {/* Buy volume button */}
              <button
                type="button"
                onClick={() => onPurchase?.('freeToRead')}
                className={`${isProtagonist || !nextVolume ? 'flex-1' : 'flex-1 sm:flex-none'} px-6 py-4 ${isProtagonist
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
                  : 'bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90'} text-white rounded-lg shadow-md hover:shadow-lg transition-all`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="material-symbols-outlined">
                    lock_open
                  </span>
                  <span className="font-semibold">
                    {isProtagonist ? 'Ce volume' : 'Débloquer maintenant'}
                  </span>
                </div>
                <p className="text-sm text-white/90">
                  {price ? formatPrice(price) : 'Prix non disponible'}
                </p>
              </button>

              {/* Buy chapter button - hidden if all volumes owned */}
              {!allVolumesOwned && (
                <button
                  type="button"
                  onClick={() => onPurchase?.(isProtagonist ? 'protagonistChapter' : 'narratorChapter')}
                  className={`flex-1 px-6 py-4 ${isProtagonist
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg shadow-lg shadow-rose-600/40 hover:shadow-rose-600/60 transition-all border-2 border-rose-400/50'
                    : 'bg-gradient-to-r from-gold/80 to-amber-500/80 hover:from-gold hover:to-amber-500 text-white rounded-lg shadow-lg shadow-gold/40 hover:shadow-gold/60 transition-all border-2 border-gold/50'}`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    <span className="font-semibold">
                      Tout le chapitre
                    </span>
                  </div>
                  <p className="text-sm text-white/90">
                    {chapterPrice ? formatPrice(chapterPrice) : 'Tous les volumes'}
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Case 3: No next volume or default completion
  return (
    <div className="mt-12 text-center">
      <div className="inline-block bg-gold/10 dark:bg-gold/5 border border-gold/30 dark:border-gold/20 rounded-lg px-8 py-6">
        <div className="mb-3">
          <span className="material-symbols-outlined text-4xl text-gold">
            check_circle
          </span>
        </div>
        <h3 className="text-xl font-serif mb-2 text-gray-900 dark:text-white">
          Volume terminé !
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Merci d'avoir lu ce volume
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
          Retour au chapitre
        </button>
      </div>
    </div>
  );
}
