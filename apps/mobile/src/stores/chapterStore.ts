import { create } from 'zustand';
import { fetchChaptersWithCache } from '@/services/db/chapters-cache';
import type { Chapter } from '@/types';

interface FetchOptions {
  forceRefresh?: boolean;
}

interface ChapterState {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  loading: boolean;
  error: string | null;

  fetchChapters: (options?: FetchOptions) => Promise<void>;
  setSelectedChapter: (chapter: Chapter | null) => void;
  clearError: () => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  chapters: [],
  selectedChapter: null,
  loading: false,
  error: null,

  fetchChapters: async (options) => {
    set({ loading: true, error: null });
    try {
      const chapters = await fetchChaptersWithCache(options);
      set({ chapters, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),
  clearError: () => set({ error: null }),
}));
