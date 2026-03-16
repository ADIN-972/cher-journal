import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import CachedImage from '@/components/CachedImage';
import type { Chapter } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const ChaptersListScreen: React.FC = () => {
  const router = useRouter();
  const { chapters, loading, error, fetchChapters, setSelectedChapter } =
    useChapterStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChapters({ forceRefresh: true });
    setRefreshing(false);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/chapters/${chapter.id}`);
  };

  if (loading && !refreshing && chapters.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 16, color: 'red', marginBottom: 16 }}>
          Error: {error}
        </Text>
        <TouchableOpacity
          onPress={() => handleRefresh()}
          style={{ backgroundColor: '#E11D48', padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#E11D48"
        />
      }
    >
      {chapters.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => handleSelectChapter(item)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e5e5',
            flexDirection: 'row',
          }}
        >
          {item.coverAssetId && (
            <CachedImage
              assetId={item.coverAssetId}
              imageUrl={`${API_BASE_URL}/assets/${item.coverAssetId}`}
              width={60}
              height={90}
              style={{ marginRight: 12, borderRadius: 4 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
              {item.protagonistName}
            </Text>
            {item.description && (
              <Text
                style={{ fontSize: 12, color: '#999' }}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default ChaptersListScreen;
