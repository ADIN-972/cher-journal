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
      execSync: jest.fn(),
      runSync: jest.fn(),
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(),
      withTransactionSync: jest.fn((fn) => fn()),
    };
    (getDatabase as jest.Mock).mockReturnValue(mockDB);
    jest.clearAllMocks();
  });

  describe('chaptersDB', () => {
    it('should get all chapters', () => {
      const mockChapters = [
        {
          id: 'ch-1',
          title: 'Chapter 1',
          status: 'PUBLISHED',
        },
      ];
      mockDB.getAllSync.mockReturnValueOnce(mockChapters);

      chaptersDB.getAllChapters();

      expect(mockDB.getAllSync).toHaveBeenCalled();
    });

    it('should get chapter by id', () => {
      mockDB.getFirstSync.mockReturnValueOnce({ id: 'ch-1', title: 'Chapter 1' });

      chaptersDB.getChapterById('ch-1');

      expect(mockDB.getFirstSync).toHaveBeenCalled();
    });

    it('should save chapter', () => {
      const chapter = { id: 'ch-1', title: 'Chapter 1', status: 'PUBLISHED' } as any;

      chaptersDB.saveChapter(chapter);

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should save multiple chapters in transaction', () => {
      const chapters = [
        { id: 'ch-1', title: 'Chapter 1', status: 'PUBLISHED' },
        { id: 'ch-2', title: 'Chapter 2', status: 'PUBLISHED' },
      ] as any;

      chaptersDB.saveChapters(chapters);

      expect(mockDB.withTransactionSync).toHaveBeenCalled();
    });

    it('should delete chapter', () => {
      chaptersDB.deleteChapter('ch-1');

      expect(mockDB.runSync).toHaveBeenCalled();
    });
  });

  describe('volumesDB', () => {
    it('should get volumes by chapter', () => {
      mockDB.getAllSync.mockReturnValueOnce([
        { id: 'vol-1', chapterId: 'ch-1', volumeNumber: 1 },
      ]);

      volumesDB.getVolumesByChapter('ch-1');

      expect(mockDB.getAllSync).toHaveBeenCalled();
    });

    it('should get volume by id', () => {
      mockDB.getFirstSync.mockReturnValueOnce({ id: 'vol-1', chapterId: 'ch-1' });

      volumesDB.getVolumeById('vol-1');

      expect(mockDB.getFirstSync).toHaveBeenCalled();
    });

    it('should save volume', () => {
      const volume = { id: 'vol-1', chapterId: 'ch-1', volumeNumber: 1 } as any;

      volumesDB.saveVolume(volume);

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should get volume versions', () => {
      mockDB.getAllSync.mockReturnValueOnce([
        { id: 'ver-1', volumeId: 'vol-1', perspective: 'NARRATOR' },
      ]);

      volumesDB.getVolumeVersions('vol-1');

      expect(mockDB.getAllSync).toHaveBeenCalled();
    });

    it('should save volume version', () => {
      const version = {
        id: 'ver-1',
        volumeId: 'vol-1',
        perspective: 'NARRATOR' as const,
        text: '',
        isAutoText: false,
        characterCount: 0,
        createdAt: '2026-01-01T00:00:00Z',
      };

      volumesDB.saveVolumeVersion(version);

      expect(mockDB.runSync).toHaveBeenCalled();
    });
  });

  describe('progressDB', () => {
    it('should get progress', () => {
      mockDB.getFirstSync.mockReturnValueOnce({ id: 'p-1', chapterId: 'ch-1', progress: 50 });

      progressDB.getProgress('ch-1', 1, 'NARRATOR');

      expect(mockDB.getFirstSync).toHaveBeenCalled();
    });

    it('should save progress', () => {
      const progress = {
        id: 'p-1',
        chapterId: 'ch-1',
        volumeNumber: 1,
        perspective: 'NARRATOR' as const,
        progress: 50,
      };

      progressDB.saveProgress(progress);

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should get bookmarks', () => {
      mockDB.getAllSync.mockReturnValueOnce([
        { chapterId: 'ch-1' },
        { chapterId: 'ch-2' },
      ]);

      progressDB.getBookmarks();

      expect(mockDB.getAllSync).toHaveBeenCalled();
    });

    it('should add bookmark', () => {
      progressDB.addBookmark('ch-1');

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should remove bookmark', () => {
      progressDB.removeBookmark('ch-1');

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should check if bookmarked', () => {
      mockDB.getFirstSync.mockReturnValueOnce({ chapterId: 'ch-1' });

      const result = progressDB.isBookmarked('ch-1');

      expect(result).toBe(true);
    });
  });

  describe('syncDB', () => {
    it('should add to sync queue and return id', () => {
      const result = syncDB.addToQueue('updateProgress', { volumeId: '123', progress: 50 });

      expect(typeof result).toBe('string');
      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should get pending items', () => {
      const mockPending = [
        { id: 'sync-1', action: 'updateProgress', status: 'pending', payload: '{}', createdAt: '2026-01-01' },
      ];
      mockDB.getAllSync.mockReturnValueOnce(mockPending);

      syncDB.getPendingItems();

      expect(mockDB.getAllSync).toHaveBeenCalled();
    });

    it('should get item by id', () => {
      const mockItem = {
        id: 'sync-1',
        action: 'updateProgress',
        status: 'pending',
        payload: '{}',
        createdAt: '2026-01-01',
      };
      mockDB.getFirstSync.mockReturnValueOnce(mockItem);

      const result = syncDB.getItem('sync-1');

      expect(result).toBeDefined();
    });

    it('should mark as synced', () => {
      syncDB.markAsSynced('sync-1');

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should mark as failed', () => {
      syncDB.markAsFailed('sync-1');

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should clear synced items', () => {
      syncDB.clearSyncedItems();

      expect(mockDB.runSync).toHaveBeenCalled();
    });

    it('should get stats', () => {
      const mockStats = {
        pending: 1,
        synced: 2,
        failed: 0,
        total: 3,
      };
      mockDB.getFirstSync.mockReturnValueOnce(mockStats);

      const result = syncDB.getStats();

      expect(result).toBeDefined();
      expect(typeof result.total).toBe('number');
    });
  });
});
