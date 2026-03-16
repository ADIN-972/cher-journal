import * as FileSystem from 'expo-file-system';
import {
  getCachedImagePath,
  downloadAndCacheImage,
  clearImageCache,
  getCacheStats,
} from '@/services/cache/imageCache';

jest.mock('expo-file-system');

describe('Image Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedImagePath', () => {
    it('should return path if file exists', async () => {
      const mockPath = '/cache/img-123.jpg';
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 50000,
      });

      const result = await getCachedImagePath('img-123');
      expect(result).toBe(mockPath);
    });

    it('should return null if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: false,
      });

      const result = await getCachedImagePath('img-missing');
      expect(result).toBeNull();
    });

    it('should handle file system errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValueOnce(
        new Error('FS error')
      );

      const result = await getCachedImagePath('img-error');
      expect(result).toBeNull();
    });
  });

  describe('downloadAndCacheImage', () => {
    it('should download and cache image', async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        uri: '/cache/img-123.jpg',
      });

      const result = await downloadAndCacheImage('img-123', 'http://example.com/img.jpg');

      expect(FileSystem.downloadAsync).toHaveBeenCalled();
      expect(result).toBe('/cache/img-123.jpg');
    });

    it('should handle download errors', async () => {
      (FileSystem.downloadAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Download failed')
      );

      const result = await downloadAndCacheImage('img-fail', 'http://example.com/img.jpg');

      expect(result).toBeNull();
    });

    it('should ensure cache directory exists', async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        uri: '/cache/img-123.jpg',
      });

      await downloadAndCacheImage('img-123', 'http://example.com/img.jpg');

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
    });
  });

  describe('clearImageCache', () => {
    it('should delete cache directory', async () => {
      await clearImageCache();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('cache'),
        { idempotent: true }
      );
    });

    it('should handle deletion errors', async () => {
      (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      // Should not throw
      await expect(clearImageCache()).resolves.not.toThrow();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache size and file count', async () => {
      (FileSystem as any).listAsync.mockResolvedValueOnce([
        { name: 'img-1.jpg', size: 50000 },
        { name: 'img-2.jpg', size: 75000 },
      ]);

      const stats = await getCacheStats();

      expect(stats.size).toBe(125000);
      expect(stats.count).toBe(2);
    });

    it('should return 0 if cache is empty', async () => {
      (FileSystem as any).listAsync.mockResolvedValueOnce([]);

      const stats = await getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.count).toBe(0);
    });

    it('should handle list errors', async () => {
      (FileSystem as any).listAsync.mockRejectedValueOnce(
        new Error('List failed')
      );

      const stats = await getCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.count).toBe(0);
    });
  });
});
