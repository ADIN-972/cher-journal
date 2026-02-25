import { ForwardedRef, forwardRef } from "react";
import type { Chapter } from "../../stores/catalogStore";
import VolumeActionButtons from "../VolumeActionButtons";

type Volume = NonNullable<Chapter["volumes"]>[number];

interface ChapterTableOfContentsV2Props {
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

const bookGradients = [
  "from-emerald-700 via-emerald-600 to-teal-700",
  "from-rose-700 via-rose-600 to-pink-700",
  "from-slate-800 via-slate-700 to-blue-800",
  "from-amber-800 via-amber-700 to-yellow-700",
  "from-purple-700 via-purple-600 to-indigo-700",
  "from-red-800 via-red-700 to-rose-800",
];

export default forwardRef<HTMLElement, ChapterTableOfContentsV2Props>(
  function ChapterTableOfContentsV2(
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
        {/* Library Header */}
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-boudoir-900 dark:text-white mb-2 italic">
            Bibliothèque
          </h2>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-eros-gold/60 to-transparent mx-auto" />
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-6">
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

            const gradientIndex = index % bookGradients.length;
            const gradient = bookGradients[gradientIndex];

            return (
              <div
                key={volume.id}
                className="group h-full flex flex-col"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}>
                {/* Book Card */}
                <div
                  onClick={() => onOpenVolume(volume)}
                  className={`relative h-72 sm:h-80 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 ${
                    isUnlocked
                      ? `bg-gradient-to-br ${gradient} shadow-xl hover:shadow-2xl hover:scale-105 group-hover:scale-105`
                      : "bg-gradient-to-br from-boudoir-300 to-boudoir-400 dark:from-boudoir-800 dark:to-boudoir-700 shadow-lg hover:shadow-xl hover:scale-105 opacity-75 hover:opacity-90"
                  }`}>
                  {/* Spine decoration */}
                  <div
                    className={`absolute -left-1 top-0 bottom-0 w-1 ${
                      isUnlocked ? "bg-eros-gold/40" : "bg-boudoir-600/30"
                    }`}
                    aria-hidden="true"
                  />

                  {/* Volume Number - Top */}
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p
                        className={`font-serif text-xs tracking-widest uppercase font-bold ${
                          isUnlocked
                            ? "text-white/70"
                            : "text-boudoir-900/50 dark:text-white/40"
                        }`}>
                        Volume
                      </p>
                      <p
                        className={`font-serif text-4xl font-bold ${
                          isUnlocked
                            ? "text-white"
                            : "text-boudoir-900 dark:text-white/60"
                        }`}>
                        {String(volume.volumeNumber).padStart(2, "0")}
                      </p>
                    </div>

                    {/* Status Icon - Top Right */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
                        isUnlocked
                          ? "bg-white/20"
                          : "bg-boudoir-900/20 dark:bg-white/10"
                      }`}>
                      <span
                        className={`material-symbols-outlined text-xl ${
                          isUnlocked
                            ? "text-white"
                            : "text-boudoir-900 dark:text-white/40"
                        }`}>
                        {progression >= 100
                          ? "check_circle"
                          : progression > 0
                            ? "bookmark"
                            : "lock"}
                      </span>
                    </div>
                  </div>

                  {/* Title - Middle */}
                  <div className="flex-1 flex items-center">
                    <h3
                      className={`font-serif text-lg sm:text-xl font-bold leading-tight ${
                        isUnlocked
                          ? "text-white"
                          : "text-boudoir-900 dark:text-white/60"
                      }`}>
                      {volume.title}
                    </h3>
                  </div>

                  {/* Progress and Status - Bottom */}
                  <div className="space-y-3 pt-4 border-t border-white/20 dark:border-black/20">
                    {/* Status Text */}
                    <p
                      className={`text-xs font-serif italic ${
                        isUnlocked
                          ? "text-white/70"
                          : "text-boudoir-900/60 dark:text-white/40"
                      }`}>
                      {progression >= 100
                        ? "✓ Terminé"
                        : progression > 0
                          ? `${progression}% Lu`
                          : needsUpgrade
                            ? "Premium"
                            : hasActiveWait
                              ? "En attente..."
                              : "Verrouillé"}
                    </p>

                    {/* Progress Bar */}
                    {isUnlocked && (
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-eros-gold rounded-full transition-all duration-500"
                          style={{ width: `${progression}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Shine effect on hover */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />
                </div>

                {/* Action Buttons - Below Card */}
                <div className="mt-4 pt-4 border-t border-boudoir-200/40 dark:border-boudoir-800/40">
                  <VolumeActionButtons
                    volume={volume}
                    selectedPerspective={selectedPerspective}
                    isPurchasing={isPurchasing}
                    isStartingWait={isStartingWait}
                    needsUpgrade={needsUpgrade}
                    hasActiveWait={hasActiveWait}
                    canStartWait={canStartWait}
                    blockageInfo={blockageInfo}
                    chapterId={chapterId}
                    onOpenVolume={onOpenVolume}
                    onStartWait={onStartWait}
                    onFetchChapter={onFetchChapter}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  },
);
