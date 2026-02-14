import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogStore } from "../stores/catalogStore";
import ErrorMessage from "../components/common/ErrorMessage";
import ChapterCover from "../components/common/ChapterCover";
import ReviewStars from "../components/common/ReviewStars";
import { getReadingTime } from "../lib/functions";

type Genre =
  | "all"
  | "PASSIONS_CHARNELLES"
  | "ROMANCES_TENDRES"
  | "MYSTERIES_SENSUELS"
  | "INTERDITS"
  | "CONQUETES"
  | "REVES_SECRETS"
  | "PASSION_BRUTALE"
  | "AMOUR_COMPLIQUE"
  | "DESIR_NOCTURNE"
  | "LIBERATION"
  | "DECOUVERTE_DE_SOI"
  | "INTIMITE_PSYCHOLOGIQUE"
  | "EVEIL_DU_DESIR"
  | "RELATIONS_TRANSFORMATRICES"
  | "MEMOIRE_DU_CORPS";
type ViewMode = "grid" | "list";

const GENRES: Record<Genre, { label: string; icon: string }> = {
  all: { label: "Tous les genres", icon: "category" },
  PASSIONS_CHARNELLES: {
    label: "Passions Charnelles",
    icon: "local_fire_department",
  },
  ROMANCES_TENDRES: { label: "Romances Tendres", icon: "favorite" },
  MYSTERIES_SENSUELS: { label: "Mystères Sensuels", icon: "nightlife" },
  INTERDITS: { label: "Interdits", icon: "lock" },
  CONQUETES: { label: "Conquêtes", icon: "trending_up" },
  REVES_SECRETS: { label: "Rêves Secrets", icon: "cloud" },
  PASSION_BRUTALE: { label: "Passion Brutale", icon: "whatshot" },
  AMOUR_COMPLIQUE: { label: "Amour Compliqué", icon: "favorite_border" },
  DESIR_NOCTURNE: { label: "Désir Nocturne", icon: "dark_mode" },
  LIBERATION: { label: "Libération", icon: "flight_takeoff" },
  DECOUVERTE_DE_SOI: { label: "Découverte de Soi", icon: "lightbulb" },
  INTIMITE_PSYCHOLOGIQUE: {
    label: "Intimité Psychologique",
    icon: "psychology",
  },
  EVEIL_DU_DESIR: { label: "Éveil du Désir", icon: "sunrise" },
  RELATIONS_TRANSFORMATRICES: {
    label: "Relations Transformatrices",
    icon: "auto_fix_high",
  },
  MEMOIRE_DU_CORPS: { label: "Mémoire du Corps", icon: "self_improvement" },
};

const THEMATIC_SECTIONS = [
  {
    id: "passion",
    title: "Passions Charnelles",
    subtitle: "L'exploration intense des sens",
    description:
      "Des récits qui font monter la température et révèlent les facettes cachées du désir.",
  },
  {
    id: "romance",
    title: "Romances Interdites",
    subtitle: "Quand l'amour franchit les limites",
    description:
      "Des histoires complexes où le cœur lutte contre les conventions.",
  },
  {
    id: "mystery",
    title: "Mystères Chuchotés",
    subtitle: "L'intrigue rencontre la sensualité",
    description: "Des secrets enfouis et des révélations qui captivent.",
  },
];

