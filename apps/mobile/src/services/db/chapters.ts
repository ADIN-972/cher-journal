/**
 * Chapters Database Service
 * CRUD operations for chapters table
 */

import type { Chapter } from '@/types';
import { getDatabase } from '@/db';

/**
 * Map database row to Chapter type
 * Converts SQLite integers back to booleans
 */
const mapRowToChapter = (row: any): Chapter => ({
  id: row.id,
  title: row.title,
  protagonistName: row.protagonistName,
  status: row.status,
  coverAssetId: row.coverAssetId,
  createdAt: row.createdAt,
  publishedAt: row.publishedAt,
  isArchived: row.isArchived === 1,
  scheduledFor: row.scheduledFor,
  description: row.description,
  accroche_classic: row.accroche_classic,
  accroche_dark: row.accroche_dark,
  accroche_dark_collection: row.accroche_dark_collection,
  accroche_love: row.accroche_love,
  accroche_marketing: row.accroche_marketing,
  niveau_danger: row.niveau_danger,
  niveau_douceur: row.niveau_douceur,
  niveau_intensite: row.niveau_intensite,
  niveau_transformation: row.niveau_transformation,
});

export const chaptersDB = {
  /**
   * Get all chapters from database
   */
  getAllChapters: async (): Promise<Chapter[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM chapters ORDER BY createdAt ASC');
    return rows.map(mapRowToChapter);
  },

  /**
   * Get a specific chapter by ID
   */
  getChapterById: async (id: string): Promise<Chapter | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM chapters WHERE id = ?', [id]);
    return row ? mapRowToChapter(row) : null;
  },

  /**
   * Save a single chapter (insert or replace)
   */
  saveChapter: async (chapter: Chapter): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO chapters (
        id, title, protagonistName, status, coverAssetId, createdAt, publishedAt,
        isArchived, scheduledFor, description, accroche_classic, accroche_dark,
        accroche_dark_collection, accroche_love, accroche_marketing,
        niveau_danger, niveau_douceur, niveau_intensite, niveau_transformation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chapter.id,
        chapter.title,
        chapter.protagonistName,
        chapter.status,
        chapter.coverAssetId ?? null,
        chapter.createdAt,
        chapter.publishedAt ?? null,
        chapter.isArchived ? 1 : 0,
        chapter.scheduledFor ?? null,
        chapter.description ?? null,
        chapter.accroche_classic ?? null,
        chapter.accroche_dark ?? null,
        chapter.accroche_dark_collection ?? null,
        chapter.accroche_love ?? null,
        chapter.accroche_marketing ?? null,
        chapter.niveau_danger,
        chapter.niveau_douceur,
        chapter.niveau_intensite,
        chapter.niveau_transformation,
      ]
    );
  },

  /**
   * Save multiple chapters in a single transaction
   */
  saveChapters: async (chapters: Chapter[]): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('BEGIN TRANSACTION');
      for (const chapter of chapters) {
        await chaptersDB.saveChapter(chapter);
      }
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  },

  /**
   * Delete a chapter by ID
   */
  deleteChapter: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM chapters WHERE id = ?', [id]);
  },

  /**
   * Delete all chapters (useful for resetting)
   */
  deleteAllChapters: async (): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM chapters');
  },
};
