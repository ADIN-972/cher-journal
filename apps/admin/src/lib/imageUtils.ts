/**
 * Get image URL (uses thumbnail if available, falls back to original)
 * Thumbnails are generated server-side with -thumb suffix and stored in uploads folder
 * Returns absolute URLs pointing to the API domain for cross-domain access
 */
export function getImageUrl(asset: any): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moncherjournal.com';

  if (asset?.thumbnailObjectKey) {
    return `${apiUrl}/uploads/${asset.thumbnailObjectKey}`;
  }
  return asset?.objectKey ? `${apiUrl}/uploads/${asset.objectKey}` : "";
}
