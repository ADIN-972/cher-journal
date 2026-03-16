/**
 * SQLite Database Singleton
 * Provides a single instance of the database connection
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the SQLite database instance
 * Uses singleton pattern to ensure only one connection exists
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('cher-journal.db');
  }
  return db;
};

/**
 * Close database connection (for cleanup/testing)
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
