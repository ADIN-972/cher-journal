/**
 * Database Initialization
 * Called on app startup to setup SQLite
 */

import * as SQLite from 'expo-sqlite';
import { getDatabase } from './database';
import { runMigrations } from './migrations';

/**
 * Initialize the SQLite database
 * - Gets or creates database instance
 * - Runs all pending migrations
 * - Returns the initialized database
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await getDatabase();
  await runMigrations(db);
  return db;
};
