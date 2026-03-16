import { create } from 'zustand';
import { chaptersAPI } from '@/services/api';
import type { VolumeVersion } from '@/types';

interface VersionState {
  narrator: VolumeVersion | null;
  protagonist: VolumeVersion | null;
  currentVersion: VolumeVersion | null;
  loading: boolean;
  error: string | null;

  fetchVersions: (chapterId: string, volumeNumber: number) => Promise<void>;
  setCurrentVersion: (version: VolumeVersion | null) => void;
  clearError: () => void;
}

export const useVersionsStore = create<VersionState>((set) => ({
  narrator: null,
  protagonist: null,
  currentVersion: null,
  loading: false,
  error: null,

  fetchVersions: async (chapterId: string, volumeNumber: number) => {
    set({ loading: true, error: null });
    try {
      const volume = await chaptersAPI.getVolume(chapterId, volumeNumber);

      // Extract versions from volume - handling different structure
      const narratorVersion = (volume as any).versions?.find(
        (v: any) => v.perspective === 'NARRATOR'
      );
      const protagonistVersion = (volume as any).versions?.find(
        (v: any) => v.perspective === 'PROTAGONIST'
      );

      set({
        narrator: narratorVersion,
        protagonist: protagonistVersion,
        currentVersion: narratorVersion || protagonistVersion,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentVersion: (version) => set({ currentVersion: version }),
  clearError: () => set({ error: null }),
}));
