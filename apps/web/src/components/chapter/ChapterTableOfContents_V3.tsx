import { useState, ForwardedRef, forwardRef } from "react";
import type { Chapter } from "../../stores/catalogStore";
import VolumeActionButtons from "../VolumeActionButtons";

type Volume = NonNullable<Chapter["volumes"]>[number];

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
          <div className="relative perspective min-h-96 sm:min-h-[500px]">
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
                  key={volume.id}
                  className="absolute w-full transition-all duration-300 ease-out"
                  style={{
                    transform: isHovered
                      ? `translateY(-${(displayedVolumes.length - index - 1) * 8}px) scale(1.02)`
                      : `translateY(${index * 12}px) scale(1)`,
                    zIndex: isHovered ? 50 : displayedVolumes.length - index,
                  }}>
                  <div
                    onMouseEnter={() => setHoveredVolumeId(volume.id)}
                    onMouseLeave={() => setHoveredVolumeId(null)}
                    onClick={() => onOpenVolume(volume)}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                      isHovered ? "shadow-2xl" : "shadow-lg"
                    }`}>
                    {/* Book Spine (horizontal book lying down) */}
                    <div
                      className={`bg-gradient-to-b ${colorScheme.bg} px-6 sm:px-8 py-8 sm:py-10 border-4 border-boudoir-900/20 dark:border-white/10 ${
                        !isUnlocked && "opacity-60"
                      }`}>
                      {/* Top edge effect (showing pages) */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        aria-hidden="true"
                      />

                      {/* Spine Content - Vertical Layout */}
                      <div className="flex items-center justify-between gap-6 sm:gap-8 h-full">
                        {/* Left: Volume Number */}
                        <div className="flex-shrink-0 text-center">
                          <p className="text-white/50 text-xs tracking-widest uppercase font-bold mb-1">
                            Vol.
                          </p>
                          <p className="text-white font-serif text-3xl sm:text-4xl font-bold">
                            {String(volume.volumeNumber).padStart(2, "0")}
                          </p>
                        </div>

                        {/* Middle: Title & Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-serif font-bold text-lg sm:text-2xl leading-tight truncate">
                            {volume.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            {/* Status indicator */}
                            <span className="material-symbols-outlined text-sm text-white/70">
                              {progression >= 100
                                ? "check_circle"
                                : progression > 0
                                  ? "bookmark"
                                  : "lock"}
                            </span>
                            <p className="text-xs text-white/70 font-serif italic">
                              {progression >= 100
                                ? "Terminé"
                                : progression > 0
                                  ? `${progression}% lu`
                                  : needsUpgrade
                                    ? "Premium"
                                    : "Verrouillé"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Progress/Lock Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/25 transition-colors">
                            <span className="material-symbols-outlined text-xl sm:text-2xl text-white">
                              {progression >= 100
                                ? "check"
                                : progression > 0
                                  ? "auto_stories"
                                  : "lock"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar (if unlocked and has progress) */}
                      {isUnlocked && (
                        <div className="absolute bottom-2 sm:bottom-3 left-6 sm:left-8 right-6 sm:right-8 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-eros-gold to-yellow-300 rounded-full transition-all duration-500"
                            style={{ width: `${progression}%` }}
                          />
                        </div>
                      )}

                      {/* Shine effect on hover */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
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
