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
  addToQueue: async (action: string, payload: any): Promise<string> => {
    const db = await getDatabase();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO sync_queue (id, action, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, action, JSON.stringify(payload), createdAt, 'pending']
    );

    return id;
  },

  /**
   * Get all pending items (not yet synced)
   */
  getPendingItems: async (): Promise<SyncQueueItem[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY createdAt ASC"
    );
    return rows.map(mapRowToSyncItem);
  },

  /**
   * Get item by ID
   */
  getItem: async (id: string): Promise<SyncQueueItem | null> => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<any>('SELECT * FROM sync_queue WHERE id = ?', [
      id,
    ]);
    return row ? mapRowToSyncItem(row) : null;
  },

  /**
   * Get all items (any status)
   */
  getAllItems: async (): Promise<SyncQueueItem[]> => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM sync_queue ORDER BY createdAt ASC'
    );
    return rows.map(mapRowToSyncItem);
  },

  /**
   * Mark an item as synced
   */
  markAsSynced: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync("UPDATE sync_queue SET status = 'synced' WHERE id = ?", [id]);
  },

  /**
   * Mark an item as failed
   */
  markAsFailed: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync("UPDATE sync_queue SET status = 'failed' WHERE id = ?", [id]);
  },

  /**
   * Clear all synced items from queue
   */
  clearSyncedItems: async (): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_queue WHERE status = 'synced'");
  },

  /**
   * Clear all failed items from queue
   */
  clearFailedItems: async (): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_queue WHERE status = 'failed'");
  },

  /**
   * Delete an item from queue
   */
  deleteItem: async (id: string): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  },

  /**
   * Clear entire sync queue
   */
  clearQueue: async (): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_queue');
  },

  /**
   * Get queue statistics
   */
  getStats: async (): Promise<{
    pending: number;
    synced: number;
    failed: number;
    total: number;
  }> => {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
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
