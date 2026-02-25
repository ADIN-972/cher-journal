import { useState, ForwardedRef, forwardRef } from "react";
import type { Chapter } from "../../stores/catalogStore";
import VolumeActionButtons from "../VolumeActionButtons";

type Volume = NonNullable<Chapter["volumes"]>[number];

// Génère un nombre "aléatoire" stable basé sur une chaîne (hash simple)
const getSeededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 1000) / 1000;
};

// Calcule le margin aléatoire stable pour un volume
const getStableMargin = (volumeId: string): number => {
  const randomValue = getSeededRandom(volumeId);
  return Math.floor(randomValue * 31) - 10; // -10 à 20px
};

interface ChapterTableOfContentsV3Props {
  chapter: Chapter;
  selectedPerspective: "narrateur" | "protagonist" | "coloriage" | null;
  isPurchasing: boolean;
  isStartingWait: boolean;
  onOpenVolume: (volume: Volume) => void;
  onStartWait: (volumeNumber: number) => void;
  onUnlock: () => void;
  onFetchChapter: () => void;
  chapterId: string;
}

const bookSpineColors = [
  { bg: "from-emerald-700 to-teal-800", accent: "emerald" },
  { bg: "from-rose-700 to-pink-800", accent: "rose" },
  { bg: "from-slate-800 to-blue-900", accent: "slate" },
  { bg: "from-amber-800 to-yellow-900", accent: "amber" },
  { bg: "from-purple-700 to-indigo-800", accent: "purple" },
  { bg: "from-red-800 to-rose-900", accent: "red" },
];

export default forwardRef<HTMLElement, ChapterTableOfContentsV3Props>(
  function ChapterTableOfContentsV3(
    {
      chapter,
      selectedPerspective,
      isPurchasing,
      isStartingWait,
      onOpenVolume,
      onStartWait,
      onFetchChapter,
      chapterId,
    },
    ref: ForwardedRef<HTMLElement>,
  ) {
    const [hoveredVolumeId, setHoveredVolumeId] = useState<string | null>(null);

    const perspectiveKey =
      selectedPerspective === "protagonist" ? "PROTAGONIST" : "NARRATOR";

    const volumes = chapter.volumes || [];
    const firstLockedIndex = volumes.findIndex((v) => {
      const perspectiveAccess = v.accessByPerspective?.[perspectiveKey];
      const isAccessible = perspectiveAccess?.isAccessible || false;
      return !isAccessible;
    });

    const displayedVolumes =
      firstLockedIndex === -1
        ? volumes
        : volumes.slice(0, firstLockedIndex + 1);

    if (!chapter.volumes || chapter.volumes.length === 0) {
      return (
        <section
          ref={ref}
          className="px-4 py-12 text-center">
          <p className="text-gray-400 font-serif italic">
            Aucun volume disponible pour le moment.
          </p>
        </section>
      );
    }

    return (
      <section
        ref={ref}
        className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Collection Header */}
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-boudoir-900 dark:text-white mb-2 italic">
            Collection
          </h2>
          <p className="text-boudoir-600 dark:text-boudoir-300 text-sm italic">
            Explorez les volumes empilés
          </p>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-eros-gold/60 to-transparent mx-auto mt-3" />
        </div>

        {/* Stacked Books Container */}
        <div className="max-w-4xl mx-auto">
          {/* Books Stack */}
          <div className="flex flex-col relative  gap-4">
            {displayedVolumes.map((volume, index) => {
              const perspectiveAccess = volume.accessByPerspective?.[perspectiveKey];
              const isUnlocked = perspectiveAccess?.isAccessible || false;
              const blockageType = perspectiveAccess?.blockageType || null;
              const blockageInfo = perspectiveAccess?.blockageInfo || {};
              const progression = volume.progressByPerspective?.[perspectiveKey] ?? 0;

              const needsUpgrade =
                blockageType === "PAYWALL" || blockageType === "EPILOGUE";
              const hasActiveWait =
                blockageInfo.waitRemaining && blockageInfo.waitRemaining > 0;
              const canStartWait = perspectiveAccess?.canStartWait || false;

              const colorScheme = bookSpineColors[index % bookSpineColors.length];
              const isHovered = hoveredVolumeId === volume.id;

              return (
                <div
                  className="book-3d bg-deep-burgundy"
                  style={
                    {
                      "--z-index": 10,
                      marginLeft: `${getStableMargin(volume.id)}px`,
                    } as React.CSSProperties
                  }>
                  <div className="book-spine-3d">
                    <div className="spine-texture-3d"></div>
                    <div className="grid grid-cols-12 w-full items-center z-10">
                      <div className="col-span-1 text-boudoir-gold/60 font-serif italic text-xl">
                        I
                      </div>
                      <div className="col-span-4 text-boudoir-silk font-serif text-lg tracking-wide">
                        The Midnight Appointment
                      </div>
                      <div className="col-span-3 flex items-center space-x-3">
                        <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">
                          Progress
                        </span>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill w-[65%]"></div>
                        </div>
                      </div>
                      <div className="col-span-1 text-center">
                        <svg
                          className="h-5 w-5 text-boudoir-gold mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"></path>
                        </svg>
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <button className="text-[11px] px-5 py-2 bg-boudoir-silk text-boudoir-plum font-bold uppercase tracking-wider rounded shadow-md hover:brightness-110 active:scale-95 transition">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="book-pages-3d"></div>
                </div>
              );
            })}
          </div>

          {/* Actions appear below stack when hovering a volume */}
          <div className="mt-24 sm:mt-28">
            {hoveredVolumeId ? (
              <div className="animate-fade-in">
                {displayedVolumes.find((v) => v.id === hoveredVolumeId) && (
                  <div>
                    <div className="text-center mb-4">
                      <p className="text-boudoir-600 dark:text-boudoir-300 text-sm italic">
                        Options d'accès
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <VolumeActionButtons
                        volume={displayedVolumes.find((v) => v.id === hoveredVolumeId)!}
                        selectedPerspective={selectedPerspective}
                        isPurchasing={isPurchasing}
                        isStartingWait={isStartingWait}
                        needsUpgrade={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]?.blockageType === "PAYWALL" ||
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]?.blockageType === "EPILOGUE"
                        }
                        hasActiveWait={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)?.accessByPerspective?.[perspectiveKey]?.blockageInfo?.waitRemaining &&
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)?.accessByPerspective?.[perspectiveKey]?.blockageInfo?.waitRemaining > 0
                        }
                        canStartWait={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]?.canStartWait || false
                        }
                        blockageInfo={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]?.blockageInfo || {}
                        }
                        chapterId={chapterId}
                        onOpenVolume={onOpenVolume}
                        onStartWait={onStartWait}
                        onFetchChapter={onFetchChapter}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-boudoir-400 dark:text-boudoir-500 italic text-sm">
                Survolez un livre pour voir les options
              </div>
            )}
          </div>
        </div>
      </section>
    );
  },
);
