import * as FileSystem from 'expo-file-system';
import {
  initImageCache,
  getCachedImagePath,
  downloadAndCacheImage,
  clearImageCache,
  getCacheStats,
} from '@/services/cache/imageCache';

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock/cache/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('Image Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initImageCache', () => {
    it('should create cache directory if it does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValueOnce(undefined);

      await initImageCache();

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        expect.stringContaining('chapter-images'),
        { intermediates: true }
      );
    });

    it('should not create directory if it already exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });

      await initImageCache();

      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });
  });

  describe('getCachedImagePath', () => {
    it('should return path if file exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        isDirectory: false,
        size: 50000,
      });

      const result = await getCachedImagePath('img-123');
      expect(result).toContain('img-123.jpg');
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
      // First call: getCachedImagePath check - file not cached
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      // Second call: after download, get file size
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true, size: 50000 });
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({
        uri: '/mock/cache/chapter-images/img-123.jpg',
      });

      const result = await downloadAndCacheImage('img-123', 'http://example.com/img.jpg');

      expect(FileSystem.downloadAsync).toHaveBeenCalled();
      expect(result).toContain('img-123.jpg');
    });

    it('should throw on download errors', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      (FileSystem.downloadAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Download failed')
      );

      await expect(
        downloadAndCacheImage('img-fail', 'http://example.com/img.jpg')
      ).rejects.toThrow('Download failed');
    });
  });

  describe('clearImageCache', () => {
    it('should delete cache directory', async () => {
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValueOnce(undefined);
      // initImageCache is called after clear
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValueOnce(undefined);

      await clearImageCache();

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('chapter-images')
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
    it('should return cache size and file count', () => {
      // getCacheStats is synchronous - returns in-memory stats
      const stats = getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('count');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.count).toBe('number');
    });
  });
});
