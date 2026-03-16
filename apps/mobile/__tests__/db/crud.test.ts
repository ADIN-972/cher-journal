/**
 * Database CRUD Operations Tests
 * Verify save, read, update, delete operations
 */

import { initDatabase, closeDatabase } from '@/db';
import { chaptersDB } from '@/services/db';
import type { Chapter } from '@/types';

// These integration tests require a real SQLite runtime (device/emulator)
// They are skipped in the Jest environment where expo-sqlite is mocked
describe.skip('Database CRUD Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    // Clear chapters table before each test
    await chaptersDB.deleteAllChapters();
  });

  describe('Chapters CRUD', () => {
    const mockChapter: Chapter = {
      id: 'ch-001',
      title: 'Chapter 1',
      protagonistName: 'Emma',
      status: 'PUBLISHED',
      coverAssetId: 'asset-001',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      isArchived: false,
      scheduledFor: undefined,
      description: 'A sensual story',
      accroche_classic: 'Classic accroche',
      accroche_dark: 'Dark accroche',
      accroche_dark_collection: 'Dark collection',
      accroche_love: 'Love accroche',
      accroche_marketing: 'Marketing accroche',
      niveau_danger: 3,
      niveau_douceur: 4,
      niveau_intensite: 5,
      niveau_transformation: 3,
    };

    it('should save a chapter', async () => {
      await chaptersDB.saveChapter(mockChapter);
      const saved = await chaptersDB.getChapterById('ch-001');

      expect(saved).not.toBeNull();
      expect(saved?.title).toBe('Chapter 1');
      expect(saved?.protagonistName).toBe('Emma');
    });

    it('should retrieve all chapters', async () => {
      await chaptersDB.saveChapter(mockChapter);

      const chapter2 = { ...mockChapter, id: 'ch-002', title: 'Chapter 2' };
      await chaptersDB.saveChapter(chapter2);

      const all = await chaptersDB.getAllChapters();
      expect(all.length).toBe(2);
    });

    it('should update a chapter', async () => {
      await chaptersDB.saveChapter(mockChapter);

      const updated = { ...mockChapter, title: 'Updated Chapter' };
      await chaptersDB.saveChapter(updated);

      const retrieved = await chaptersDB.getChapterById('ch-001');
      expect(retrieved?.title).toBe('Updated Chapter');
    });

    it('should delete a chapter', async () => {
      await chaptersDB.saveChapter(mockChapter);
      await chaptersDB.deleteChapter('ch-001');

      const deleted = await chaptersDB.getChapterById('ch-001');
      expect(deleted).toBeNull();
    });

    it('should return null for non-existent chapter', async () => {
      const result = await chaptersDB.getChapterById('non-existent');
      expect(result).toBeNull();
    });

    it('should save multiple chapters in transaction', async () => {
      const chapters = [
        mockChapter,
        { ...mockChapter, id: 'ch-002', title: 'Chapter 2' },
        { ...mockChapter, id: 'ch-003', title: 'Chapter 3' },
      ];

      await chaptersDB.saveChapters(chapters);

      const all = await chaptersDB.getAllChapters();
      expect(all.length).toBe(3);
    });

    it('should preserve boolean fields correctly', async () => {
      const chapterWithArchived = { ...mockChapter, isArchived: true };
      await chaptersDB.saveChapter(chapterWithArchived);

      const retrieved = await chaptersDB.getChapterById('ch-001');
      expect(retrieved?.isArchived).toBe(true);
    });

    it('should handle nullable fields', async () => {
      const chapterWithNulls = {
        ...mockChapter,
        publishedAt: undefined,
        coverAssetId: undefined,
        description: undefined,
      };
      await chaptersDB.saveChapter(chapterWithNulls);

      const retrieved = await chaptersDB.getChapterById('ch-001');
      expect(retrieved?.publishedAt).toBeFalsy();
      expect(retrieved?.coverAssetId).toBeFalsy();
      expect(retrieved?.description).toBeFalsy();
    });
  });
});
