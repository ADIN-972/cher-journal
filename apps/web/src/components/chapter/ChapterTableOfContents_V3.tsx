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
  return Math.floor(randomValue * 21) - 10; // -10 à 10px
};

// Convertit un nombre en chiffres romains
const toRomanNumeral = (num: number): string => {
  const romanNumerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
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
    const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(
      null,
    );

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
        className=" py-12"
        onClick={() => {
          // Close selected volume actions when clicking outside
          setSelectedVolumeId(null);
        }}>
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
          <div className="flex flex-col relative  gap-4 md:gap-3">
            {displayedVolumes.map((volume, index) => {
              // Get perspective-specific access info
              const perspectiveAccess =
                volume.accessByPerspective?.[perspectiveKey];
              const isUnlocked = perspectiveAccess?.isAccessible || false;

              // Determine blockage type and info from perspective-specific data
              const blockageType = perspectiveAccess?.blockageType || null;
              const blockageInfo = perspectiveAccess?.blockageInfo || {};
              const progression =
                volume.progressByPerspective?.[perspectiveKey] ?? 0;
              console.log("Volume", volume.title, "Progression:", progression);
              const needsUpgrade =
                blockageType === "PAYWALL" || blockageType === "EPILOGUE";
              const hasActiveWait =
                blockageInfo.waitRemaining && blockageInfo.waitRemaining > 0;
              const canStartWait = perspectiveAccess?.canStartWait || false;

              const colorScheme =
                bookSpineColors[index % bookSpineColors.length];
              const isHovered = hoveredVolumeId === volume.id;

              // Map blockage types to UI states
              const needsEntitlement = blockageType === "WAIT_OR_PAY";

              return (
                <button
                  key={volume.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // On mobile: tap to select/show actions, tap again to open
                    // On desktop: go straight to opening (hover shows actions)
                    if (selectedVolumeId === volume.id) {
                      // Already selected, open the volume
                      setSelectedVolumeId(null);
                      onOpenVolume(volume);
                    } else {
                      // Select to show actions
                      setSelectedVolumeId(volume.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredVolumeId(volume.id)}
                  onMouseLeave={() => setHoveredVolumeId(null)}
                  className={`relative w-full book-3d ${isUnlocked ? (perspectiveKey === "NARRATOR" ? "bg-deep-burgundy" : "bg-deep-rose") : "bg-gray-800"} text-left`}
                  style={
                    {
                      "--z-index": displayedVolumes.length - index,
                      marginLeft: `${getStableMargin(volume.id)}px`,
                    } as React.CSSProperties
                  }
                  aria-label={`Volume ${toRomanNumeral(volume.volumeNumber)}: ${volume.title}`}>
                  {/* <div
                    className="absolute flex w-full ml-1 h-full bg-gradient-to-b from-black/50 to-black/0 top-0 left-[10px]"
                    style={{
                      transform: "skewX(15deg)",
                    }}></div>
                      <div
                    className="absolute flex w-full ml-1 h-[30%] bg-gradient-to-b from-black/50 to-black/0 -bottom-[30%] left-[1px]"
                    style={{
                      transform: "skewX(15deg)",
                    }}></div> */}
                  <div
                    className="absolute flex w-[98%] ml-1 h-[90%] bg-gradient-to-b from-black/50 to-black/0 -bottom-[85%]"
                    style={{
                      clipPath: "ellipse(50% 25% at center top)",
                    }}></div>
                  <div className="book-spine-3d z-[5]">
                    {/* <div className="spine-texture-3d"></div> */}
                    <div className="grid grid-cols-12 w-full h-full items-center z-[5]">
                      <div className="flex items-center justify-center col-span-1 text-gold font-serif  text-xl">
                        {toRomanNumeral(volume.volumeNumber)}
                      </div>
                      <div className="col-span-5 h-full flex items-center px-3 mr-1 border-r border-gold/50 text-boudoir-silk font-serif text-sm md:text-lg tracking-wide line-clamp-2 ">
                        {volume.title}
                      </div>
                      <div
                        className={`${isUnlocked ? "col-span-6" : "col-span-5"} flex flex-col items-center space-x-3 text-white justify-center  h-full  items-center px-3 mr-1 border-l-2 border-gold/50`}>
                        <div className="grid w-full text-[10px] text-center md:text-xs text-gray-400 italic">
                          {isUnlocked
                            ? "Une histoire captivante..."
                            : needsUpgrade
                              ? "Volume Premium - Mise à niveau requise"
                              : needsEntitlement
                                ? "Déverrouillez pour découvrir ce chapitre secret..."
                                : hasActiveWait
                                  ? "Compte à rebours en cours..."
                                  : "Volume verrouillé"}
                        </div>
                        {isUnlocked && (
                          <div className="flex flex-col w-full items-center">
                            <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-gold h-full rounded-full"
                                style={{ width: `${progression}%` }}></div>
                            </div>
                            <div
                              className={`${
                                progression === 0
                                  ? "text-white/40"
                                  : "text-gold"
                              }  text-[10px] uppercase font-bold mt-1 tracking-widest`}>
                              {`${
                                progression >= 100
                                  ? "Terminé"
                                  : progression === 0
                                    ? "Pas commencé"
                                    : `${progression}% Lu`
                              }`}{" "}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* <div className="col-span-1 text-center">
                        <span className="material-symbols-outlined text-xl text-boudoir-gold">
                          {isUnlocked ? "auto_stories" : "lock"}
                        </span>
                      </div> */}
                      <div
                        className={`col-span-1 flex justify-end items-center pr-2 ${isUnlocked && "hidden"}`}>
                        <span className="text-[10px] text-white uppercase tracking-widest opacity-70 font-bold">
                          {isUnlocked ? (
                            <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined rose-gold-fill text-2xl opacity-60">
                              lock
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="book-pages-3d"></div>
                </button>
              );
            })}
          </div>

          {/* Actions appear below stack when hovering/selecting a volume */}
          {/* <div className="mt-24 sm:mt-28">
            {hoveredVolumeId || selectedVolumeId ? (
              <div className="animate-fade-in">
                {displayedVolumes.find((v) => v.id === (hoveredVolumeId || selectedVolumeId)) && (
                  <div>
                    <div className="text-center mb-4">
                      <p className="text-boudoir-600 dark:text-boudoir-300 text-sm italic">
                        Options d'accès
                      </p>
                    </div>
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <VolumeActionButtons
                        volume={
                          displayedVolumes.find(
                            (v) => v.id === (hoveredVolumeId || selectedVolumeId),
                          )!
                        }
                        selectedPerspective={selectedPerspective}
                        isPurchasing={isPurchasing}
                        isStartingWait={isStartingWait}
                        needsUpgrade={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.blockageType === "PAYWALL" ||
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.blockageType === "EPILOGUE"
                        }
                        hasActiveWait={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.blockageInfo?.waitRemaining &&
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.blockageInfo?.waitRemaining > 0
                        }
                        canStartWait={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.canStartWait || false
                        }
                        blockageInfo={
                          displayedVolumes.find((v) => v.id === hoveredVolumeId)
                            ?.accessByPerspective?.[perspectiveKey]
                            ?.blockageInfo || {}
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
          </div> */}
        </div>
      </section>
    );
  },
);
