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
export const initDatabase = (): SQLite.SQLiteDatabase => {
  const db = getDatabase();
  runMigrations(db);
  return db;
};
