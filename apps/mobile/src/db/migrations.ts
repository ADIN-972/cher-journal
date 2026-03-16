/**
 * SQLite Database Migrations
 * Version-based migration system for schema updates
 */

import * as SQLite from 'expo-sqlite';
import {
  CREATE_MIGRATIONS_TABLE,
  CREATE_CHAPTERS_TABLE,
  CREATE_VOLUMES_TABLE,
  CREATE_VOLUME_VERSIONS_TABLE,
  CREATE_USER_PROGRESS_TABLE,
  CREATE_BOOKMARKS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
  CREATE_VOLUMES_CHAPTER_INDEX,
  CREATE_PROGRESS_CHAPTER_INDEX,
  CREATE_SYNC_STATUS_INDEX,
  CREATE_VERSIONS_VOLUME_INDEX,
} from './schema';

interface Migration {
  version: number;
  sql: string[];
}

/**
 * Define all migrations in order
 * Each migration has a version number and array of SQL statements
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: [
      CREATE_CHAPTERS_TABLE,
      CREATE_VOLUMES_TABLE,
      CREATE_VOLUME_VERSIONS_TABLE,
      CREATE_USER_PROGRESS_TABLE,
      CREATE_BOOKMARKS_TABLE,
      CREATE_SYNC_QUEUE_TABLE,
      CREATE_VOLUMES_CHAPTER_INDEX,
      CREATE_PROGRESS_CHAPTER_INDEX,
      CREATE_SYNC_STATUS_INDEX,
      CREATE_VERSIONS_VOLUME_INDEX,
    ],
  },
];

/**
 * Run pending migrations on the database
 * Uses version tracking to ensure migrations run only once
 */
export const runMigrations = (db: SQLite.SQLiteDatabase): void => {
  // Create migrations table if it doesn't exist
  db.execSync(CREATE_MIGRATIONS_TABLE);

  // Get current migration version
  const result = db.getFirstSync<{ version: number }>(
    'SELECT MAX(version) as version FROM migrations'
  );
  const currentVersion = result?.version ?? 0;

  // Run pending migrations
  const pendingMigrations = MIGRATIONS.filter((m) => m.version > currentVersion);

  for (const migration of pendingMigrations) {
    db.withTransactionSync(() => {
      // Execute all SQL statements in the migration
      for (const sql of migration.sql) {
        db.execSync(sql);
      }

      // Record migration completion
      db.runSync('INSERT INTO migrations (version) VALUES (?)', [
        migration.version,
      ]);
    });
  }
};
