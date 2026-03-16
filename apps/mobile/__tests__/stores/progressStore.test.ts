import { useProgressStore } from '@/stores/progressStore';

// Mock the progressDB service
jest.mock('@/services/db', () => ({
  progressDB: {
    saveProgress: jest.fn(),
  },
}));

describe('useProgressStore', () => {
  beforeEach(() => {
    useProgressStore.setState({ progress: new Map() });
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should update progress and save to database', () => {
      const store = useProgressStore.getState();
      store.updateProgress('ch-1', 1, 'NARRATOR', 50);

      const progress = useProgressStore.getState().progress.get('ch-1-1-NARRATOR');
      expect(progress).toBeDefined();
      expect(progress?.progress).toBe(50);
      expect(progress?.completedAt).toBeUndefined();
    });

    it('should mark as completed when progress is 100', () => {
      const store = useProgressStore.getState();
      store.updateProgress('ch-1', 1, 'NARRATOR', 100);

      const progress = useProgressStore.getState().progress.get('ch-1-1-NARRATOR');
      expect(progress?.progress).toBe(100);
      expect(progress?.completedAt).toBeDefined();
    });

    it('should handle multiple volumes', () => {
      const store = useProgressStore.getState();
      store.updateProgress('ch-1', 1, 'NARRATOR', 50);
      store.updateProgress('ch-1', 2, 'NARRATOR', 75);

      const state = useProgressStore.getState();
      expect(state.progress.size).toBe(2);
      expect(state.progress.get('ch-1-1-NARRATOR')?.volumeNumber).toBe(1);
      expect(state.progress.get('ch-1-2-NARRATOR')?.volumeNumber).toBe(2);
    });

    it('should handle different perspectives', () => {
      const store = useProgressStore.getState();
      store.updateProgress('ch-1', 1, 'NARRATOR', 50);
      store.updateProgress('ch-1', 1, 'PROTAGONIST', 75);

      const state = useProgressStore.getState();
      expect(state.progress.size).toBe(2);
      expect(state.progress.get('ch-1-1-NARRATOR')?.perspective).toBe('NARRATOR');
      expect(state.progress.get('ch-1-1-PROTAGONIST')?.perspective).toBe('PROTAGONIST');
    });
  });

  describe('getProgress', () => {
    it('should return progress if exists', () => {
      const store = useProgressStore.getState();
      store.updateProgress('ch-1', 1, 'NARRATOR', 50);

      const progress = store.getProgress('ch-1', 1, 'NARRATOR');
      expect(progress).toBeDefined();
      expect(progress?.progress).toBe(50);
    });

    it('should return null if progress not found', () => {
      const store = useProgressStore.getState();
      const progress = store.getProgress('ch-1', 1, 'NARRATOR');
      expect(progress).toBeNull();
    });
  });

  describe('markCompleted', () => {
    it('should mark as 100% complete', () => {
      const store = useProgressStore.getState();
      store.markCompleted('ch-1', 1, 'NARRATOR');

      const progress = useProgressStore.getState().progress.get('ch-1-1-NARRATOR');
      expect(progress?.progress).toBe(100);
      expect(progress?.completedAt).toBeDefined();
    });
  });
});
