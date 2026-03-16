import { useVolumeStore } from '@/stores/volumeStore';
import { chaptersAPI } from '@/services/api';

jest.mock('@/services/api');

describe('useVolumeStore', () => {
  beforeEach(() => {
    useVolumeStore.setState({
      volumes: [],
      currentVolume: null,
      currentVersion: null,
      selectedPerspective: 'NARRATOR',
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  const mockVolumes = [
    {
      id: 'vol-1',
      chapterId: 'ch-1',
      volumeNumber: 1,
      title: 'Volume 1',
      isFinalPaywall: false,
      isFree: true,
      status: 'PUBLISHED' as const,
      illustrationAssetId: undefined,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      charme: 0,
      danger: 0,
      douceur: 0,
      intensite: 0,
      isDarkCollection: false,
      mystere: 0,
      transformation: 0,
      xpAmeBase: 0,
      xpFeuBase: 0,
      xpOmbreBase: 0,
    },
  ];

  describe('fetchVolumes', () => {
    it('should fetch volumes and set loading states', async () => {
      (chaptersAPI.getVolumes as jest.Mock).mockResolvedValueOnce(mockVolumes);

      await useVolumeStore.getState().fetchVolumes('ch-1');

      expect(useVolumeStore.getState().volumes).toEqual(mockVolumes);
      expect(useVolumeStore.getState().loading).toBe(false);
      expect(useVolumeStore.getState().error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      (chaptersAPI.getVolumes as jest.Mock).mockRejectedValueOnce(error);

      await useVolumeStore.getState().fetchVolumes('ch-1');

      expect(useVolumeStore.getState().error).toBe('Network error');
      expect(useVolumeStore.getState().volumes).toEqual([]);
      expect(useVolumeStore.getState().loading).toBe(false);
    });

    it('should set loading flag during fetch', async () => {
      (chaptersAPI.getVolumes as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockVolumes), 50))
      );

      const promise = useVolumeStore.getState().fetchVolumes('ch-1');
      expect(useVolumeStore.getState().loading).toBe(true);

      await promise;
      expect(useVolumeStore.getState().loading).toBe(false);
    });
  });

  describe('setCurrentVolume', () => {
    it('should set current volume', () => {
      useVolumeStore.getState().setCurrentVolume(mockVolumes[0]);
      expect(useVolumeStore.getState().currentVolume).toEqual(mockVolumes[0]);
    });
  });

  describe('setSelectedPerspective', () => {
    it('should set perspective to PROTAGONIST', () => {
      useVolumeStore.getState().setSelectedPerspective('PROTAGONIST');
      expect(useVolumeStore.getState().selectedPerspective).toBe('PROTAGONIST');
    });

    it('should set perspective back to NARRATOR', () => {
      useVolumeStore.getState().setSelectedPerspective('PROTAGONIST');
      useVolumeStore.getState().setSelectedPerspective('NARRATOR');
      expect(useVolumeStore.getState().selectedPerspective).toBe('NARRATOR');
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      useVolumeStore.setState({ error: 'Test error' });
      useVolumeStore.getState().clearError();
      expect(useVolumeStore.getState().error).toBeNull();
    });
  });
});
