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
import Icon from '@/components/Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import type { Chapter } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const getCoverUrl = (chapter: Chapter): string | null => {
  if (chapter.coverAsset?.url) {
    return `${API_BASE_URL}${chapter.coverAsset.url}`;
  }
  return null;
};

const ChaptersListScreen: React.FC = () => {
  const router = useRouter();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.rose} />
      </View>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chapitres</Text>
        <Text style={styles.headerCount}>
          {chapters.length} histoire{chapters.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.rose}
          />
        }
        contentContainerStyle={styles.list}
      >
        {chapters.map((item, index) => (
          <View key={item.id}>
            {index > 0 && <View style={styles.separator} />}
            <TouchableOpacity
              onPress={() => handleSelectChapter(item)}
              style={styles.chapterRow}
              activeOpacity={0.7}
            >
              <View style={styles.coverContainer}>
                {getCoverUrl(item) ? (
                  <Image
                    source={{ uri: getCoverUrl(item)! }}
                    style={[
                      styles.coverImage,
                      { width: 70, height: 100 },
                      item.isPrivateLocked && { opacity: 0.4 },
                    ]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                ) : (
                  <View style={[
                    styles.coverImage,
                    styles.coverPlaceholder,
                    item.isPrivateLocked && { opacity: 0.4 },
                  ]}>
                    <Text style={styles.coverPlaceholderText}>{item.title.charAt(0)}</Text>
                  </View>
                )}
                {item.isPrivateLocked && (
                  <View style={styles.lockOverlay}>
                    <Icon name="lock" size={28} color={colors.white} />
                  </View>
                )}
              </View>
              {item.isPrivateLocked && (
                <View style={styles.clubBadge}>
                  <Text style={styles.clubBadgeText}>Club</Text>
                </View>
              )}
              <View style={styles.chapterInfo}>
              
                  <Text style={styles.chapterProtagonist}>{item.protagonistName}</Text>
                  <Text style={styles.chapterTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
               
                {item.description && (
                  <Text style={styles.chapterDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.intensityRow}>
                  {Array.from({ length: Math.min(item.niveau_intensite, 5) }).map((_, i) => (
                    <View key={i} style={styles.intensityDot} />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.charcoal,
  },
  headerCount: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
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
    position: 'relative' as const,
    width: 70,
    height: 100,
  },
  coverImage: {
    width: 70,
    height: 100,
    borderRadius: borderRadius.md,
  },
  lockOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  clubBadge: {
    position: 'absolute' as const,
    top: -4,
    left: 56,
    backgroundColor: '#A855F7',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  clubBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  coverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: fontSize['2xl'],
    fontWeight: '300',
    color: colors.gold,
    opacity: 0.5,
  },
  chapterInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  chapterTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize['2xl'],
    color: colors.charcoal,
  },
  chapterProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['4xl'],
    marginBottom: -spacing.md,
    color: colors.gold,
  },
  chapterDescription: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
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
    backgroundColor: colors.rose,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    backgroundColor: colors.background,
  },
  errorIcon: {
    fontSize: 40,
    color: colors.rose,
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});

export default ChaptersListScreen;
