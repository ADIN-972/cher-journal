import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import CachedImage from '@/components/CachedImage';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import type { Chapter } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (4 / 3);
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const HomeScreen: React.FC = () => {
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

  const publishedChapters = chapters.filter((c) => c.status === 'PUBLISHED');
  const featuredChapter = publishedChapters[0];
  const recentChapters = publishedChapters.slice(0, 6);

  if (loading && chapters.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.rose} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.rose}
        />
      }
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Cher Journal</Text>
        <Text style={styles.heroSubtitle}>L'Ecrin des Desirs</Text>
        <View style={styles.heroSeparator} />
        <Text style={styles.heroTagline}>
          Plongez dans des histoires sensuelles et intimes
        </Text>
      </View>

      {/* Featured Chapter */}
      {featuredChapter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A la une</Text>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => handleSelectChapter(featuredChapter)}
            activeOpacity={0.85}
          >
            {featuredChapter.coverAssetId ? (
              <CachedImage
                assetId={featuredChapter.coverAssetId}
                imageUrl={`${API_BASE_URL}/assets/${featuredChapter.coverAssetId}`}
                width={SCREEN_WIDTH - spacing.lg * 2}
                height={220}
                style={styles.featuredImage}
              />
            ) : (
              <View style={[styles.featuredImage, styles.featuredPlaceholder]}>
                <Text style={styles.placeholderIcon}>{'<>'}</Text>
              </View>
            )}
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>{featuredChapter.title}</Text>
              <Text style={styles.featuredProtagonist}>
                {featuredChapter.protagonistName}
              </Text>
              {featuredChapter.accroche_classic && (
                <Text style={styles.featuredAccroche} numberOfLines={2}>
                  {featuredChapter.accroche_classic}
                </Text>
              )}
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Decouvrir</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Chapters Grid */}
      {recentChapters.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nos chapitres</Text>
            <TouchableOpacity onPress={() => router.push('/chapters')}>
              <Text style={styles.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chaptersRow}
          >
            {recentChapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                style={styles.chapterCard}
                onPress={() => handleSelectChapter(chapter)}
                activeOpacity={0.85}
              >
                {chapter.coverAssetId ? (
                  <CachedImage
                    assetId={chapter.coverAssetId}
                    imageUrl={`${API_BASE_URL}/assets/${chapter.coverAssetId}`}
                    width={CARD_WIDTH}
                    height={CARD_HEIGHT}
                    style={styles.chapterImage}
                  />
                ) : (
                  <View style={[styles.chapterImage, styles.chapterPlaceholder]}>
                    <Text style={styles.chapterPlaceholderText}>
                      {chapter.title.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.chapterCardOverlay} />
                <View style={styles.chapterCardContent}>
                  <Text style={styles.chapterCardTitle} numberOfLines={2}>
                    {chapter.title}
                  </Text>
                  <Text style={styles.chapterCardProtagonist} numberOfLines={1}>
                    {chapter.protagonistName}
                  </Text>
                </View>
                {/* Intensity dots */}
                <View style={styles.intensityRow}>
                  {Array.from({ length: Math.min(chapter.niveau_intensite, 5) }).map(
                    (_, i) => (
                      <View key={i} style={styles.intensityDot} />
                    )
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quote Section */}
      <View style={styles.quoteSection}>
        <Text style={styles.quoteText}>
          "Chaque page est une invitation au voyage interieur..."
        </Text>
        <View style={styles.quoteLine} />
      </View>

      {/* Error */}
      {error && chapters.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Reessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.gray[500],
  },

  // Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.boudoir[950],
  },
  heroTitle: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.white,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    fontWeight: '300',
    color: colors.goldLight,
    marginTop: spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroSeparator: {
    width: 60,
    height: 1,
    backgroundColor: colors.gold,
    marginVertical: spacing.lg,
  },
  heroTagline: {
    fontSize: fontSize.base,
    color: colors.boudoir[200],
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.charcoal,
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
  seeAllLink: {
    fontSize: fontSize.sm,
    color: colors.rose,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },

  // Featured Card
  featuredCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.boudoir[900],
    elevation: 8,
    shadowColor: colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  featuredPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    color: colors.gold,
    opacity: 0.3,
  },
  featuredOverlay: {
    padding: spacing.lg,
  },
  featuredTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  featuredProtagonist: {
    fontSize: fontSize.base,
    color: colors.roseLight,
    marginBottom: spacing.sm,
  },
  featuredAccroche: {
    fontSize: fontSize.sm,
    color: colors.boudoir[200],
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.rose,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  featuredBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Chapter Cards (horizontal scroll)
  chaptersRow: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  chapterCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.boudoir[900],
  },
  chapterImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
  },
  chapterPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterPlaceholderText: {
    fontSize: fontSize['4xl'],
    fontWeight: '300',
    color: colors.gold,
    opacity: 0.4,
  },
  chapterCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: borderRadius.xl,
  },
  chapterCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  chapterCardTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  chapterCardProtagonist: {
    fontSize: fontSize.xs,
    color: colors.roseLight,
    fontWeight: '400',
  },
  intensityRow: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: 3,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.rose,
  },

  // Quote
  quoteSection: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  quoteText: {
    fontSize: fontSize.lg,
    fontStyle: 'italic',
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 28,
  },
  quoteLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.gold,
    marginTop: spacing.lg,
  },

  // Error
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
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

export default HomeScreen;
