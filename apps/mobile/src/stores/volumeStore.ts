import { create } from 'zustand';
import { chaptersAPI } from '@/services/api';
import type { Volume, VolumeVersion, Perspective } from '@/types';

interface VolumeState {
  volumes: Volume[];
  currentVolume: Volume | null;
  currentVersion: VolumeVersion | null;
  selectedPerspective: Perspective;
  loading: boolean;
  error: string | null;

  fetchVolumes: (chapterId: string) => Promise<void>;
  setCurrentVolume: (volume: Volume) => void;
  setSelectedPerspective: (perspective: Perspective) => void;
  clearError: () => void;
}

export const useVolumeStore = create<VolumeState>((set) => ({
  volumes: [],
  currentVolume: null,
  currentVersion: null,
  selectedPerspective: 'NARRATOR',
  loading: false,
  error: null,

  fetchVolumes: async (chapterId: string) => {
    set({ loading: true, error: null });
    try {
      const volumes = await chaptersAPI.getVolumes(chapterId);
      set({ volumes, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentVolume: (volume) => set({ currentVolume: volume }),
  setSelectedPerspective: (perspective) => set({ selectedPerspective: perspective }),
  clearError: () => set({ error: null }),
}));
