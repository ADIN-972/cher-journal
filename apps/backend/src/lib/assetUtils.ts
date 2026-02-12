import fs from 'fs/promises';
import path from 'path';
import { config } from '@cher-journal/config';

/**
 * Resolve asset URL with thumbnail preference
 * If thumbnail exists in the upload folder, return thumbnail URL
 * Otherwise return the original asset URL
 */
export async function resolveAssetUrl(
  asset: { objectKey: string; thumbnailObjectKey?: string | null } | null | undefined
): Promise<string | null> {
  if (!asset) return null;

  // If thumbnail key exists, check if the file exists
  if (asset.thumbnailObjectKey) {
    try {
      const thumbnailPath = path.join(config.uploadDir, asset.thumbnailObjectKey);
      await fs.access(thumbnailPath);
      // Thumbnail exists, return it
      return `/uploads/${asset.thumbnailObjectKey}`;
    } catch {
      // Thumbnail doesn't exist, fall through to original
    }
  }

  // Return the original asset URL
  return `/uploads/${asset.objectKey}`;
}

/**
 * Serialize asset for API response
 * Returns only the appropriate URL (thumbnail if exists, otherwise original)
 * Also includes mimeType
 */
export async function serializeAsset(
  asset: { objectKey: string; thumbnailObjectKey?: string | null; mimeType?: string } | null | undefined
) {
  if (!asset) return null;

  const url = await resolveAssetUrl(asset);

  return {
    id: (asset as any).id || undefined,
    url,
    mimeType: asset.mimeType || undefined,
  };
}

/**
 * Serialize multiple assets (for batch processing)
 */
export async function serializeAssets(
  assets: Array<{ objectKey: string; thumbnailObjectKey?: string | null; mimeType?: string } | null | undefined>
) {
  return Promise.all(assets.map((asset) => serializeAsset(asset)));
}
