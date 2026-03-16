/**
 * User Progress Database Service
 * CRUD operations for user_progress and bookmarks tables
 */

import type { Perspective } from '@/types';
import { getDatabase } from '@/db';

interface UserProgress {
  chapterId: string;
  volumeNumber: number;
  perspective: Perspective;
  progress: number;
  completedAt?: string;
}

/**
 * Map database row to UserProgress type
 */
const mapRowToProgress = (row: any): UserProgress => ({
  chapterId: row.chapterId,
  volumeNumber: row.volumeNumber,
  perspective: row.perspective,
  progress: row.progress,
  completedAt: row.completedAt,
});

export const progressDB = {
  /**
   * Get progress for a specific chapter/volume/perspective
   */
  getProgress: async (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): Promise<UserProgress | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM user_progress WHERE chapterId = ? AND volumeNumber = ? AND perspective = ?',
      [chapterId, volumeNumber, perspective]
    );
    return row ? mapRowToProgress(row) : null;
  },

  /**
   * Get all progress entries for a chapter
   */
  getProgressByChapter: async (chapterId: string): Promise<UserProgress[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM user_progress WHERE chapterId = ? ORDER BY volumeNumber ASC',
      [chapterId]
    );
    return rows.map(mapRowToProgress);
  },

  /**
   * Save or update progress (upsert)
   */
  saveProgress: async (progress: UserProgress): Promise<void> => {
    const db = await getDatabase();
    const id = `${progress.chapterId}:${progress.volumeNumber}:${progress.perspective}`;
    await db.runAsync(
      `INSERT OR REPLACE INTO user_progress (
        id, chapterId, volumeNumber, perspective, progress, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        progress.chapterId,
        progress.volumeNumber,
        progress.perspective,
        progress.progress,
        progress.completedAt ?? null,
      ]
    );
  },

  /**
   * Save multiple progress entries in a transaction
   */
  saveProgressBatch: async (progressList: UserProgress[]): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('BEGIN TRANSACTION');
      for (const progress of progressList) {
        await progressDB.saveProgress(progress);
      }
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  },

  /**
   * Delete progress for a specific chapter/volume/perspective
   */
  deleteProgress: async (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM user_progress WHERE chapterId = ? AND volumeNumber = ? AND perspective = ?',
      [chapterId, volumeNumber, perspective]
    );
  },

  /**
   * Clear all progress for a chapter
   */
  clearChapterProgress: async (chapterId: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM user_progress WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Get all bookmarked chapter IDs
   */
  getBookmarks: async (): Promise<string[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT chapterId FROM bookmarks ORDER BY chapterId ASC'
    );
    return rows.map((row: any) => row.chapterId);
  },

  /**
   * Check if a chapter is bookmarked
   */
  isBookmarked: async (chapterId: string): Promise<boolean> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT 1 FROM bookmarks WHERE chapterId = ?',
      [chapterId]
    );
    return row !== null;
  },

  /**
   * Add a bookmark
   */
  addBookmark: async (chapterId: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO bookmarks (chapterId) VALUES (?)',
      [chapterId]
    );
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: async (chapterId: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bookmarks WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Toggle bookmark for a chapter
   */
  toggleBookmark: async (chapterId: string): Promise<boolean> => {
    if (await progressDB.isBookmarked(chapterId)) {
      await progressDB.removeBookmark(chapterId);
      return false;
    } else {
      await progressDB.addBookmark(chapterId);
      return true;
    }
  },

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks: async (): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bookmarks');
  },
};

export type { UserProgress };
