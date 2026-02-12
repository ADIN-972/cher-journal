import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

type Perspective = 'narrator' | 'protagonist';

interface VolumeContent {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  chapterTitle: string;
  volumeNumber: number;
  illustrationUrl: string | null;
}

interface ReadingProgress {
  volumeId: string;
  scrollPosition: number;
  timestamp: number;
}

interface ReadingSettings {
  fontSize: number; // 14-24
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  theme: 'light' | 'dark';
  lineHeight: number; // 1.5-2.5
}

interface ReaderState {
  currentVolume: VolumeContent | null;
  perspective: Perspective;
  isLoading: boolean;
  error: string | null;
  settings: ReadingSettings;
  progress: Record<string, ReadingProgress>;

  // Actions
  loadVolume: (volumeId: string, perspective?: Perspective) => Promise<void>;
  changePerspective: (perspective: Perspective) => Promise<void>;
  updateSettings: (settings: Partial<ReadingSettings>) => void;
  saveProgress: (volumeId: string, scrollPosition: number) => void;
  getProgress: (volumeId: string) => ReadingProgress | null;
  clearError: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      currentVolume: null,
      perspective: 'narrator',
      isLoading: false,
      error: null,
      settings: {
        fontSize: 18,
        fontFamily: 'serif',
        theme: 'light',
        lineHeight: 1.8,
      },
      progress: {},

      /**
       * Load volume content
       */
      loadVolume: async (volumeId: string, perspective?: Perspective) => {
        set({ isLoading: true, error: null });

        const currentPerspective = perspective || get().perspective;

        try {
          const volume = await api.getVolumeText(volumeId);

          set({
            currentVolume: volume,
            perspective: currentPerspective,
            isLoading: false,
            error: null,
          });

          // Restore scroll position if exists
          const progress = get().getProgress(volumeId);
          if (progress) {
            setTimeout(() => {
              window.scrollTo(0, progress.scrollPosition);
            }, 100);
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to load volume',
            isLoading: false,
          });
        }
      },

      /**
       * Change perspective and reload content
       */
      changePerspective: async (perspective: Perspective) => {
        const currentVolume = get().currentVolume;
        if (!currentVolume) return;

        set({ perspective });
        await get().loadVolume(currentVolume.id, perspective);
      },

      /**
       * Update reading settings
       */
      updateSettings: (newSettings: Partial<ReadingSettings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      /**
       * Save reading progress
       */
      saveProgress: (volumeId: string, scrollPosition: number) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [volumeId]: {
              volumeId,
              scrollPosition,
              timestamp: Date.now(),
            },
          },
        }));
      },

      /**
       * Get reading progress for a volume
       */
      getProgress: (volumeId: string) => {
        return get().progress[volumeId] || null;
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'reader-storage',
      partialize: (state) => ({
        settings: state.settings,
        progress: state.progress,
      }),
    }
  )
);

export default useReaderStore;
