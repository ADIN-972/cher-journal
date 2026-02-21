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
  loadingRequestId: string | null; // Track current load request to prevent stale responses

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
      loadingRequestId: null,
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
        const currentPerspective = perspective || get().perspective;
        const requestId = `${volumeId}-${Date.now()}-${Math.random()}`;

        set({ isLoading: true, error: null, loadingRequestId: requestId });

        try {
          console.log(`[Reader] Loading volume: ${volumeId} with perspective: ${currentPerspective}`);
          const perspectiveUpper = currentPerspective === 'protagonist' ? 'PROTAGONIST' : 'NARRATOR';
          const volume = await api.getVolumeText(volumeId, perspectiveUpper);
          console.log(`[Reader] Received volume response:`, volume);

          // Only update state if this response is for the current request
          // This prevents old API responses from updating state after user has switched volumes
          const state = get();
          console.log(`[Reader] Current request ID: ${state.loadingRequestId}, response request ID: ${requestId}`);

          if (state.loadingRequestId === requestId) {
            // Validate response has required fields
            if (!volume || !volume.content) {
              console.error(`[Reader] VALIDATION_ERROR: Invalid API response - Missing content field`, {
                volumeId,
                perspective: currentPerspective,
                volumeExists: !!volume,
                contentExists: volume?.content ? true : false,
                fullResponse: volume
              });
              throw new Error('Invalid response: missing content');
            }

            console.log(`[Reader] Setting volume content, isLoading: false`);
            set({
              currentVolume: volume,
              perspective: currentPerspective,
              isLoading: false,
              error: null,
              loadingRequestId: null,
            });

            // Restore scroll position if exists
            const progress = get().getProgress(volumeId);
            if (progress) {
              setTimeout(() => {
                window.scrollTo(0, progress.scrollPosition);
              }, 100);
            }
          } else {
            console.log(`[Reader] Ignoring response for old request. Current: ${state.loadingRequestId}, Response: ${requestId}`);
          }
        } catch (error: any) {
          console.error(`[Reader] API_ERROR_CAUGHT - Failed to load volume`, {
            volumeId,
            perspective: currentPerspective,
            errorMessage: error?.message,
            errorCode: error?.code,
            errorStatus: error?.status,
            errorDetails: error,
            requestId,
            timestamp: new Date().toISOString()
          });
          // Only update error if this is still the current request
          const state = get();
          if (state.loadingRequestId === requestId) {
            const errorMessage = error?.message || 'Failed to load volume';
            console.log(`[Reader] UPDATING_ERROR_STATE`, {
              volumeId,
              errorMessage,
              requestId,
              perspective: currentPerspective,
              cause: error?.message || 'Unknown error'
            });
            set({
              error: errorMessage,
              isLoading: false,
              loadingRequestId: null,
            });
          } else {
            console.log(`[Reader] IGNORING_ERROR_FOR_OLD_REQUEST`, {
              currentRequestId: state.loadingRequestId,
              responseRequestId: requestId,
              volumeId
            });
          }
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
