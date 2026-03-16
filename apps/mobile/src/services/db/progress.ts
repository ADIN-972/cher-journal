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
  getProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): UserProgress | null => {
    const db = getDatabase();
    const row = db.getFirstSync<any>(
      'SELECT * FROM user_progress WHERE chapterId = ? AND volumeNumber = ? AND perspective = ?',
      [chapterId, volumeNumber, perspective]
    );
    return row ? mapRowToProgress(row) : null;
  },

  /**
   * Get all progress entries for a chapter
   */
  getProgressByChapter: (chapterId: string): UserProgress[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM user_progress WHERE chapterId = ? ORDER BY volumeNumber ASC',
      [chapterId]
    );
    return rows.map(mapRowToProgress);
  },

  /**
   * Save or update progress (upsert)
   */
  saveProgress: (progress: UserProgress): void => {
    const db = getDatabase();
    const id = `${progress.chapterId}:${progress.volumeNumber}:${progress.perspective}`;
    db.runSync(
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
  saveProgressBatch: (progressList: UserProgress[]): void => {
    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const progress of progressList) {
        progressDB.saveProgress(progress);
      }
    });
  },

  /**
   * Delete progress for a specific chapter/volume/perspective
   */
  deleteProgress: (
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): void => {
    const db = getDatabase();
    db.runSync(
      'DELETE FROM user_progress WHERE chapterId = ? AND volumeNumber = ? AND perspective = ?',
      [chapterId, volumeNumber, perspective]
    );
  },

  /**
   * Clear all progress for a chapter
   */
  clearChapterProgress: (chapterId: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM user_progress WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Get all bookmarked chapter IDs
   */
  getBookmarks: (): string[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT chapterId FROM bookmarks ORDER BY chapterId ASC'
    );
    return rows.map((row) => row.chapterId);
  },

  /**
   * Check if a chapter is bookmarked
   */
  isBookmarked: (chapterId: string): boolean => {
    const db = getDatabase();
    const row = db.getFirstSync<any>(
      'SELECT 1 FROM bookmarks WHERE chapterId = ?',
      [chapterId]
    );
    return row !== null;
  },

  /**
   * Add a bookmark
   */
  addBookmark: (chapterId: string): void => {
    const db = getDatabase();
    db.runSync(
      'INSERT OR IGNORE INTO bookmarks (chapterId) VALUES (?)',
      [chapterId]
    );
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: (chapterId: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM bookmarks WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Toggle bookmark for a chapter
   */
  toggleBookmark: (chapterId: string): boolean => {
    if (progressDB.isBookmarked(chapterId)) {
      progressDB.removeBookmark(chapterId);
      return false;
    } else {
      progressDB.addBookmark(chapterId);
      return true;
    }
  },

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks: (): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM bookmarks');
  },
};

export type { UserProgress };
