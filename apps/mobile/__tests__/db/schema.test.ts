/**
 * Database Schema Tests
 * Verify all tables and indexes are created correctly
 */

import * as SQLite from 'expo-sqlite';
import { initDatabase, closeDatabase } from '@/db';

// These integration tests require a real SQLite runtime (device/emulator)
// They are skipped in the Jest environment where expo-sqlite is mocked
describe.skip('Database Schema', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Table Creation', () => {
    it('should create chapters table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='chapters'"
      );
      expect(result).toBeDefined();
    });

    it('should create volumes table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='volumes'"
      );
      expect(result).toBeDefined();
    });

    it('should create volume_versions table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='volume_versions'"
      );
      expect(result).toBeDefined();
    });

    it('should create user_progress table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_progress'"
      );
      expect(result).toBeDefined();
    });

    it('should create bookmarks table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'"
      );
      expect(result).toBeDefined();
    });

    it('should create sync_queue table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sync_queue'"
      );
      expect(result).toBeDefined();
    });

    it('should create migrations table', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
      );
      expect(result).toBeDefined();
    });
  });

  describe('Index Creation', () => {
    it('should create volumes chapter index', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_volumes_chapter'"
      );
      expect(result).toBeDefined();
    });

    it('should create progress chapter index', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_progress_chapter'"
      );
      expect(result).toBeDefined();
    });

    it('should create sync status index', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_sync_status'"
      );
      expect(result).toBeDefined();
    });

    it('should create volume versions index', async () => {
      const result = await db.getFirstAsync(
        "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_versions_volume'"
      );
      expect(result).toBeDefined();
    });
  });

  describe('Chapters Table Schema', () => {
    it('should have correct columns', async () => {
      const info = await db.getAllAsync('PRAGMA table_info(chapters)');
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
    it('should have correct columns', async () => {
      const info = await db.getAllAsync('PRAGMA table_info(volumes)');
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
