import { create } from 'zustand';
import api from '../lib/api';

interface LibraryVolume {
  id: string;
  title: string;
  volumeNumber: number;
  chapterId: string;
  chapterTitle: string;
  chapterProtaganistName?: string;
  status: 'FREE_TO_READ' | 'PAYWALL' | 'EPILOGUE' | 'COLORING';
  isPurchased: boolean;
  canWaitToRead: boolean;
  waitTimeRemaining?: number; // in seconds
  coverAsset?: {
    id: string;
    objectKey: string;
    mimeType: string;
  };
  currentVolume?: number;
  totalVolumes?: number;
}

interface LibraryState {
  volumes: LibraryVolume[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'purchased' | 'waiting' | 'free';

  // Actions
  fetchLibrary: () => Promise<void>;
  setFilter: (filter: 'all' | 'purchased' | 'waiting' | 'free') => void;
  clearError: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  volumes: [],
  isLoading: false,
  error: null,
  filter: 'all',

  /**
   * Fetch user's library
   */
  fetchLibrary: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getLibrary();

      // Flatten volumes from chapters in response
      const allVolumes: LibraryVolume[] = [];

      if (Array.isArray(response)) {
        response.forEach((entitlement: any) => {
          const chapter = entitlement.chapter;
          if (chapter && chapter.volumes && Array.isArray(chapter.volumes)) {
            const currentVolume = entitlement.currentVolume || 1;
            const totalVolumes = chapter.volumes.length;

            chapter.volumes.forEach((volume: any) => {
              // Check if volume is in availableVolumes list
              const isAvailable = entitlement.availableVolumes?.includes(volume.volumeNumber);

              allVolumes.push({
                id: volume.id,
                title: volume.title,
                volumeNumber: volume.volumeNumber,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                chapterProtaganistName: chapter.protagonistName,
                status: volume.isFree ? 'FREE_TO_READ' : 'PAYWALL',
                isPurchased: isAvailable || false,
                canWaitToRead: !isAvailable && !volume.isFree,
                waitTimeRemaining: entitlement.waitStatus?.remainingMs,
                coverAsset: chapter.coverAsset,
                currentVolume,
                totalVolumes,
              });
            });
          }
        });
      }

      set({
        volumes: allVolumes,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch library',
        isLoading: false,
      });
    }
  },

  /**
   * Set filter for displayed volumes
   */
  setFilter: (filter: 'all' | 'purchased' | 'waiting' | 'free') => {
    set({ filter });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useLibraryStore;
