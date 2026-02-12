import { useEffect, useState } from "react";
import { useLibraryStore } from "../stores/libraryStore";
import { Link } from "react-router-dom";
import ChapterReviewDrawer from "../components/ChapterReviewDrawer";
import ChapterCover from "../components/common/ChapterCover";

export default function Library() {
  const { volumes, isLoading, error, filter, setFilter, fetchLibrary } =
    useLibraryStore();
  const [selectedTab, setSelectedTab] = useState<
    "all" | "inProgress" | "completed"
  >("all");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const TABS = [
    { id: "all" as const, label: "Tous mes trésors" },
    { id: "inProgress" as const, label: "En cours" },
    { id: "completed" as const, label: "Terminés" },
  ];

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleChapterClick = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setIsDrawerOpen(true);
  };

  // Group volumes by chapter for better display
  const chaptersMap = volumes.reduce(
    (acc, vol) => {
      if (!acc[vol.chapterId]) {
        acc[vol.chapterId] = {
          chapterId: vol.chapterId,
          chapterTitle: vol.chapterTitle,
          volumes: [],
          totalVolumes: vol.totalVolumes || 0,
          currentVolume: vol.currentVolume || 1,
          coverAsset: vol.coverAsset,
        };
      }
      acc[vol.chapterId].volumes.push(vol);
      return acc;
    },
    {} as Record<string, any>,
  );

  const chapters = Object.values(chaptersMap);

  const selectedChapterData = selectedChapter
    ? chapters.find((c) => c.chapterId === selectedChapter)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
          <p className="text-white/70">Chargement de votre bibliothèque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div className="flex min-w-72 flex-col gap-1">
          <p className="text-xl md:text-3xl font-display italic text-[#c5a059] mb-2 leading-tight tracking-tight">
            Bienvenue dans votre sanctuaire
          </p>
          <p className="text-white/60 text-sm md:text-lg font-display italic leading-normal">
            Retrouvez vos récits et partagez vos émotions les plus intimes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex border-b border-[#c5a059]/20 gap-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`flex flex-col items-center justify-center border-b-2 pb-4 px-2 transition-colors ${
                selectedTab === tab.id
                  ? "border-[#c5a059] text-[#c5a059]"
                  : "border-transparent text-white/40 hover:text-white/80"
              }`}>
              <p className="text-sm font-bold leading-normal tracking-wider uppercase">
                {tab.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-gradient-to-br from-[#2d1620]/40 to-[#1a0f14]/60 border border-[#ee2b5b]/30 rounded-2xl backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ee2b5b]/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl text-[#ee2b5b]">
                heart_broken
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display italic text-white mb-2">
                Un léger contretemps...
              </h3>
              <p className="text-white/70 leading-relaxed mb-4">{error}</p>
              <button
                type="button"
                onClick={() => fetchLibrary()}
                className="inline-flex items-center gap-2 bg-[#c5a059] text-[#1a0f14] px-5 py-2.5 rounded-full hover:bg-white transition-all duration-300 font-bold uppercase text-xs tracking-wider">
                <span className="material-symbols-outlined text-base">
                  refresh
                </span>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-[#c5a059] text-3xl font-display italic font-bold">
            Détails de Lecture
          </h2>
          <span className="text-xs text-charcoal dark:text-white/70 uppercase tracking-[0.2em]">
            Cliquez sur un ouvrage pour murmurer vos impressions
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-[#c5a059]/60">
                auto_stories
              </span>
            </div>
            <h3 className="text-xl font-serif  text-charcoal dark:text-white mb-2">
              Votre bibliothèque est vide
            </h3>
            <p className="text-white/60 mb-6">
              Commencez votre voyage en explorant notre collection
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 bg-[#c5a059] text-[#1a0f14] px-6 py-3 rounded-full hover:bg-white transition-all duration-300 font-bold uppercase text-xs tracking-wider">
              Explorer le catalogue
              <span className="material-symbols-outlined text-lg">
                chevron_right
              </span>
            </Link>
          </div>
        ) : (
          <div className="relative pt-6 pb-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {chapters.map((chapter) => {
                // Calculate progress based on current volume
                const currentVol = chapter.currentVolume || 1;
                const totalVols = chapter.totalVolumes || 1;
                const progressPercent = Math.round(
                  (currentVol / totalVols) * 100,
                );
                const isCompleted = progressPercent === 100;
                const isInProgress =
                  progressPercent > 0 && progressPercent < 100;
                const isNotStarted = progressPercent === 0;

                // Filter based on selected tab
                if (selectedTab === "inProgress" && !isInProgress) return null;
                if (selectedTab === "completed" && !isCompleted) return null;

                return (
                  <div
                    key={chapter.chapterId}
                    onClick={() => handleChapterClick(chapter.chapterId)}
                    className={`flex flex-col gap-4 group cursor-pointer ring-1 ring-[#c5a059]/40 p-2 rounded-xl bg-[#c5a059]/5  ring-2 ring-[#c5a059]`}>
                    <div className="relative aspect-[1/1] rounded-lg shadow-2xl overflow-hidden border border-[#c5a059]/10 transition-transform duration-500 group-hover:scale-105">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                      {/* Cover Image */}
                      {chapter.coverAsset?.objectKey ? (
                        <ChapterCover
                          imageUrl={`${import.meta.env.VITE_API_URL ?? ""}/uploads/${chapter.coverAsset.objectKey}`}
                          title={chapter.chapterTitle}
                          showPremiumBadge={false}
                          showLimitedEditionBadge={false}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-rose-900 flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-charcoal dark:text-white/30">
                            auto_stories
                          </span>
                        </div>
                      )}

                      {/* Progress Badge */}
                      <div className="absolute top-4 -left-1 z-30">
                        <div
                          className={`text-[10px] font-bold px-3 py-1 rounded-r shadow-lg border-l-4 flex items-center gap-1 ${
                            isCompleted
                              ? "bg-[#c5a059] text-[#1a0f14] border-[#c5a059]/50"
                              : isInProgress
                                ? "bg-[#c5a059] text-[#1a0f14] border-[#c5a059]/50"
                                : "bg-white/20 text-charcoal dark:text-white/80 backdrop-blur-md"
                          }`}>
                          {isCompleted ? (
                            <>Récit achevé</>
                          ) : isInProgress ? (
                            <>
                              <span className="material-symbols-outlined text-xs">
                                auto_stories
                              </span>
                              {currentVol} / {totalVols} volumes dévorés
                            </>
                          ) : (
                            <>Non commencé</>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isInProgress && (
                        <div className="absolute bottom-4 left-4 z-20">
                          <span className="bg-white/10 backdrop-blur-md text-[#c5a059] px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-[#c5a059]/20">
                            En cours
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chapter Info */}
                    <div className="px-2">
                      <h3
                        className={`font-display italic text-lg leading-tight transition-colors ${
                          isCompleted
                            ? "text-[#c5a059]"
                            : "text-charcoal dark:text-white group-hover:text-[#c5a059]"
                        }`}>
                        {chapter.chapterTitle}
                      </h3>

                      {/* Progress Bar */}
                      <div
                        className={`w-full h-1.5 rounded-full overflow-hidden mt-3 ${
                          isNotStarted
                            ? "bg-black/5 dark:bg-white/5 "
                            : "bg-black/10 dark:bg-white/10"
                        }`}>
                        <div
                          className="bg-[#c5a059] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decorative shelf */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-[#2d1620]/30 to-[#2d1620]/60 rounded-b-lg -z-10 border-t border-[#c5a059]/10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#c5a059]/5 to-transparent -z-20 opacity-30"></div>
          </div>
        )}
      </div>

      {/* Bottom Grid - Coloring Books & Unlocked Chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Coloring Books */}
        <div>
          <h2 className="text-[#c5a059] text-2xl font-display italic font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">palette</span>
            Livres de Coloriage
          </h2>
          <div className="bg-[#c5a059]/5 dark:bg-[#2d1620] p-6 rounded-xl border border-[#c5a059]/10 flex gap-6 items-center group cursor-pointer hover:bg-[#c5a059]/5 transition-all">
            <div className="w-24 aspect-[3/4] rounded shadow-lg overflow-hidden flex-shrink-0 border border-[#c5a059]/20 bg-gradient-to-br from-purple-900 to-rose-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-charcoal dark:text-white/30">
                palette
              </span>
            </div>
            <div>
              <h4 className="text-charcoal dark:text-white font-display italic text-xl mb-1">
                Mandalas de Volupté
              </h4>
              <p className="text-charcoal dark:text-white/50 text-sm mb-4">
                Bientôt disponible
              </p>
              <button
                type="button"
                className="bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#c5a059] hover:text-[#1a0f14] transition-all">
                Découvrir
              </button>
            </div>
          </div>
        </div>

        {/* Unlocked Chapters */}
        <div>
          <h2 className="text-[#c5a059] text-2xl font-display italic font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">key</span>
            Chapitres Débloqués
          </h2>
          <div className="flex flex-col gap-3">
            {chapters
              .filter((c) => c.currentVolume > 1)
              .slice(0, 3)
              .map((chapter) => (
                <Link
                  key={chapter.chapterId}
                  to={`/chapters/${chapter.chapterId}`}
                  className="bg-[#c5a059]/5 dark:bg-[#2d1620]/40 p-4 rounded-xl border-l-4 border-[#c5a059] flex justify-between items-center group cursor-pointer hover:bg-[#c5a059]/5">
                  <div className="flex gap-4 items-center">
                    <span className="material-symbols-outlined text-[#c5a059]/60">
                      menu_book
                    </span>
                    <div>
                      <p className="text-charcoal dark:text-white font-display italic">
                        {chapter.chapterTitle}
                      </p>
                      <p className="text-charcoal dark:text-white/30 text-xs">
                        {chapter.currentVolume} / {chapter.totalVolumes} volumes
                        lus
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </Link>
              ))}

            {chapters.filter((c) => c.currentVolume > 1).length === 0 && (
              <div className="text-center py-8 text-charcoal dark:text-white/70">
                <span className="material-symbols-outlined text-4xl mb-2 block">
                  lock_open
                </span>
                <p className="text-sm">
                  Aucun chapitre débloqué pour le moment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Review Drawer */}
      <ChapterReviewDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedChapter(null);
        }}
        chapter={selectedChapterData}
      />
    </div>
  );
}
