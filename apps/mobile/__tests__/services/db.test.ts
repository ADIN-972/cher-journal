import { chaptersDB } from '@/services/db/chapters';
import { volumesDB } from '@/services/db/volumes';
import { progressDB } from '@/services/db/progress';
import { syncDB } from '@/services/db/sync';
import { getDatabase } from '@/db/database';

jest.mock('@/db/database');

describe('Database Services', () => {
  let mockDB: any;

  beforeEach(() => {
    mockDB = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue(undefined),
      getFirstAsync: jest.fn().mockResolvedValue(null),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDB);
    jest.clearAllMocks();
  });

  describe('chaptersDB', () => {
    it('should get all chapters', async () => {
      const mockChapters = [
        {
          id: 'ch-1',
          title: 'Chapter 1',
          status: 'PUBLISHED',
        },
      ];
      mockDB.getAllAsync.mockResolvedValueOnce(mockChapters);

      await chaptersDB.getAllChapters();

      expect(mockDB.getAllAsync).toHaveBeenCalled();
    });

    it('should get chapter by id', async () => {
      mockDB.getFirstAsync.mockResolvedValueOnce({ id: 'ch-1', title: 'Chapter 1' });

      await chaptersDB.getChapterById('ch-1');

      expect(mockDB.getFirstAsync).toHaveBeenCalled();
    });

    it('should save chapter', async () => {
      const chapter = { id: 'ch-1', title: 'Chapter 1', status: 'PUBLISHED' } as any;

      await chaptersDB.saveChapter(chapter);

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should save multiple chapters in transaction', async () => {
      const chapters = [
        { id: 'ch-1', title: 'Chapter 1', status: 'PUBLISHED' },
        { id: 'ch-2', title: 'Chapter 2', status: 'PUBLISHED' },
      ] as any;

      await chaptersDB.saveChapters(chapters);

      expect(mockDB.execAsync).toHaveBeenCalledWith('BEGIN TRANSACTION');
      expect(mockDB.execAsync).toHaveBeenCalledWith('COMMIT');
    });

    it('should delete chapter', async () => {
      await chaptersDB.deleteChapter('ch-1');

      expect(mockDB.runAsync).toHaveBeenCalled();
    });
  });

  describe('volumesDB', () => {
    it('should get volumes by chapter', async () => {
      mockDB.getAllAsync.mockResolvedValueOnce([
        { id: 'vol-1', chapterId: 'ch-1', volumeNumber: 1 },
      ]);

      await volumesDB.getVolumesByChapter('ch-1');

      expect(mockDB.getAllAsync).toHaveBeenCalled();
    });

    it('should get volume by id', async () => {
      mockDB.getFirstAsync.mockResolvedValueOnce({ id: 'vol-1', chapterId: 'ch-1' });

      await volumesDB.getVolumeById('vol-1');

      expect(mockDB.getFirstAsync).toHaveBeenCalled();
    });

    it('should save volume', async () => {
      const volume = { id: 'vol-1', chapterId: 'ch-1', volumeNumber: 1 } as any;

      await volumesDB.saveVolume(volume);

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should get volume versions', async () => {
      mockDB.getAllAsync.mockResolvedValueOnce([
        { id: 'ver-1', volumeId: 'vol-1', perspective: 'NARRATOR' },
      ]);

      await volumesDB.getVolumeVersions('vol-1');

      expect(mockDB.getAllAsync).toHaveBeenCalled();
    });

    it('should save volume version', async () => {
      const version = {
        id: 'ver-1',
        volumeId: 'vol-1',
        perspective: 'NARRATOR' as const,
        text: '',
        isAutoText: false,
        characterCount: 0,
        createdAt: '2026-01-01T00:00:00Z',
      };

      await volumesDB.saveVolumeVersion(version);

      expect(mockDB.runAsync).toHaveBeenCalled();
    });
  });

  describe('progressDB', () => {
    it('should get progress', async () => {
      mockDB.getFirstAsync.mockResolvedValueOnce({ id: 'p-1', chapterId: 'ch-1', progress: 50 });

      await progressDB.getProgress('ch-1', 1, 'NARRATOR');

      expect(mockDB.getFirstAsync).toHaveBeenCalled();
    });

    it('should save progress', async () => {
      const progress = {
        id: 'p-1',
        chapterId: 'ch-1',
        volumeNumber: 1,
        perspective: 'NARRATOR' as const,
        progress: 50,
      };

      await progressDB.saveProgress(progress);

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should get bookmarks', async () => {
      mockDB.getAllAsync.mockResolvedValueOnce([
        { chapterId: 'ch-1' },
        { chapterId: 'ch-2' },
      ]);

      await progressDB.getBookmarks();

      expect(mockDB.getAllAsync).toHaveBeenCalled();
    });

    it('should add bookmark', async () => {
      await progressDB.addBookmark('ch-1');

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should remove bookmark', async () => {
      await progressDB.removeBookmark('ch-1');

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should check if bookmarked', async () => {
      mockDB.getFirstAsync.mockResolvedValueOnce({ chapterId: 'ch-1' });

      const result = await progressDB.isBookmarked('ch-1');

      expect(result).toBe(true);
    });
  });

  describe('syncDB', () => {
    it('should add to sync queue and return id', async () => {
      const result = await syncDB.addToQueue('updateProgress', { volumeId: '123', progress: 50 });

      expect(typeof result).toBe('string');
      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should get pending items', async () => {
      const mockPending = [
        { id: 'sync-1', action: 'updateProgress', status: 'pending', payload: '{}', createdAt: '2026-01-01' },
      ];
      mockDB.getAllAsync.mockResolvedValueOnce(mockPending);

      await syncDB.getPendingItems();

      expect(mockDB.getAllAsync).toHaveBeenCalled();
    });

    it('should get item by id', async () => {
      const mockItem = {
        id: 'sync-1',
        action: 'updateProgress',
        status: 'pending',
        payload: '{}',
        createdAt: '2026-01-01',
      };
      mockDB.getFirstAsync.mockResolvedValueOnce(mockItem);

      const result = await syncDB.getItem('sync-1');

      expect(result).toBeDefined();
    });

    it('should mark as synced', async () => {
      await syncDB.markAsSynced('sync-1');

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should mark as failed', async () => {
      await syncDB.markAsFailed('sync-1');

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should clear synced items', async () => {
      await syncDB.clearSyncedItems();

      expect(mockDB.runAsync).toHaveBeenCalled();
    });

    it('should get stats', async () => {
      const mockStats = {
        pending: 1,
        synced: 2,
        failed: 0,
        total: 3,
      };
      mockDB.getFirstAsync.mockResolvedValueOnce(mockStats);

      const result = await syncDB.getStats();

      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
    });
  });
});
