/**
 * Centralized localStorage utility for the web app.
 * All keys are prefixed with "web_" to avoid collisions with admin/mobile apps.
 */

const PREFIX = "web_";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  getString(key: string, fallback: string = ""): string {
    try {
      return localStorage.getItem(PREFIX + key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    try {
      if (typeof value === "string") {
        localStorage.setItem(PREFIX + key, value);
      } else {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      }
    } catch {}
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
};

export const STORAGE_KEYS = {
  TOKEN: "token",
  LANGUAGE: "language",
  THEME: "theme",
  CATALOGUE_VIEW_TYPE: "catalogue_view_type",
  CATALOGUE_SORT_METRICS: "catalogue_sort_metrics",
  CATALOGUE_VIEW_MODE: "catalogue_view_mode",
  CATALOGUE_SELECTED_GENRE: "catalogue_selected_genre",
} as const;
