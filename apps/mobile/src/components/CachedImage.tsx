import React, { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator, Text } from 'react-native';
import {
  downloadAndCacheImage,
  getCachedImagePath,
} from '@/services/cache';

interface CachedImageProps {
  assetId: string;
  imageUrl: string;
  style?: object;
  width?: number;
  height?: number;
}

const CachedImage: React.FC<CachedImageProps> = ({
  assetId,
  imageUrl,
  style,
  width = 150,
  height = 200,
}) => {
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [assetId, imageUrl]);

  const loadImage = async () => {
    try {
      setLoading(true);
      setError(false);

      // Try to get from cache first
      const cachedPath = await getCachedImagePath(assetId);
      if (cachedPath) {
        setLocalPath(cachedPath);
        setLoading(false);
        return;
      }

      // Not in cache, download
      const downloadedPath = await downloadAndCacheImage(assetId, imageUrl);
      setLocalPath(downloadedPath);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load image:', err);
      setError(true);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: '#e5e5e5',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
      >
        <Text style={{ color: '#999', fontSize: 12 }}>Image failed</Text>
      </View>
    );
  }

  if (loading || !localPath) {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
          ...style,
        }}
      >
        <ActivityIndicator size="small" color="#E11D48" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `file://${localPath}` }}
      style={{ width, height, ...style }}
      onError={() => setError(true)}
    />
  );
};

export default CachedImage;
