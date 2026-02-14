/**
 * Genre translations with poetic descriptions
 * Maps genre codes to their French display names
 */

export const GENRE_TRANSLATIONS: Record<string, string> = {
  // Core passions
  PASSIONS_CHARNELLES: "Passions Charnelles",
  ROMANCES_TENDRES: "Romances Tendres",
  MYSTERIES_SENSUELS: "Mystères Sensuels",
  INTERDITS: "Interdits",
  CONQUETES: "Conquêtes",

  // Dreams and exploration
  REVES_SECRETS: "Rêves Secrets",
  PASSION_BRUTALE: "Passion Brute",
  AMOUR_COMPLIQUE: "Amour Compliqué",
  DESIR_NOCTURNE: "Désir Nocturne",

  // Personal journeys
  LIBERATION: "Libération",
  DECOUVERTE_DE_SOI: "Découverte de Soi",
  INTIMITE_PSYCHOLOGIQUE: "Intimité Psychologique",
  EVEIL_DU_DESIR: "Éveil du Désir",
  RELATIONS_TRANSFORMATRICES: "Relations Transformatrices",
  MEMOIRE_DU_CORPS: "Mémoire du Corps",
};

/**
 * Get the translated name for a genre
 * Falls back to formatted genre name if translation not found
 */
export function getGenreTranslation(genre: string): string {
  return (
    GENRE_TRANSLATIONS[genre] || genre.replace(/_/g, " ")
  );
}

/**
 * Get multiple genre translations
 */
export function getGenreTranslations(genres: string[]): string[] {
  return genres.map(getGenreTranslation);
}
