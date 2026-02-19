import { create } from "zustand";
import api from "../lib/api";

interface CoverAsset {
  id: string;
  url: string;
  mimeType: string;
}

interface GenreTag {
  genre: string;
}

interface Pricing {
  priceFreeToRead: number;
  pricePaywall: number;
  priceEpilogue: number;
  totalVolumes: number;
  bundleOriginalPrice: number;
  bundleDiscountedPrice: number;
}

export interface Chapter {
  id: string;
  title: string;
  protagonistName: string;
  status: string;
  publishedAt?: string;
  scheduledFor?: string | null;
  coverAssetId?: string | null;
  coverAsset?: CoverAsset | null;
  isArchived?: boolean;
  createdAt?: string;
  genres?: GenreTag[];
  _count?: {
    volumes: number;
  };
  volumes?: Volume[];
  hasAccess?: boolean;
  hasStartedReading?: boolean; // True if user has progress > 0 in any volume
  isFavorite?: boolean; // True if this chapter is marked as "Sélection du moment"
  versionScope?: "BASE" | "ALL" | null;
  pricing?: Pricing;
  totalCharacterCount?: number;
  description?: string | null;

  accroche_classic: string | null;
  accroche_dark: string | null;
  accroche_love: string | null;
  accroche_marketing: string | null;
  accroche_dark_collection: string | null;
  niveau_intensite: number;
  niveau_douceur: number;
  niveau_danger: number;
  niveau_transformation: number;
}

interface Volume {
  id: string;
  title: string;
  volumeNumber: number;
  chapterId: string;
  wordCount?: number;
  publishedAt?: string;
  price?: number;
  isPurchased?: boolean;
  canWaitToRead?: boolean;
  waitDuration?: number;
  isAccessible?: boolean;
  isUnlocked?: boolean;
  needsEntitlement?: boolean;
  needsUpgrade?: boolean;
  unlocksAt?: string | null;
  canStartWait?: boolean;
  // New properties from backend accessibility system
  blockageType?: string | null;
  blockageInfo?: {
    waitRemaining?: number | null;
    priceFreeToRead?: number;
    pricePaywall?: number;
    priceEpilogue?: number;
  } | null;
  illustrationAsset?: CoverAsset | null;
  isFree?: boolean;
  status?: string;
  progress?: number; // Reading progress percentage (0-100) - defaults to NARRATOR perspective
  progressByPerspective?: {
    NARRATOR?: number;
    PROTAGONIST?: number;
  }; // Reading progress per perspective
  accessByPerspective?: {
    NARRATOR?: {
      isAccessible: boolean;
      blockageType: string | null;
      blockageInfo?: any;
      canStartWait?: boolean;
    };
    PROTAGONIST?: {
      isAccessible: boolean;
      blockageType: string | null;
      blockageInfo?: any;
      canStartWait?: boolean;
    };
  }; // Access info per perspective
}

interface CatalogState {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChapters: () => Promise<void>;
  fetchChapter: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  chapters: [],
  currentChapter: null,
  isLoading: false,
  error: null,

  /**
   * Fetch all published chapters
   */
  fetchChapters: async () => {
    set({ isLoading: true, error: null });

    try {
      const chapters = await api.getChapters();

      set({
        chapters,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch chapters",
        isLoading: false,
      });
    }
  },

  /**
   * Fetch a specific chapter with volumes
   */
  fetchChapter: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const chapter = await api.getChapter(id);

      set({
        currentChapter: chapter,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch chapter",
        isLoading: false,
      });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useCatalogStore;
