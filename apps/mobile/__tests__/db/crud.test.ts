/**
 * Database CRUD Operations Tests
 * Verify save, read, update, delete operations
 */

import { initDatabase, closeDatabase } from '@/db';
import { chaptersDB } from '@/services/db';
import type { Chapter } from '@/types';

describe('Database CRUD Operations', () => {
  beforeAll(() => {
    initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(() => {
    // Clear chapters table before each test
    chaptersDB.deleteAllChapters();
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
      scheduledFor: null,
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

    it('should save a chapter', () => {
      chaptersDB.saveChapter(mockChapter);
      const saved = chaptersDB.getChapterById('ch-001');

      expect(saved).not.toBeNull();
      expect(saved?.title).toBe('Chapter 1');
      expect(saved?.protagonistName).toBe('Emma');
    });

    it('should retrieve all chapters', () => {
      chaptersDB.saveChapter(mockChapter);

      const chapter2 = { ...mockChapter, id: 'ch-002', title: 'Chapter 2' };
      chaptersDB.saveChapter(chapter2);

      const all = chaptersDB.getAllChapters();
      expect(all.length).toBe(2);
    });

    it('should update a chapter', () => {
      chaptersDB.saveChapter(mockChapter);

      const updated = { ...mockChapter, title: 'Updated Chapter' };
      chaptersDB.saveChapter(updated);

      const retrieved = chaptersDB.getChapterById('ch-001');
      expect(retrieved?.title).toBe('Updated Chapter');
    });

    it('should delete a chapter', () => {
      chaptersDB.saveChapter(mockChapter);
      chaptersDB.deleteChapter('ch-001');

      const deleted = chaptersDB.getChapterById('ch-001');
      expect(deleted).toBeNull();
    });

    it('should return null for non-existent chapter', () => {
      const result = chaptersDB.getChapterById('non-existent');
      expect(result).toBeNull();
    });

    it('should save multiple chapters in transaction', () => {
      const chapters = [
        mockChapter,
        { ...mockChapter, id: 'ch-002', title: 'Chapter 2' },
        { ...mockChapter, id: 'ch-003', title: 'Chapter 3' },
      ];

      chaptersDB.saveChapters(chapters);

      const all = chaptersDB.getAllChapters();
      expect(all.length).toBe(3);
    });

    it('should preserve boolean fields correctly', () => {
      const chapterWithArchived = { ...mockChapter, isArchived: true };
      chaptersDB.saveChapter(chapterWithArchived);

      const retrieved = chaptersDB.getChapterById('ch-001');
      expect(retrieved?.isArchived).toBe(true);
    });

    it('should handle nullable fields', () => {
      const chapterWithNulls = {
        ...mockChapter,
        publishedAt: null,
        coverAssetId: null,
        description: null,
      };
      chaptersDB.saveChapter(chapterWithNulls);

      const retrieved = chaptersDB.getChapterById('ch-001');
      expect(retrieved?.publishedAt).toBeNull();
      expect(retrieved?.coverAssetId).toBeNull();
      expect(retrieved?.description).toBeNull();
    });
  });
});
