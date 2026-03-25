import React, { useEffect, useState, useCallback } from 'react';
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
import { chaptersAPI } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import BookCard from '@/components/BookCard';
import ChapterReviewModal from '@/components/ChapterReviewModal';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';
import ScreenHeader from '@/components/ScreenHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

interface BookChapter {
  id: string;
  title: string;
  protagonistName: string;
  coverAsset?: { url: string };
  volumes: any[];
  hasStartedReading: boolean;
  totalVolumes: number;
  // Computed
  readVolumes: number;
  globalProgress: number;
  narratorProgress: number;
  protagonistProgress: number;
  narratorLastVolume: number;
  protagonistLastVolume: number;
  lastReadPerspective: string;
}

const getCoverUrl = (chapter: BookChapter): string | null => {
  if (chapter.coverAsset?.url) {
    return `${API_BASE_URL}${chapter.coverAsset.url}`;
  }
  return null;
};

const MyBooksScreen: React.FC = () => {
  const router = useRouter();
  const tc = useThemeColors();
  const [books, setBooks] = useState<BookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewChapter, setReviewChapter] = useState<{ id: string; title: string } | null>(null);

  const fetchMyBooks = useCallback(async () => {
    try {
      const chapters = await chaptersAPI.getChapters();
      const myBooks: BookChapter[] = [];

      for (const ch of chapters) {
        // Fetch full chapter data with volumes and progress
        const full = await chaptersAPI.getChapter(ch.id);
        const volumes = full.volumes || [];

        // Check if user has any progress on any volume
        let hasProgress = false;
        let readCount = 0;
        let totalNarratorProg = 0;
        let totalProtaProg = 0;
        let narratorLastVolume = 0;
        let protagonistLastVolume = 0;
        let lastPersp = 'NARRATOR';

        for (const vol of volumes) {
          const narratorProg = vol.progressByPerspective?.NARRATOR ?? 0;
          const protaProg = vol.progressByPerspective?.PROTAGONIST ?? 0;
          const maxProg = Math.max(narratorProg, protaProg);

          totalNarratorProg += narratorProg;
          totalProtaProg += protaProg;

          // Last owned (accessible) volume per perspective
          const narratorAccess = (vol as any).accessByPerspective?.NARRATOR;
          const protaAccess = (vol as any).accessByPerspective?.PROTAGONIST;
          if (narratorAccess?.isAccessible) narratorLastVolume = vol.volumeNumber ?? narratorLastVolume + 1;
          if (protaAccess?.isAccessible) protagonistLastVolume = vol.volumeNumber ?? protagonistLastVolume + 1;

          if (maxProg > 0) {
            hasProgress = true;
            if (protaProg > narratorProg) lastPersp = 'PROTAGONIST';
          }
          if (maxProg >= 100) readCount++;
        }

        if (hasProgress || (full as any).hasStartedReading) {
          const publishedVolumes = volumes.filter((v: any) => v.status === 'PUBLISHED');
          const count = publishedVolumes.length || 1;
          const narratorProgress = Math.round(totalNarratorProg / count);
          const protagonistProgress = Math.round(totalProtaProg / count);
          const globalProgress = Math.max(narratorProgress, protagonistProgress);

          myBooks.push({
            id: full.id,
            title: full.title,
            protagonistName: (full as any).protagonistName || '',
            coverAsset: (full as any).coverAsset,
            volumes: publishedVolumes,
            hasStartedReading: true,
            totalVolumes: publishedVolumes.length,
            readVolumes: readCount,
            globalProgress,
            narratorProgress,
            protagonistProgress,
            narratorLastVolume,
            protagonistLastVolume,
            lastReadPerspective: lastPersp,
          });
        }
      }

      setBooks(myBooks);
      setError(null);
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyBooks();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.gold} />
        <Text style={[styles.loadingText, { color: tc.textSecondary }]}>Chargement de votre bibliotheque...</Text>
      </View>
    );
  }

  if (error && books.length === 0) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: tc.background }]}>
        <Icon name="error" size={40} color={tc.error} />
        <Text style={[styles.errorText, { color: tc.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: tc.rose }]} onPress={handleRefresh}>
          <Text style={styles.retryText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: tc.background }]}>
        <Icon name="auto_stories" size={56} color={tc.gold} style={{ opacity: 0.4 }} />
        <Text style={[styles.emptyTitle, { color: tc.text }]}>Aucune lecture en cours</Text>
        <Text style={[styles.emptyText, { color: tc.textSecondary }]}>
          Commencez a lire un chapitre et retrouvez-le ici avec votre progression.
        </Text>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: tc.gold }]}
          onPress={() => router.push('/chapters')}
          activeOpacity={0.7}
        >
          <Icon name="explore" size={18} color={colors.white} />
          <Text style={styles.exploreButtonText}>Explorer les chapitres</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tc.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tc.gold} />
      }
    >
      <ScreenHeader title="Mes Livres" subtitle={`${books.length} chapitre${books.length !== 1 ? 's' : ''} en cours`} />

      {/* Books list */}
      <View style={styles.list}>
        {books.map((book) => {
          const coverUrl = getCoverUrl(book);
          return (
            <View key={book.id} style={{ position: 'relative' }}>
              <BookCard
                id={book.id}
                title={book.title}
                protagonistName={book.protagonistName}
                coverUrl={coverUrl}
                globalProgress={book.globalProgress}
                narratorProgress={book.narratorProgress}
                protagonistProgress={book.protagonistProgress}
                narratorLastVolume={book.narratorLastVolume}
                protagonistLastVolume={book.protagonistLastVolume}
                readVolumes={book.readVolumes}
                totalVolumes={book.totalVolumes}
                lastReadPerspective={book.lastReadPerspective}
                onPress={() => router.push(`/chapters/${book.id}`)}
              />
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setReviewChapter({ id: book.id, title: book.title })}
                activeOpacity={0.7}
              >
                <Icon name="rate_review" size={16} color={tc.gold} />
                <Text style={[styles.reviewButtonText, { color: tc.gold }]}>Laisser un commentaire</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      {/* Explore more */}
      <TouchableOpacity
        style={styles.exploreMore}
        onPress={() => router.push('/chapters')}
        activeOpacity={0.7}
      >
        <Icon name="add" size={18} color={tc.gold} />
        <Text style={[styles.exploreMoreText, { color: tc.gold }]}>Decouvrir d'autres chapitres</Text>
      </TouchableOpacity>

      <View style={{ height: spacing['4xl'] }} />

      {/* Review Modal */}
      {reviewChapter && (
        <ChapterReviewModal
          visible={!!reviewChapter}
          onClose={() => setReviewChapter(null)}
          chapterId={reviewChapter.id}
          chapterTitle={reviewChapter.title}
          chapterProtagonistName={books.find((b) => b.id === reviewChapter.id)?.protagonistName || ''}
          chapterCoverUrl={getCoverUrl(books.find((b) => b.id === reviewChapter.id) as BookChapter)}  
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.full,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Newsreader_400Regular_Italic',
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['2xl'],
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing['3xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.charcoal,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  exploreButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.gray[600],
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

  // Explore more
  exploreMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.gold}40`,
    borderStyle: 'dashed',
  },
  exploreMoreText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.gold,
  },

  // Review button
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewButtonText: {
    fontSize: fontSize.xs,
    color: colors.gold,
    fontWeight: '500',
  },
});

export default MyBooksScreen;
