import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { useThemeColors } from '@/theme/ThemeContext';
import Icon from '@/components/Icon';
import { spacing, fontSize, borderRadius } from '@/utils/theme';
import type { Chapter } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const getCoverUrl = (chapter: Chapter): string | null => {
  if (chapter.coverAsset?.url) return `${API_BASE_URL}${chapter.coverAsset.url}`;
  return null;
};

const ChaptersListScreen: React.FC = () => {
  const router = useRouter();
  const tc = useThemeColors();
  const { chapters, loading, error, fetchChapters, setSelectedChapter } = useChapterStore();
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
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.rose} />
      </View>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: tc.background }]}>
        <Text style={[styles.errorIcon, { color: tc.rose }]}>!</Text>
        <Text style={[styles.errorText, { color: tc.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: tc.rose }]} onPress={handleRefresh}>
          <Text style={styles.retryText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tc.background }]}>
      <View style={[styles.header, { borderBottomColor: tc.separator }]}>
        <Text style={[styles.headerTitle, { color: tc.text }]}>Chapitres</Text>
        <Text style={[styles.headerCount, { color: tc.textSecondary }]}>
          {chapters.length} histoire{chapters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tc.rose} />
        }
        contentContainerStyle={styles.list}
      >
        {chapters.map((item, index) => (
          <View key={item.id}>
            {index > 0 && <View style={[styles.separator, { backgroundColor: tc.separatorLight }]} />}
            <TouchableOpacity
              onPress={() => handleSelectChapter(item)}
              style={styles.chapterRow}
              activeOpacity={0.7}
            >
              <View style={styles.coverContainer}>
                {getCoverUrl(item) ? (
                  <Image
                    source={{ uri: getCoverUrl(item)! }}
                    style={[styles.coverImage, item.isPrivateLocked && { opacity: 0.4 }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[styles.coverImage, { backgroundColor: tc.boudoir800 }, item.isPrivateLocked && { opacity: 0.4 }]}>
                    <Text style={{ fontSize: fontSize['2xl'], fontWeight: '300', color: tc.gold, opacity: 0.5 }}>
                      {item.title.charAt(0)}
                    </Text>
                  </View>
                )}
                {item.isPrivateLocked && (
                  <View style={styles.lockOverlay}>
                    <Icon name="lock" size={28} color="#FFFFFF" />
                  </View>
                )}
              </View>
              {item.isPrivateLocked && (
                <View style={styles.clubBadge}>
                  <Text style={styles.clubBadgeText}>Club</Text>
                </View>
              )}
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterProtagonist, { color: tc.gold }]}>{item.protagonistName}</Text>
                <Text style={[styles.chapterTitle, { color: tc.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.description && (
                  <Text style={[styles.chapterDescription, { color: tc.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.intensityRow}>
                  {Array.from({ length: Math.min(item.niveau_intensite, 5) }).map((_, i) => (
                    <View key={i} style={[styles.intensityDot, { backgroundColor: tc.rose }]} />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default ChaptersListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  headerCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  chapterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  coverContainer: {
    position: 'relative',
    width: 70,
    height: 100,
  },
  coverImage: {
    width: 70,
    height: 100,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubBadge: {
    position: 'absolute',
    top: -4,
    left: 56,
    backgroundColor: '#A855F7',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  clubBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chapterInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  chapterTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize['2xl'],
  },
  chapterProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['4xl'],
    marginBottom: -spacing.md,
  },
  chapterDescription: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing.sm,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  separator: {
    height: 1,
    marginHorizontal: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  errorText: {
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
