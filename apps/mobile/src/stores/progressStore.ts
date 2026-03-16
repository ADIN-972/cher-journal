import { create } from 'zustand';
import { progressDB } from '@/services/db';
import type { UserProgress } from '@/services/db';
import type { Perspective } from '@/types/volume';

interface ProgressState {
  progress: Map<string, UserProgress>;

  updateProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective,
    percentage: number
  ) => void;

  getProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ) => UserProgress | null;

  markCompleted: (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: new Map(),

  updateProgress: (chapterId, volumeNumber, perspective, percentage) => {
    const id = `${chapterId}-${volumeNumber}-${perspective}`;

    const updated = {
      id,
      chapterId,
      volumeNumber,
      perspective,
      progress: percentage,
      completedAt: percentage === 100 ? new Date().toISOString() : undefined,
    } as UserProgress;

    // Save to SQLite
    progressDB.saveProgress(updated);

    // Update store
    set((state) => {
      const newProgress = new Map(state.progress);
      newProgress.set(id, updated);
      return { progress: newProgress };
    });
  },

  getProgress: (chapterId, volumeNumber, perspective) => {
    const id = `${chapterId}-${volumeNumber}-${perspective}`;
    return get().progress.get(id) || null;
  },

  markCompleted: (chapterId, volumeNumber, perspective) => {
    get().updateProgress(chapterId, volumeNumber, perspective, 100);
  },
}));