export default function Catalogue() {
  const { chapters, isLoading, error, fetchChapters } = useCatalogStore();
  const [selectedGenre, setSelectedGenre] = useState<Genre>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Filter chapters by selected genre
  const filteredChapters =
    selectedGenre === "all"
      ? chapters
      : chapters.filter((chapter) =>
          chapter.genres?.some((g) => g.genre === selectedGenre),
        );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-charcoal dark:text-white/70 font-light tracking-wide">
            Chargement du catalogue...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erreur de chargement du catalogue"
        message={error}
        onRetry={() => fetchChapters()}
      />
    );
  }

  const isFiltered = selectedGenre !== "all";

  // Calculate available genres (genres that have at least one chapter)
  const availableGenres = Object.entries(GENRES).filter(
    ([genre]) =>
      genre === "all" ||
      chapters.some((ch) => ch.genres?.some((g) => g.genre === genre)),
  );

  // Reset filter if selected genre has no chapters
  if (
    isFiltered &&
    !chapters.some((ch) => ch.genres?.some((g) => g.genre === selectedGenre))
  ) {
    setSelectedGenre("all");
  }

  return (
    <div className="min-h-screen">
      {/* Sticky Filter Section */}
      <section className="sticky top-12 z-40 bg-boudoir-950/95 backdrop-blur-xl border-b border-boudoir-800">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Filters */}
            <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold">
                Filtrer par :
              </span>
              <div className="flex gap-2 flex-wrap">
                {(availableGenres as [Genre, (typeof GENRES)[Genre]][]).map(
                  ([genre, config]) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        selectedGenre === genre
                          ? "bg-primary text-white"
                          : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                      }`}>
                      <span className="material-symbols-outlined text-sm">
                        {config.icon}
                      </span>
                      <span className="hidden sm:inline">{config.label}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 border border-boudoir-800 rounded-lg p-1 h-10">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`items-center justify-center p-1 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-boudoir-800 text-gold"
                    : "text-charcoal dark:text-white/70 hover:text-charcoal dark:text-white/70"
                }`}
                title="Grid view">
                <div className="material-symbols-outlined m-auto">
                  grid_view
                </div>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`items-center justify-center p-1 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-boudoir-800 text-gold"
                    : "text-charcoal dark:text-white/70 hover:text-charcoal dark:text-white/70"
                }`}
                title="List view">
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalogue Section */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        {chapters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-boudoir-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-charcoal dark:text-white/70 text-5xl">
                library_books
              </span>
            </div>
            <h3 className="text-xl font-serif text-white mb-2">
              Aucune histoire disponible
            </h3>
            <p className="text-charcoal dark:text-white/70">
              De nouvelles histoires arrivent bientôt...
            </p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-boudoir-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-charcoal dark:text-white/70 text-5xl">
                search
              </span>
            </div>
            <h3 className="text-xl font-serif text-white mb-2">
              Aucune histoire trouvée
            </h3>
            <p className="text-charcoal dark:text-white/70 mb-4">
              Aucune œuvre disponible pour ce genre
            </p>
            <button
              type="button"
              onClick={() => setSelectedGenre("all")}
              className="text-gold hover:text-gold-light transition-colors text-sm font-semibold">
              Voir tous les genres
            </button>
          </div>
        ) : isFiltered ? (
          // Filtered view - single list
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-accent-gold mb-2 italic">
                {GENRES[selectedGenre].label}
              </h2>
              <p className="text-sm text-charcoal dark:text-white/70">
                {filteredChapters.length} œuvre
                {filteredChapters.length > 1 ? "s" : ""} disponible
                {filteredChapters.length > 1 ? "s" : ""}
              </p>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
              {filteredChapters.map((chapter, index) => {
                debugger;

                console.log("here !!!!!!!!!!!!!!!!!!!");
                return (
                  <Link
                    key={chapter.id}
                    to={`/chapters/${chapter.id}`}
                    className={
                      viewMode === "grid" ? "group" : "flex gap-4 group"
                    }>
                    <div
                      className={
                        viewMode === "grid"
                          ? "aspect-[3/4] !text-md overflow-hidden rounded-lg mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                          : "w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                      }>
                      {chapter.coverAsset?.url ? (
                        <ChapterCover
                          imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
                          title={chapter.title}
                          showPremiumBadge={false}
                          showLimitedEditionBadge={false}
                          textSize="md"
                          showBookmarkIcon={chapter.hasStartedReading}
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                          style={{
                            backgroundImage: `url('assets/images/404_bg.png')`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-boudoir-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Lire l'extrait Button */}
                      <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="bg-gold text-charcoal px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-gold-light transition-colors">
                          Lire l'extrait
                        </button>
                      </div>
                    </div>

                    {viewMode === "list" && (
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <p className="font-script  text-2xl text-gold mb-1">
                          {chapter.protagonistName || "Récit"}
                        </p>
                        <h5 className="font-semibold text-charcoal dark:text-white/70 dark:text-white group-hover:text-gold transition-colors mb-2 line-clamp-1">
                          {chapter.title}
                        </h5>
                        <ReviewStars
                          chapterId={chapter.id}
                          size="sm"
                        />
                        <p className="text-xs text-charcoal dark:text-white/70 line-clamp-2 font-light leading-relaxed mt-2">
                          {chapter.protagonistName
                            ? "Une histoire captivante qui vous plongera dans les profondeurs du désir."
                            : "Découvrez cet univers narratif envoûtant."}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 italic mt-1">
                          <span className="material-symbols-outlined text-xs">
                            schedule
                          </span>{" "}
                          {chapter.totalCharacterCount
                            ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
                            : " "}
                        </p>
                      </div>
                    )}

                    {viewMode === "grid" && (
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h4 className="font-serif text-sm text-charcoal dark:text-white/70 dark:text-white/70 group-hover:text-gold transition-colors line-clamp-2 mb-2">
                          {chapter.title}
                        </h4>
                        <ReviewStars
                          chapterId={chapter.id}
                          size="sm"
                          showCount={false}
                        />
                        <p className="text-sm text-gray-500 flex items-center gap-2 italic mt-1">
                          <span className="material-symbols-outlined text-xs">
                            schedule
                          </span>{" "}
                          {chapter.totalCharacterCount
                            ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
                            : " "}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          // Default view - thematic sections
          <>
            {/* Thematic Sections */}
            {THEMATIC_SECTIONS.map((section, sectionIndex) => (
              <div
                key={section.id}
                className={`mb-16 ${sectionIndex > 0 ? "mt-20 pt-12 border-t border-boudoir-800" : ""}`}>
                {/* Section Header */}
                <div className="mb-8">
                  <div className="flex flex-col gap-3 sm:flex-row items-end justify-between mb-3">
                    <div>
                      <h3 className="text-3xl font-bold text-accent-gold mb-2 italic">
                        {section.title}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold mb-1">
                        {section.subtitle}
                      </p>
                      <p className="text-sm text-charcoal dark:text-white/70 leading-relaxed max-w-2xl">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Books Grid */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-4 gap-6"
                      : "space-y-4"
                  }>
                  {chapters
                    .slice(sectionIndex * 4, (sectionIndex + 1) * 4 + 2)
                    .map((chapter, index) => (
                      <Link
                        key={chapter.id}
                        to={`/chapters/${chapter.id}`}
                        className={
                          viewMode === "grid" ? "group" : "flex gap-4 group"
                        }>
                        <div
                          className={
                            viewMode === "grid"
                              ? "aspect-[1/1] overflow-hidden rounded-lg mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                              : "w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                          }>
                          {chapter.coverAsset?.url ? (
                            <ChapterCover
                              imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
                              title={chapter.title}
                              showPremiumBadge={false}
                              showLimitedEditionBadge={false}
                              showBookmarkIcon={chapter.hasStartedReading}
                            />
                          ) : (
                            <div
                              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                              style={{
                                backgroundImage: `url('assets/images/404_bg.png')`,
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-boudoir-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Lire l'extrait Button */}
                          <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="bg-gold text-charcoal px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-gold-light transition-colors">
                              Lire l'extrait
                            </button>
                          </div>
                        </div>

                        {viewMode === "list" && (
                          <div className="flex flex-col justify-center min-w-0 flex-1">
                            <p className="font-script  text-2xl text-gold mb-1">
                              {chapter.protagonistName || "Récit"}
                            </p>
                            <h5 className="font-semibold text-charcoal dark:text-white/70 dark:text-white group-hover:text-gold transition-colors mb-2 line-clamp-1">
                              {chapter.title}
                            </h5>
                            <ReviewStars
                              chapterId={chapter.id}
                              size="sm"
                            />
                            <p className="text-xs text-charcoal dark:text-white/70 line-clamp-2 font-light leading-relaxed mt-2">
                              {chapter.protagonistName
                                ? "Une histoire captivante qui vous plongera dans les profondeurs du désir."
                                : "Découvrez cet univers narratif envoûtant."}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-2 italic mt-1">
                              <span className="material-symbols-outlined text-xs">
                                schedule
                              </span>{" "}
                              {chapter.totalCharacterCount
                                ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
                                : " "}
                            </p>
                          </div>
                        )}

                        {viewMode === "grid" && (
                          <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h4 className="font-serif text-sm text-charcoal dark:text-white/70 dark:text-white/70 group-hover:text-gold transition-colors line-clamp-2 mb-2">
                              {chapter.title}
                            </h4>
                            <ReviewStars
                              chapterId={chapter.id}
                              size="sm"
                              showCount={false}
                            />
                            <p className="text-sm text-gray-500 flex items-center gap-2 italic mt-1">
                              <span className="material-symbols-outlined text-xs">
                                schedule
                              </span>{" "}
                              {chapter.totalCharacterCount
                                ? `${getReadingTime(chapter.totalCharacterCount)} min de lecture`
                                : " "}
                            </p>
                          </div>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
