import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogStore } from "../stores/catalogStore";
import ErrorMessage from "../components/common/ErrorMessage";
import ChapterCover from "../components/common/ChapterCover";
import { storage, STORAGE_KEYS } from "../lib/storage";
import ReviewStars from "../components/common/ReviewStars";
import ChapterIntensityIndicators from "../components/common/ChapterIntensityIndicators";
import ChapterListView from "../components/chapter/ChapterListView";
import ChapterGridView from "../components/chapter/ChapterGridView";
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

export const GENRES: Record<Genre, { translationKey: string; icon: string }> = {
  all: { translationKey: "genres.all", icon: "category" },
  PASSIONS_CHARNELLES: {
    translationKey: "genres.PASSIONS_CHARNELLES",
    icon: "local_fire_department",
  },
  ROMANCES_TENDRES: {
    translationKey: "genres.ROMANCES_TENDRES",
    icon: "favorite",
  },
  MYSTERIES_SENSUELS: {
    translationKey: "genres.MYSTERIES_SENSUELS",
    icon: "nightlife",
  },
  INTERDITS: { translationKey: "genres.INTERDITS", icon: "lock" },
  CONQUETES: { translationKey: "genres.CONQUETES", icon: "trending_up" },
  REVES_SECRETS: { translationKey: "genres.REVES_SECRETS", icon: "cloud" },
  PASSION_BRUTALE: {
    translationKey: "genres.PASSION_BRUTALE",
    icon: "whatshot",
  },
  AMOUR_COMPLIQUE: {
    translationKey: "genres.AMOUR_COMPLIQUE",
    icon: "favorite_border",
  },
  DESIR_NOCTURNE: {
    translationKey: "genres.DESIR_NOCTURNE",
    icon: "dark_mode",
  },
  LIBERATION: { translationKey: "genres.LIBERATION", icon: "flight_takeoff" },
  DECOUVERTE_DE_SOI: {
    translationKey: "genres.DECOUVERTE_DE_SOI",
    icon: "lightbulb",
  },
  INTIMITE_PSYCHOLOGIQUE: {
    translationKey: "genres.INTIMITE_PSYCHOLOGIQUE",
    icon: "psychology",
  },
  EVEIL_DU_DESIR: {
    translationKey: "genres.EVEIL_DU_DESIR",
    icon: "local_fire_department",
  },
  RELATIONS_TRANSFORMATRICES: {
    translationKey: "genres.RELATIONS_TRANSFORMATRICES",
    icon: "auto_fix_high",
  },
  MEMOIRE_DU_CORPS: {
    translationKey: "genres.MEMOIRE_DU_CORPS",
    icon: "self_improvement",
  },
};

// Default sort metrics (all "none")
const DEFAULT_SORT_METRICS: SortMetrics = {
  intensite: "none",
  douceur: "none",
  danger: "none",
  transformation: "none",
};

const getInitialViewType = (): ViewType => {
  const stored = storage.getString(STORAGE_KEYS.CATALOGUE_VIEW_TYPE, "catalog");
  return (stored === "catalog" || stored === "selection") ? stored : "catalog";
};

const getInitialSortMetrics = (): SortMetrics => {
  return storage.get<SortMetrics>(STORAGE_KEYS.CATALOGUE_SORT_METRICS, DEFAULT_SORT_METRICS);
};

const getInitialViewMode = (): ViewMode => {
  const stored = storage.getString(STORAGE_KEYS.CATALOGUE_VIEW_MODE, "grid");
  return (stored === "list" || stored === "grid") ? stored : "grid";
};

