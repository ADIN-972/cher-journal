import { useChapterStore } from '@/stores/chapterStore';
import * as chaptersCacheService from '@/services/db/chapters-cache';

jest.mock('@/services/db/chapters-cache');

describe('useChapterStore', () => {
  beforeEach(() => {
    useChapterStore.setState({
      chapters: [],
      selectedChapter: null,
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  const mockChapters = [
    {
      id: 'ch-1',
      title: 'Chapter 1',
      protagonistName: 'Emma',
      status: 'PUBLISHED' as const,
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      scheduledFor: undefined,
      coverAssetId: undefined,
      description: 'Test chapter',
      accroche_classic: 'Accroche',
      accroche_dark: undefined,
      accroche_dark_collection: undefined,
      accroche_love: undefined,
      accroche_marketing: undefined,
      niveau_danger: 0,
      niveau_douceur: 0,
      niveau_intensite: 0,
      niveau_transformation: 0,
    },
  ];

  describe('fetchChapters', () => {
    it('should fetch chapters and set loading states', async () => {
      (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockResolvedValueOnce(
        mockChapters
      );

      const store = useChapterStore.getState();
      await store.fetchChapters();

      expect(useChapterStore.getState().chapters).toEqual(mockChapters);
      expect(useChapterStore.getState().loading).toBe(false);
      expect(useChapterStore.getState().error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network failed');
      (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockRejectedValueOnce(
        error
      );

      await useChapterStore.getState().fetchChapters();

      expect(useChapterStore.getState().error).toBe('Network failed');
      expect(useChapterStore.getState().chapters).toEqual([]);
    });

    it('should support force refresh', async () => {
      (chaptersCacheService.fetchChaptersWithCache as jest.Mock).mockResolvedValueOnce(
        mockChapters
      );

      await useChapterStore.getState().fetchChapters({ forceRefresh: true });

      expect(chaptersCacheService.fetchChaptersWithCache).toHaveBeenCalledWith({
        forceRefresh: true,
      });
    });
  });

  describe('setSelectedChapter', () => {
    it('should set selected chapter', () => {
      useChapterStore.getState().setSelectedChapter(mockChapters[0]);
      expect(useChapterStore.getState().selectedChapter).toEqual(mockChapters[0]);
    });
  });
});
