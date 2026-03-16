/**
 * Database Schema Tests
 * Verify all tables and indexes are created correctly
 */

import * as SQLite from 'expo-sqlite';
import { initDatabase, closeDatabase } from '@/db';

describe('Database Schema', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(() => {
    db = initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Table Creation', () => {
    it('should create chapters table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='chapters'"
      );
      expect(result).toBeDefined();
    });

    it('should create volumes table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='volumes'"
      );
      expect(result).toBeDefined();
    });

    it('should create volume_versions table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='volume_versions'"
      );
      expect(result).toBeDefined();
    });

    it('should create user_progress table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_progress'"
      );
      expect(result).toBeDefined();
    });

    it('should create bookmarks table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'"
      );
      expect(result).toBeDefined();
    });

    it('should create sync_queue table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sync_queue'"
      );
      expect(result).toBeDefined();
    });

    it('should create migrations table', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
      );
      expect(result).toBeDefined();
    });
  });

  describe('Index Creation', () => {
    it('should create volumes chapter index', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_volumes_chapter'"
      );
      expect(result).toBeDefined();
    });

    it('should create progress chapter index', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_progress_chapter'"
      );
      expect(result).toBeDefined();
    });

    it('should create sync status index', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_sync_status'"
      );
      expect(result).toBeDefined();
    });

    it('should create volume versions index', () => {
      const result = db.getFirstSync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_versions_volume'"
      );
      expect(result).toBeDefined();
    });
  });

  describe('Chapters Table Schema', () => {
    it('should have correct columns', () => {
      const info = db.getAllSync('PRAGMA table_info(chapters)');
      const columnNames = info.map((col: any) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('protagonistName');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('niveau_danger');
      expect(columnNames).toContain('niveau_douceur');
      expect(columnNames).toContain('niveau_intensite');
      expect(columnNames).toContain('niveau_transformation');
    });
  });

  describe('Volumes Table Schema', () => {
    it('should have correct columns', () => {
      const info = db.getAllSync('PRAGMA table_info(volumes)');
      const columnNames = info.map((col: any) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('chapterId');
      expect(columnNames).toContain('volumeNumber');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('isFree');
      expect(columnNames).toContain('status');
    });
  });
});