export default function Catalogue() {
  const { chapters, isLoading, error, fetchChapters } = useCatalogStore();
  const [viewType, setViewType] = useState<ViewType>(getInitialViewType());
  const [sortMetrics, setSortMetrics] = useState<SortMetrics>(
    getInitialSortMetrics(),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode());

  const THEMATIC_SECTIONS = [
    {
      id: "frissons",
      title: "Frissons Silencieux",
      subtitle: "Quand tout commence dans un regard",
      description:
        "Des récits de lente montée. Peu de bruit, beaucoup de tension intérieure. Le frisson naît dans le silence.",
      list: [...chapters]
        .sort((a, b) => {
          const scoreA =
            a.niveau_douceur * 2 + a.niveau_transformation + a.niveau_intensite;
          const scoreB =
            b.niveau_douceur * 2 + b.niveau_transformation + b.niveau_intensite;
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
  useEffect(() => { storage.set(STORAGE_KEYS.CATALOGUE_VIEW_TYPE, viewType); }, [viewType]);
  useEffect(() => { storage.set(STORAGE_KEYS.CATALOGUE_SORT_METRICS, sortMetrics); }, [sortMetrics]);
  useEffect(() => { storage.set(STORAGE_KEYS.CATALOGUE_VIEW_MODE, viewMode); }, [viewMode]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Scroll to top when viewType, sortMetrics, or viewMode change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewType, sortMetrics, viewMode]);

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
      const scoreA = (a[`niveau_${metric}` as keyof typeof a] as number) || 0;
      const scoreB = (b[`niveau_${metric}` as keyof typeof b] as number) || 0;

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
      <section className="sticky top-12 z-40 bg-boudoir-300/50 dark:bg-boudoir-900/50 backdrop-blur-xl border-b border-boudoir-800">
        <div className="mx-auto px-6 py-5">
          <div className="flex justify-between items-start md:items-center gap-6">
            {/* View Type Filters */}
            <div className="flex flex-wrap  gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  onClick={() => setViewType("selection")}
                  className={`p-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    viewType === "selection"
                      ? "bg-primary text-white"
                      : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                  }`}>
                  Notre sélection
                </button>
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
              {/* Sort By Buttons - only show when in catalog view */}
              {viewType === "catalog" && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold self-center">
                    Trier par :
                  </span>
                  {(
                    [
                      {
                        label: "intensite",

                        icon: "local_fire_department",
                        color: "bg-red-500",
                        textColor: "text-red-600 dark:text-red-600",
                      },
                      {
                        label: "douceur",
                        icon: "favorite",
                        color: "bg-pink-500",
                        textColor: "text-pink-600 dark:text-pink-600",
                      },
                      {
                        label: "danger",
                        icon: "warning",
                        color: "bg-amber-500",
                        textColor: "text-amber-600 dark:text-amber-600",
                      },
                      {
                        label: "transformation",
                        icon: "auto_fix_high",
                        color: "bg-purple-500",
                        textColor: "text-purple-600 dark:text-purple-600",
                      },
                    ] as const
                  ).map((option) => {
                    const direction = sortMetrics[option.label];
                    const isActive = direction !== "none";
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleSortClick(option.label)}
                        className={`p-2 rounded-full text-xs font-medium transition-all whitespace-nowrap capitalize flex items-center gap-1 ${
                          isActive
                            ? "border-2 border-gold text-gold"
                            : "bg-boudoir-300/50 dark:bg-boudoir-900/50 border border-boudoir-800 text-charcoal dark:text-white/70 hover:border-gold/50"
                        }`}>
                        <span
                          className={`material-symbols-outlined text-sm ${option.textColor}`}>
                          {option.icon}
                        </span>
                        <span className="hidden md:flex">{option.label}</span>
                        {isActive && (
                          <span className="material-symbols-outlined text-sm font-bold">
                            {direction === "asc"
                              ? "trending_up"
                              : "trending_down"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
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
              <h2 className="text-3xl md:text-4xl font-display italic text-stone-700 dark:text-stone-100 newsreader">
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
                            `${metric} ${direction === "asc" ? "↑" : "↓"}`,
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
                  : "space-y-14"
              }`}>
              {sortedChapters.map((chapter) =>
                viewMode === "grid" ? (
                  <ChapterGridView
                    key={chapter.id}
                    chapter={chapter}
                  />
                ) : (
                  <ChapterListView
                    key={chapter.id}
                    chapter={chapter}
                  />
                ),
              )}
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
                      <h3 className="text-3xl md:text-4xl font-display italic text-stone-700 dark:text-stone-100 newsreader">
                        {section.title}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-charcoal dark:text-white/70 font-semibold mb-1">
                        {section.subtitle}
                      </p>
                      <p className="handwriting text-xl md:text-2xl text-primary-caramel dark:text-white/60 py-6">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Books Grid */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-4 gap-3"
                      : "grid grid-cols-1  gap-4"
                  }>
                  {section.list.map((chapter, index) =>
                    viewMode === "grid" ? (
                      <ChapterGridView
                        key={chapter.id}
                        chapter={chapter}
                        index={index}
                        top3={true}
                      />
                    ) : (
                      <ChapterListView
                        key={chapter.id}
                        chapter={chapter}
                        index={index}
                        top3={true}
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
