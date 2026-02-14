import { useEffect, useState, useMemo } from "react";
import { useCatalogStore } from "../stores/catalogStore";
import { getGenreTranslation } from "../lib/genreTranslations";
import {
  HeroSection,
  AtmospheresFilter,
  NouveautésSection,
  CherJournalQuote,
  MostPassionateSection,
  WomenOfCherJournalQuote,
} from "../components/homeSections";

export default function HomeNew() {
  const { chapters, fetchChapters } = useCatalogStore();
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string | null>(
    null,
  );


  // Extract all unique genres from chapters
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    chapters.forEach((chapter) => {
      chapter.genres?.forEach((genreTag) => {
        if (genreTag.genre) genres.add(genreTag.genre);
      });
    });
    return Array.from(genres).sort();
  }, [chapters]);

  // Create atmospheres list from genres
  const ATMOSPHERES = useMemo(
    () => [
      { id: "all", label: "Ambiances" },
      ...availableGenres.map((genre) => ({
        id: genre,
        label: getGenreTranslation(genre),
      })),
    ],
    [availableGenres],
  );

  // Initialize selected atmosphere on first load
  useEffect(() => {
    if (selectedAtmosphere === null && availableGenres.length > 0) {
      setSelectedAtmosphere("all");
    }
  }, [availableGenres, selectedAtmosphere]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Filter chapters based on selected atmosphere
  const filteredChapters = useMemo(() => {
    if (selectedAtmosphere === "all" || !selectedAtmosphere) {
      return chapters;
    }
    return chapters.filter((chapter) =>
      chapter.genres?.some((genreTag) => genreTag.genre === selectedAtmosphere),
    );
  }, [chapters, selectedAtmosphere]);

  // Get featured chapter (first one) for hero section
  const featuredChapter =
    chapters.find((chap) => chap.isFavorite) || chapters[0];
  const heroData = featuredChapter
    ? {
        title: featuredChapter.title,
        subtitle: featuredChapter.protagonistName || "Sélection du moment",
        description:
          featuredChapter.accroche_marketing ??
          featuredChapter.description ??
          "Plongez dans cet univers captivant et sensuel où les émotions prennent forme...",
        imageUrl: featuredChapter.coverAsset?.url
          ? `${import.meta.env.VITE_API_URL ?? ""}${featuredChapter.coverAsset.url}`
          : undefined,
        id: featuredChapter.id,
        hasStartedReading: featuredChapter.hasStartedReading,
      }
    : undefined;

  // Get carousel items from filtered chapters
  const carouselItems = filteredChapters.slice(0, 4).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    volumeCount: chapter._count?.volumes ?? 0,
    imageUrl: chapter.coverAsset?.url
      ? `${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`
      : undefined,
    fallbackTitle: chapter.title,
    hasStartedReading: chapter.hasStartedReading,
    isFavorite: chapter.isFavorite,
    protagonistName: chapter.protagonistName,
  }));

  // Get popular items from filtered chapters
  const popularItems = filteredChapters.slice(0, 3).map((chapter, index) => ({
    id: chapter.id,
    title: chapter.title,
    badge: ["Coup de foudre", "Mystère", "Audace"][index] || "Populaire",
    badgeColor: [
      "text-charcoal dark:text-white/70",
      "text-charcoal dark:text-white/70",
      "text-charcoal dark:text-white/70",
    ][index],
    subtitle: chapter.protagonistName || "",
    description: chapter.accroche_marketing ?? chapter.description ?? undefined,
    genres: chapter.genres || [],
    imageUrl: chapter.coverAsset?.url
      ? `${import.meta.env.VITE_API_URL ?? ""}${chapter.coverAsset.url}`
      : undefined,
    hasStartedReading: chapter.hasStartedReading,
    isFavorite: chapter.isFavorite,
    protagonistName: chapter.protagonistName,
  }));

  return (
    <div className="min-h-screen">
      {heroData && (
        <HeroSection
          chapters={chapters}
          heroData={heroData}
        />
      )}

      <AtmospheresFilter
        chapters={chapters}
        atmospheres={ATMOSPHERES}
        selectedAtmosphere={selectedAtmosphere}
        onSelectAtmosphere={setSelectedAtmosphere}
      />
      <NouveautésSection
        chapters={filteredChapters}
        items={carouselItems}
      />
      <CherJournalQuote chapters={chapters} />
      <MostPassionateSection
        chapters={filteredChapters}
        items={popularItems}
      />
      <WomenOfCherJournalQuote chapters={chapters} />
    </div>
  );
}
