/**
 * Centralized localStorage utility for the admin app.
 * All keys are prefixed with "admin_" to avoid collisions with web/mobile apps.
 */

const PREFIX = "admin_";

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
    } catch {
      // localStorage unavailable or quota exceeded
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
};

/**
 * All storage keys used in the admin app.
 * Centralized here for easy maintenance and discoverability.
 */
export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  DEBUG_MODE: "debug_mode",
  CHAPTER_VIEW_MODE: "chapter_view_mode",
  CHAPTER_SORT_BY: "chapter_sort_by",
  CHAPTER_STATUS_FILTER: "chapter_status_filter",
  VOLUME_VIEW_MODE: "volume_view_mode",
  USER_VIEW_MODE: "user_view_mode",
  USER_DETAIL_SIDEBAR: "user_detail_sidebar",
  USER_FILTER_PRESETS: "user_filter_presets",
  REVENUE_PERIOD: "revenue_period",
  CUSTOM_STORIES_VIEW: "custom_stories_view",
  // Dynamic keys (use with template)
  TABLE_COLUMNS: (tableName: string) => `table_columns_${tableName}`,
} as const;
