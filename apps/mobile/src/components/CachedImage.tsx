import React from 'react';
import { Image } from 'expo-image';

interface CachedImageProps {
  assetId?: string;
  imageUrl: string;
  style?: object;
  width?: number;
  height?: number;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none';
}

const CachedImage: React.FC<CachedImageProps> = ({
  imageUrl,
  style,
  width = 150,
  height = 200,
  contentFit = 'cover',
}) => {
  return (
    <Image
      source={{ uri: imageUrl }}
      style={[{ width, height }, style]}
      contentFit={contentFit}
      transition={200}
      cachePolicy="memory-disk"
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
    />
  );
};

export default CachedImage;
