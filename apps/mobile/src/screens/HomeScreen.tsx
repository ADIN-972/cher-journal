import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/utils/theme';
import type { Chapter } from '@/types';

import {
  HeroSection,
  FeaturedSection,
  RecentChaptersSection,
  QuoteSection,
  PassionsSection,
  FemmesSection,
  DestinySection,
} from '@/components/home';

const HomeScreen: React.FC = () => {
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

  const publishedChapters = chapters.filter((c) => c.status === 'PUBLISHED');
  const featuredChapter = publishedChapters.find((c: any) => c.isFavorite) || publishedChapters[0];
  const recentChapters = publishedChapters.slice(0, 6);

  // Top 3 most intense chapters for "Les Passions Charnelles"
  const topPassionate = [...publishedChapters]
    .map((ch) => ({
      ...ch,
      score:
        ((ch.niveau_intensite ?? 0) +
          (ch.niveau_douceur ?? 0) +
          (ch.niveau_danger ?? 0) +
          (ch.niveau_transformation ?? 0)) /
        4,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (loading && chapters.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.rose} />
        <Text style={[styles.loadingText, { color: tc.textSecondary }]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tc.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tc.rose} />
      }
    >
      <HeroSection />

      {featuredChapter && (
        <FeaturedSection chapter={featuredChapter} onPress={handleSelectChapter} />
      )}

      {recentChapters.length > 0 && (
        <RecentChaptersSection chapters={recentChapters} onSelectChapter={handleSelectChapter} />
      )}

      <QuoteSection />

      <PassionsSection chapters={topPassionate} onSelectChapter={handleSelectChapter} />

      <FemmesSection />

      <DestinySection />

      {/* Error */}
      {error && chapters.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: tc.error }]}>Erreur: {error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tc.rose }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>Reessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.base,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
