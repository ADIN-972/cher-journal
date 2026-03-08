/**
 * Get image URL (uses thumbnail if available, falls back to original)
 * Thumbnails are generated server-side with -thumb suffix and stored in uploads folder
 * Returns absolute URLs pointing to the API domain for cross-domain access
 */
export function getImageUrl(asset: any): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.moncherjournal.com';

  // If asset already has a full URL (e.g., from custom story uploads), return it directly
  if (asset?.url && typeof asset.url === 'string' && (asset.url.startsWith('http') || asset.url.startsWith('/uploads'))) {
    return asset.url;
  }

  if (asset?.thumbnailObjectKey) {
    return `${apiUrl}/uploads/${asset.thumbnailObjectKey}`;
  }
  return asset?.objectKey ? `${apiUrl}/uploads/${asset.objectKey}` : "";
}
