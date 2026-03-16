/**
 * SQLite Database Schema
 * All table definitions for offline-first mobile app
 */

export const CREATE_CHAPTERS_TABLE = `
  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    protagonistName TEXT NOT NULL,
    status TEXT NOT NULL,
    coverAssetId TEXT,
    createdAt TEXT NOT NULL,
    publishedAt TEXT,
    isArchived INTEGER NOT NULL DEFAULT 0,
    scheduledFor TEXT,
    description TEXT,
    accroche_classic TEXT,
    accroche_dark TEXT,
    accroche_dark_collection TEXT,
    accroche_love TEXT,
    accroche_marketing TEXT,
    niveau_danger INTEGER NOT NULL DEFAULT 0,
    niveau_douceur INTEGER NOT NULL DEFAULT 0,
    niveau_intensite INTEGER NOT NULL DEFAULT 0,
    niveau_transformation INTEGER NOT NULL DEFAULT 0
  );
`;

export const CREATE_VOLUMES_TABLE = `
  CREATE TABLE IF NOT EXISTS volumes (
    id TEXT PRIMARY KEY,
    chapterId TEXT NOT NULL,
    volumeNumber INTEGER NOT NULL,
    title TEXT NOT NULL,
    isFinalPaywall INTEGER NOT NULL DEFAULT 0,
    illustrationAssetId TEXT,
    createdAt TEXT NOT NULL,
    publishedAt TEXT,
    isFree INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    charme INTEGER NOT NULL DEFAULT 0,
    danger INTEGER NOT NULL DEFAULT 0,
    douceur INTEGER NOT NULL DEFAULT 0,
    intensite INTEGER NOT NULL DEFAULT 0,
    isDarkCollection INTEGER NOT NULL DEFAULT 0,
    mystere INTEGER NOT NULL DEFAULT 0,
    transformation INTEGER NOT NULL DEFAULT 0,
    xpAmeBase INTEGER NOT NULL DEFAULT 0,
    xpFeuBase INTEGER NOT NULL DEFAULT 0,
    xpOmbreBase INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
  );
`;

export const CREATE_VOLUME_VERSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS volume_versions (
    id TEXT PRIMARY KEY,
    volumeId TEXT NOT NULL,
    perspective TEXT NOT NULL,
    text TEXT,
    textBlobId TEXT,
    isAutoText INTEGER NOT NULL DEFAULT 0,
    characterCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (volumeId) REFERENCES volumes(id) ON DELETE CASCADE
  );
`;

export const CREATE_USER_PROGRESS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    chapterId TEXT NOT NULL,
    volumeNumber INTEGER NOT NULL,
    perspective TEXT NOT NULL,
    progress REAL NOT NULL DEFAULT 0,
    completedAt TEXT,
    UNIQUE(chapterId, volumeNumber, perspective),
    FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
  );
`;

export const CREATE_BOOKMARKS_TABLE = `
  CREATE TABLE IF NOT EXISTS bookmarks (
    chapterId TEXT PRIMARY KEY,
    FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
  );
`;

export const CREATE_SYNC_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );
`;

export const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS migrations (
    version INTEGER PRIMARY KEY
  );
`;

// Performance indexes
export const CREATE_VOLUMES_CHAPTER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_volumes_chapter ON volumes(chapterId);
`;

export const CREATE_PROGRESS_CHAPTER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_progress_chapter ON user_progress(chapterId);
`;

export const CREATE_SYNC_STATUS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
`;

export const CREATE_VERSIONS_VOLUME_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_versions_volume ON volume_versions(volumeId);
`;

/**
 * All schema tables and indexes in order
 */
export const ALL_SCHEMA_STATEMENTS = [
  CREATE_CHAPTERS_TABLE,
  CREATE_VOLUMES_TABLE,
  CREATE_VOLUME_VERSIONS_TABLE,
  CREATE_USER_PROGRESS_TABLE,
  CREATE_BOOKMARKS_TABLE,
  CREATE_SYNC_QUEUE_TABLE,
  CREATE_MIGRATIONS_TABLE,
  CREATE_VOLUMES_CHAPTER_INDEX,
  CREATE_PROGRESS_CHAPTER_INDEX,
  CREATE_SYNC_STATUS_INDEX,
  CREATE_VERSIONS_VOLUME_INDEX,
];
