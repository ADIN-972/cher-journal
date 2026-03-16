/**
 * Volumes Database Service
 * CRUD operations for volumes and volume_versions tables
 */

import type { Volume, VolumeVersion } from '@/types';
import { getDatabase } from '@/db';

/**
 * Map database row to Volume type
 * Converts SQLite integers back to booleans
 */
const mapRowToVolume = (row: any): Volume => ({
  id: row.id,
  chapterId: row.chapterId,
  volumeNumber: row.volumeNumber,
  title: row.title,
  isFinalPaywall: row.isFinalPaywall === 1,
  illustrationAssetId: row.illustrationAssetId,
  createdAt: row.createdAt,
  publishedAt: row.publishedAt,
  isFree: row.isFree === 1,
  status: row.status,
  charme: row.charme,
  danger: row.danger,
  douceur: row.douceur,
  intensite: row.intensite,
  isDarkCollection: row.isDarkCollection === 1,
  mystere: row.mystere,
  transformation: row.transformation,
  xpAmeBase: row.xpAmeBase,
  xpFeuBase: row.xpFeuBase,
  xpOmbreBase: row.xpOmbreBase,
});

/**
 * Map database row to VolumeVersion type
 * Converts SQLite integers back to booleans
 */
const mapRowToVolumeVersion = (row: any): VolumeVersion => ({
  id: row.id,
  volumeId: row.volumeId,
  perspective: row.perspective,
  text: row.text,
  textBlobId: row.textBlobId,
  isAutoText: row.isAutoText === 1,
  characterCount: row.characterCount,
  createdAt: row.createdAt,
});

export const volumesDB = {
  /**
   * Get all volumes for a chapter
   */
  getVolumesByChapter: async (chapterId: string): Promise<Volume[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM volumes WHERE chapterId = ? ORDER BY volumeNumber ASC',
      [chapterId]
    );
    return rows.map(mapRowToVolume);
  },

  /**
   * Get a specific volume by ID
   */
  getVolumeById: async (id: string): Promise<Volume | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM volumes WHERE id = ?', [id]);
    return row ? mapRowToVolume(row) : null;
  },

  /**
   * Save a single volume (insert or replace)
   */
  saveVolume: async (volume: Volume): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO volumes (
        id, chapterId, volumeNumber, title, isFinalPaywall, illustrationAssetId,
        createdAt, publishedAt, isFree, status, charme, danger, douceur, intensite,
        isDarkCollection, mystere, transformation, xpAmeBase, xpFeuBase, xpOmbreBase
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        volume.id,
        volume.chapterId,
        volume.volumeNumber,
        volume.title,
        volume.isFinalPaywall ? 1 : 0,
        volume.illustrationAssetId ?? null,
        volume.createdAt,
        volume.publishedAt ?? null,
        volume.isFree ? 1 : 0,
        volume.status,
        volume.charme,
        volume.danger,
        volume.douceur,
        volume.intensite,
        volume.isDarkCollection ? 1 : 0,
        volume.mystere,
        volume.transformation,
        volume.xpAmeBase,
        volume.xpFeuBase,
        volume.xpOmbreBase,
      ]
    );
  },

  /**
   * Save multiple volumes in a transaction
   */
  saveVolumes: async (volumes: Volume[]): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('BEGIN TRANSACTION');
      for (const volume of volumes) {
        await volumesDB.saveVolume(volume);
      }
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  },

  /**
   * Delete a volume by ID
   */
  deleteVolume: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM volumes WHERE id = ?', [id]);
  },

  /**
   * Delete all volumes for a chapter
   */
  deleteVolumesByChapter: async (chapterId: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM volumes WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Get all volume versions for a volume
   */
  getVolumeVersions: async (volumeId: string): Promise<VolumeVersion[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM volume_versions WHERE volumeId = ? ORDER BY createdAt ASC',
      [volumeId]
    );
    return rows.map(mapRowToVolumeVersion);
  },

  /**
   * Get a specific volume version by ID
   */
  getVolumeVersionById: async (id: string): Promise<VolumeVersion | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM volume_versions WHERE id = ?',
      [id]
    );
    return row ? mapRowToVolumeVersion(row) : null;
  },

  /**
   * Save a volume version (insert or replace)
   */
  saveVolumeVersion: async (version: VolumeVersion): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO volume_versions (
        id, volumeId, perspective, text, textBlobId, isAutoText, characterCount, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        version.id,
        version.volumeId,
        version.perspective,
        version.text ?? null,
        version.textBlobId ?? null,
        version.isAutoText ? 1 : 0,
        version.characterCount,
        version.createdAt,
      ]
    );
  },

  /**
   * Save multiple volume versions in a transaction
   */
  saveVolumeVersions: async (versions: VolumeVersion[]): Promise<void> => {
    const db = await getDatabase();
    try {
      await db.execAsync('BEGIN TRANSACTION');
      for (const version of versions) {
        await volumesDB.saveVolumeVersion(version);
      }
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  },

  /**
   * Delete a volume version by ID
   */
  deleteVolumeVersion: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM volume_versions WHERE id = ?', [id]);
  },
};
