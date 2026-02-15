import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogStore } from "../stores/catalogStore";
import ErrorMessage from "../components/common/ErrorMessage";
import ChapterCover from "../components/common/ChapterCover";
import ReviewStars from "../components/common/ReviewStars";
import ChapterIntensityIndicators from "../components/common/ChapterIntensityIndicators";
import { getReadingTime } from "../lib/functions";

type ViewMode = "grid" | "list";
type ViewType = "catalog" | "selection";
type SortBy = "intensite" | "douceur" | "danger" | "transformation";
type SortDirection = "asc" | "desc" | "none";
type SortMetrics = Record<SortBy, SortDirection>;
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

export const GENRES: Record<Genre, { label: string; icon: string }> = {
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

// LocalStorage keys
const CATALOGUE_STORAGE_KEYS = {
  VIEW_TYPE: "catalogue_viewType",
  SORT_METRICS: "catalogue_sortMetrics",
  VIEW_MODE: "catalogue_viewMode",
};

// Default sort metrics (all "none")
const DEFAULT_SORT_METRICS: SortMetrics = {
  intensite: "none",
  douceur: "none",
  danger: "none",
  transformation: "none",
};

// Get initial view type from localStorage or default to "selection"
const getInitialViewType = (): ViewType => {
  try {
    const stored = localStorage.getItem(CATALOGUE_STORAGE_KEYS.VIEW_TYPE);
    if (stored === "catalog" || stored === "selection") {
      return stored as ViewType;
    }
  } catch (e) {
    // localStorage might not be available in SSR
    console.warn("localStorage not available:", e);
  }
  return "selection";
};

// Get initial sort metrics from localStorage or default to all "none"
const getInitialSortMetrics = (): SortMetrics => {
  try {
    const stored = localStorage.getItem(CATALOGUE_STORAGE_KEYS.SORT_METRICS);
    if (stored) {
      return JSON.parse(stored) as SortMetrics;
    }
  } catch (e) {
    // localStorage might not be available in SSR
    console.warn("localStorage not available:", e);
  }
  return DEFAULT_SORT_METRICS;
};

// Get initial view mode from localStorage or default to "grid"
const getInitialViewMode = (): ViewMode => {
  try {
    const stored = localStorage.getItem(CATALOGUE_STORAGE_KEYS.VIEW_MODE);
    if (stored === "list" || stored === "grid") {
      return stored as ViewMode;
    }
  } catch (e) {
    // localStorage might not be available in SSR
    console.warn("localStorage not available:", e);
  }
  return "grid";
};

export default function Catalogue() {
  const { chapters, isLoading, error, fetchChapters } = useCatalogStore();
  const [viewType, setViewType] = useState<ViewType>(getInitialViewType());
  const [sortMetrics, setSortMetrics] = useState<SortMetrics>(getInitialSortMetrics());
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode());

  const THEMATIC_SECTIONS = [{
      id: "frissons",
      title: "Frissons Silencieux",
      subtitle: "Quand tout commence dans un regard",
      description:
        "Des récits de lente montée. Peu de bruit, beaucoup de tension intérieure. Le frisson naît dans le silence.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_douceur * 2 + a.niveau_transformation;
          const scoreB = b.niveau_douceur * 2 + b.niveau_transformation;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "fievre",
      title: "Fièvre des Sens",
      subtitle: "Là où la peau parle avant les mots",
      description:
        "Des récits d’intensité pure. Le désir s’impose, les corps s’appellent, la tension ne retient rien. Ici, la passion est directe, assumée, presque brûlante.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_intensite * 2 + a.niveau_danger;
          const scoreB = b.niveau_intensite * 2 + b.niveau_danger;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "eveils_delicats",
      title: "Éveils Délicats",
      subtitle: "Le premier frisson n’est jamais innocent",
      description:
        "Des récits lumineux, où la douceur domine et où le désir s’apprend dans la confiance.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_douceur * 2 + a.niveau_transformation;
          const scoreB = b.niveau_douceur * 2 + b.niveau_transformation;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "vertiges",
      title: "Vertiges Interdits",
      subtitle: "Aimer quand tout vacille",
      description:
        "Des histoires où le danger rend l’amour plus brûlant. Là où les conventions tremblent et où l’attirance devient risque.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_danger * 2 + a.niveau_intensite;
          const scoreB = b.niveau_danger * 2 + b.niveau_intensite;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    
    {
      id: "passion",
      title: "Passions Abyssales",
      subtitle: "Plonger sans garantie de remonter intact",
      description:
        "Des histoires profondes, parfois dangereuses, où aimer signifie accepter de se perdre.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_danger * 2 + a.niveau_transformation;
          const scoreB = b.niveau_danger * 2 + b.niveau_transformation;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "etreintes_sauvages",
      title: "Étreintes Sauvages",
      subtitle: "L’instinct avant la raison",
      description:
        "Des amours instinctives, viscérales, presque animales. Le corps parle plus fort que la prudence.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA =
            a.niveau_intensite + a.niveau_danger + (5 - a.niveau_douceur);
          const scoreB =
            b.niveau_intensite + b.niveau_danger + (5 - b.niveau_douceur);
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "rituels_ombre",
      title: "Rituels de l’Ombre",
      subtitle: "Le désir comme cérémonie",
      description:
        "Des histoires chargées de symboles, de tension maîtrisée, d’intensité intérieure. Le corps devient langage.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA =
            a.niveau_transformation + a.niveau_danger + a.niveau_intensite;
          const scoreB =
            b.niveau_transformation + b.niveau_danger + b.niveau_intensite;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "jeux_de_pouvoir",
      title: "Jeux de Pouvoir",
      subtitle: "Entre contrôle et abandon",
      description:
        "Des relations électriques, tendues, intenses. Ici, le désir est un affrontement élégant.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = (a.niveau_danger + a.niveau_intensite) * 1.5;
          const scoreB = (b.niveau_danger + b.niveau_intensite) * 1.5;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "transformations_intimes",
      title: "Transformations Intimes",
      subtitle: "Aimer pour devenir autre",
      description:
        "Des histoires où l’amour change tout. Le désir devient passage, révélation, métamorphose.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_transformation * 2 + a.niveau_douceur;
          const scoreB = b.niveau_transformation * 2 + b.niveau_douceur;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
    {
      id: "amours_fondateurs",
      title: "Amours Fondateurs",
      subtitle: "Les histoires qui rendent le reste possible",
      description:
        "Des récits structurants, émotionnellement denses, où la douceur et la transformation s’équilibrent.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA = a.niveau_transformation + a.niveau_douceur;
          const scoreB = b.niveau_transformation + b.niveau_douceur;
          return scoreB - scoreA;
        })
        .slice(0, 6),
    },
  ];
  // Save viewType to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CATALOGUE_STORAGE_KEYS.VIEW_TYPE, viewType);
    } catch (e) {
      console.warn("Failed to save view type preference:", e);
    }
  }, [viewType]);

  // Save sortMetrics to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CATALOGUE_STORAGE_KEYS.SORT_METRICS, JSON.stringify(sortMetrics));
    } catch (e) {
      console.warn("Failed to save sort metrics preference:", e);
    }
  }, [sortMetrics]);

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(CATALOGUE_STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (e) {
      console.warn("Failed to save view mode preference:", e);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Handle sort button clicks with cycling: asc -> desc -> none
  const handleSortClick = (metric: SortBy) => {
    const currentDirection = sortMetrics[metric];
    let newDirection: SortDirection;

    if (currentDirection === "asc") {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = "none";
    } else {
      newDirection = "asc";
    }

    setSortMetrics({
      ...sortMetrics,
      [metric]: newDirection,
    });
  };

  // Get active metrics (those that are not "none")
  const activeMetrics: Array<[SortBy, SortDirection]> = (
    ["intensite", "douceur", "danger", "transformation"] as const
  )
    .filter((metric) => sortMetrics[metric] !== "none")
    .map((metric) => [metric, sortMetrics[metric]]);

  // Sort chapters by multiple metrics
  const sortedChapters = [...chapters].sort((a, b) => {
    // If no active metrics, return original order
    if (activeMetrics.length === 0) return 0;

    // Compare by each active metric in order
    for (const [metric, direction] of activeMetrics) {
      const scoreA = a[`niveau_${metric}` as keyof typeof a] as number || 0;
      const scoreB = b[`niveau_${metric}` as keyof typeof b] as number || 0;

      if (scoreA !== scoreB) {
        return direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
      }
    }

    // If all metrics are equal, maintain original order
    return 0;
  });

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

  return (
    <div className="min-h-screen">
      {/* Sticky Filter Section */}
      <section className="sticky top-12 z-40 bg-boudoir-950/95 backdrop-blur-xl border-b border-boudoir-800">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* View Type Filters */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewType("selection")}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    viewType === "selection"
                      ? "bg-primary text-white"
                      : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                  }`}>
                  Notre sélection
                </button>
                <button
                  type="button"
                  onClick={() => setViewType("catalog")}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    viewType === "catalog"
                      ? "bg-primary text-white"
                      : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                  }`}>
                  Tout le catalogue
                </button>
              </div>

              {/* Sort By Buttons - only show when in catalog view */}
              {viewType === "catalog" && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold self-center">
                    Trier par :
                  </span>
                  {(["intensite", "douceur", "danger", "transformation"] as const).map(
                    (option) => {
                      const direction = sortMetrics[option];
                      const isActive = direction !== "none";
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSortClick(option)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap capitalize flex items-center gap-1 ${
                            isActive
                              ? "border-2 border-gold text-gold"
                              : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                          }`}>
                          <span>{option}</span>
                          {isActive && (
                            <span className="text-xs">
                              {direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
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
        ) : viewType === "catalog" ? (
          // Catalog view - all chapters sorted by intensity metric
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-accent-gold mb-2 italic">
                Tout le catalogue
              </h2>
              <p className="text-sm text-charcoal dark:text-white/70">
                {sortedChapters.length} œuvre
                {sortedChapters.length > 1 ? "s" : ""} disponible
                {sortedChapters.length > 1 ? "s" : ""}
                {activeMetrics.length > 0 && (
                  <>
                    {" — Triée par "}
                    <span className="capitalize font-semibold">
                      {activeMetrics
                        .map(
                          ([metric, direction]) =>
                            `${metric} ${direction === "asc" ? "↑" : "↓"}`
                        )
                        .join(", ")}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }`}>
              {sortedChapters.map((chapter, index) => {
                return (
                  <Link
                    key={chapter.id}
                    to={`/chapters/${chapter.id}`}
                    className={` dark:border-white/30 dark:bg-white/5 border p-3 rounded-md  ${viewMode === "grid" ? "group" : "flex gap-4 group"}`}>
                    <div
                      className={` ${
                        viewMode === "grid"
                          ? "aspect-[3/4] !text-md overflow-hidden rounded-lg mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                          : "w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                      }`}>
                      {chapter.coverAsset?.url ? (
                        <ChapterCover
                          imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
                          title={chapter.protagonistName || chapter.title}
                          showPremiumBadge={false}
                          showLimitedEditionBadge={false}
                          textSize="md"
                          // showBookmarkIcon={chapter.hasStartedReading}
                          showTitleOverlay={viewMode === "grid"}
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
                      {/* <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="bg-gold text-charcoal px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-gold-light transition-colors">
                          Lire l'extrait
                        </button>
                      </div> */}
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
                          {chapter.accroche_love || chapter.accroche_classic}
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

                        {chapter && (
                          <ChapterIntensityIndicators
                            chapter={chapter}
                            variant="compact"
                          />
                        )}
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
                      : "grid grid-cols-1 md:grid-cols-3 gap-4"
                  }>
                  {section.list.map((chapter, index) => (
                    <Link
                      key={chapter.id}
                      to={`/chapters/${chapter.id}`}
                      className={`  dark:border-white/30 dark:bg-white/5 border p-3 rounded-md ${viewMode === "grid" ? "group" : "flex gap-4 group"}`}>
                      <div
                        className={`relative ${
                          viewMode === "grid"
                            ? "aspect-[3/4] overflow-hidden rounded-lg mb-3 relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                            : "w-20 h-28 shrink-0 rounded-lg overflow-hidden relative bg-gradient-to-br from-boudoir-800 to-boudoir-900"
                        }`}>
                        {index < 3 && (
                          <div
                            className={`absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-lg bg-gradient-to-br ${index === 0 ? "border-[#D4AF37]/50 from-[#D4AF37] via-[#FBF5B7] to-[#8B5E3C]" : index === 1 ? "border-stone-300/50 from-[#C0C0C0] via-[#F5F5F5] to-[#7A7A7A]" : "border-[#CD7F32]/50 from-[#CD7F32] via-[#E6BE8A] to-[#633517]"} `}>
                            <span className="text-velvet-brown font-display font-bold text-sm">
                              {/* {index + 1} */}
                            </span>
                          </div>
                        )}
                        {chapter.coverAsset?.url ? (
                          <ChapterCover
                            imageUrl={`${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`}
                            title={chapter.protagonistName || chapter.title}
                            showPremiumBadge={false}
                            showLimitedEditionBadge={false}
                            showBookmarkIcon={
                              viewMode === "grid" && chapter.hasStartedReading
                            }
                            showTitleOverlay={viewMode === "grid"}
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
                        {/* <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="bg-gold text-charcoal px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-gold-light transition-colors">
                              Lire l'extrait
                            </button>
                          </div> */}
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
                          <p className="text-xs text-charcoal dark:text-white/70  font-light leading-relaxed mt-2">
                            {chapter.accroche_dark_collection ||
                              chapter.accroche_classic}
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
                          {chapter && (
                            <ChapterIntensityIndicators
                              chapter={chapter}
                              variant="full"
                            />
                          )}
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
