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
  getVolumesByChapter: (chapterId: string): Volume[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM volumes WHERE chapterId = ? ORDER BY volumeNumber ASC',
      [chapterId]
    );
    return rows.map(mapRowToVolume);
  },

  /**
   * Get a specific volume by ID
   */
  getVolumeById: (id: string): Volume | null => {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM volumes WHERE id = ?', [id]);
    return row ? mapRowToVolume(row) : null;
  },

  /**
   * Save a single volume (insert or replace)
   */
  saveVolume: (volume: Volume): void => {
    const db = getDatabase();
    db.runSync(
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
  saveVolumes: (volumes: Volume[]): void => {
    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const volume of volumes) {
        volumesDB.saveVolume(volume);
      }
    });
  },

  /**
   * Delete a volume by ID
   */
  deleteVolume: (id: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM volumes WHERE id = ?', [id]);
  },

  /**
   * Delete all volumes for a chapter
   */
  deleteVolumesByChapter: (chapterId: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM volumes WHERE chapterId = ?', [chapterId]);
  },

  /**
   * Get all volume versions for a volume
   */
  getVolumeVersions: (volumeId: string): VolumeVersion[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM volume_versions WHERE volumeId = ? ORDER BY createdAt ASC',
      [volumeId]
    );
    return rows.map(mapRowToVolumeVersion);
  },

  /**
   * Get a specific volume version by ID
   */
  getVolumeVersionById: (id: string): VolumeVersion | null => {
    const db = getDatabase();
    const row = db.getFirstSync<any>(
      'SELECT * FROM volume_versions WHERE id = ?',
      [id]
    );
    return row ? mapRowToVolumeVersion(row) : null;
  },

  /**
   * Save a volume version (insert or replace)
   */
  saveVolumeVersion: (version: VolumeVersion): void => {
    const db = getDatabase();
    db.runSync(
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
  saveVolumeVersions: (versions: VolumeVersion[]): void => {
    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const version of versions) {
        volumesDB.saveVolumeVersion(version);
      }
    });
  },

  /**
   * Delete a volume version by ID
   */
  deleteVolumeVersion: (id: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM volume_versions WHERE id = ?', [id]);
  },
};
