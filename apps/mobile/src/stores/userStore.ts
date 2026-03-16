import { create } from 'zustand';

interface UserProgress {
  chapterId: string;
  volumeNumber: number;
  perspective: 'NARRATOR' | 'PROTAGONIST';
  progress: number;
  completedAt?: string;
}

interface UserState {
  progress: Map<string, UserProgress>;
  bookmarks: string[];
  loading: boolean;
  error: string | null;

  updateProgress: (chapterId: string, volumeNumber: number, progress: number) => Promise<void>;
  addBookmark: (chapterId: string) => Promise<void>;
  removeBookmark: (chapterId: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  progress: new Map(),
  bookmarks: [],
  loading: false,
  error: null,

  updateProgress: async (_chapterId: string, _volumeNumber: number, _progress: number) => {
    set({ loading: true, error: null });
    try {
      // TODO: Save to DB + queue for sync
      throw new Error('Not implemented');
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBookmark: async (_chapterId: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Save bookmark
      throw new Error('Not implemented');
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  removeBookmark: async (_chapterId: string) => {
    // TODO: Remove bookmark
  },

  clearError: () => set({ error: null }),
}));
