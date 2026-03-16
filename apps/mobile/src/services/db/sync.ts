/**
 * Sync Queue Database Service
 * CRUD operations for sync_queue table (offline action queueing)
 */

import { getDatabase } from '@/db';

interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  createdAt: string;
  status: 'pending' | 'synced' | 'failed';
}

/**
 * Map database row to SyncQueueItem type
 * Parses JSON payload back to object
 */
const mapRowToSyncItem = (row: any): SyncQueueItem => ({
  id: row.id,
  action: row.action,
  payload: JSON.parse(row.payload),
  createdAt: row.createdAt,
  status: row.status,
});

export const syncDB = {
  /**
   * Add an action to the sync queue
   */
  addToQueue: (action: string, payload: any): string => {
    const db = getDatabase();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    db.runSync(
      `INSERT INTO sync_queue (id, action, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, action, JSON.stringify(payload), createdAt, 'pending']
    );

    return id;
  },

  /**
   * Get all pending items (not yet synced)
   */
  getPendingItems: (): SyncQueueItem[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY createdAt ASC"
    );
    return rows.map(mapRowToSyncItem);
  },

  /**
   * Get item by ID
   */
  getItem: (id: string): SyncQueueItem | null => {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM sync_queue WHERE id = ?', [
      id,
    ]);
    return row ? mapRowToSyncItem(row) : null;
  },

  /**
   * Get all items (any status)
   */
  getAllItems: (): SyncQueueItem[] => {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM sync_queue ORDER BY createdAt ASC'
    );
    return rows.map(mapRowToSyncItem);
  },

  /**
   * Mark an item as synced
   */
  markAsSynced: (id: string): void => {
    const db = getDatabase();
    db.runSync("UPDATE sync_queue SET status = 'synced' WHERE id = ?", [id]);
  },

  /**
   * Mark an item as failed
   */
  markAsFailed: (id: string): void => {
    const db = getDatabase();
    db.runSync("UPDATE sync_queue SET status = 'failed' WHERE id = ?", [id]);
  },

  /**
   * Clear all synced items from queue
   */
  clearSyncedItems: (): void => {
    const db = getDatabase();
    db.runSync("DELETE FROM sync_queue WHERE status = 'synced'");
  },

  /**
   * Clear all failed items from queue
   */
  clearFailedItems: (): void => {
    const db = getDatabase();
    db.runSync("DELETE FROM sync_queue WHERE status = 'failed'");
  },

  /**
   * Delete an item from queue
   */
  deleteItem: (id: string): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM sync_queue WHERE id = ?', [id]);
  },

  /**
   * Clear entire sync queue
   */
  clearQueue: (): void => {
    const db = getDatabase();
    db.runSync('DELETE FROM sync_queue');
  },

  /**
   * Get queue statistics
   */
  getStats: (): {
    pending: number;
    synced: number;
    failed: number;
    total: number;
  } => {
    const db = getDatabase();
    const result = db.getFirstSync<any>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'synced' THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
       FROM sync_queue`
    );

    return {
      pending: result?.pending ?? 0,
      synced: result?.synced ?? 0,
      failed: result?.failed ?? 0,
      total: result?.total ?? 0,
    };
  },
};

export type { SyncQueueItem };
