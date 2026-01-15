/**
 * Get image URL (uses thumbnail if available, falls back to original)
 * Thumbnails are generated server-side with -thumb suffix and stored in uploads folder
 */
export function getImageUrl(asset: any): string {
  if (asset?.thumbnailObjectKey) {
    return `/uploads/${asset.thumbnailObjectKey}`;
  }
  return asset?.objectKey ? `/uploads/${asset.objectKey}` : "";
}
