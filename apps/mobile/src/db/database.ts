/**
 * SQLite Database Singleton
 * Provides a single instance of the database connection
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Get or create the SQLite database instance
 * Uses singleton pattern to ensure only one connection exists
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = SQLite.openDatabaseAsync('cher-journal.db').then((database) => {
    db = database;
    dbPromise = null;
    return database;
  });

  return dbPromise;
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
