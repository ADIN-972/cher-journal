import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { chaptersAPI } from '@/services/api';
import EmotionalLevels from '@/components/EmotionalLevels';
import GenreBadge from '@/components/GenreBadge';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import VolumeBook from '@/components/VolumeBook';
import ColoringGallery from '@/components/ColoringGallery';
import type { Volume } from '@/types';

type Perspective = 'narrateur' | 'protagonist' | 'coloriage';

const PERSPECTIVES: { id: Perspective; label: string; icon: string; color: string }[] = [
  { id: 'narrateur', label: 'Narrateur', icon: 'menu_book', color: '#3e5977' },
  { id: 'protagonist', label: 'Protagoniste', icon: 'person', color: '#6e3e77' },
  { id: 'coloriage', label: 'Coloriage', icon: 'palette', color: '#3e774f' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const getCoverUrl = (chapter: any): string | null => {
  if (chapter?.coverAsset?.url) {
    return `${API_BASE_URL}${chapter.coverAsset.url}`;
  }
  return null;
};

const ChapterDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { selectedChapter, chapters, setSelectedChapter } = useChapterStore();
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective>('narrateur');
  const [chapterData, setChapterData] = useState<any>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use store chapter if available, otherwise fetched data
  const chapter = chapterData
    || (selectedChapter?.id === id ? selectedChapter : null)
    || chapters.find((c) => c.id === id)
    || null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await chaptersAPI.getChapter(id as string);
        setChapterData(data);
        setVolumes(data.volumes || []);
        // Also update the store so other screens benefit
        setSelectedChapter(data as any);
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSelectVolume = (volume: Volume) => {
    const persp = selectedPerspective === 'protagonist' ? 'PROTAGONIST' : 'NARRATOR';
    router.push(`/reader/${volume.id}?perspective=${persp}`);
  };

  // Get perspective label with protagonist name
  const getPerspectiveLabel = (p: typeof PERSPECTIVES[0]) => {
    if (p.id === 'protagonist' && chapter?.protagonistName) {
      return `Version ${chapter.protagonistName}`;
    }
    return p.label;
  };

  if (loading && volumes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.rose} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const coverUrl = chapter ? getCoverUrl(chapter) : null;

  return (
    <ScrollView style={styles.container}>
      {/* Hero Header */}
      {chapter && (
        <View style={styles.hero}>
          {/* Cover Image - Full width */}
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.heroCover} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          ) : (
            <View style={[styles.heroCover, styles.heroCoverPlaceholder]}>
              <Text style={styles.heroCoverFallback}>{chapter.title.charAt(0)}</Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Icon name="arrow_back" size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Chapter info overlay */}
          <View style={styles.heroContent}>
            <Text style={styles.heroProtagonist}>{chapter.protagonistName}</Text>
            <Text style={styles.heroTitle}>{chapter.title}</Text>

            {/* Emotional Levels */}
            <View style={styles.heroLevels}>
              <EmotionalLevels
                intensite={chapter.niveau_intensite}
                douceur={chapter.niveau_douceur}
                danger={chapter.niveau_danger}
                transformation={chapter.niveau_transformation}
              />
            </View>
          </View>
        </View>
      )}

      {/* Description */}
      {chapter?.accroche_classic && (
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{chapter.accroche_classic}</Text>
        </View>
      )}

      {/* Accroche */}
      {chapter?.accroche_love && (
        <View style={styles.accrocheSection}>
          <Text style={styles.accrocheText}>"{chapter.accroche_love}"</Text>
        </View>
      )}

      {/* Genre Badges */}
      {chapter?.genres && chapter.genres.length > 0 && (
        <View style={styles.genresSection}>
          {chapter.genres.map((g, idx) => (
            <GenreBadge key={idx} genre={g.genre} />
          ))}
        </View>
      )}

      {/* Separator */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Icon name="auto_stories" size={20} color={colors.gold} />
        <View style={styles.separatorLine} />
      </View>

      {/* Perspective Selector */}
      <View style={styles.perspectiveSection}>
        {PERSPECTIVES.map((p) => {
          const isActive = selectedPerspective === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.perspectiveTab,
                { borderColor: isActive ? p.color : colors.gray[200] },
                isActive && { backgroundColor: p.color },
              ]}
              onPress={() => setSelectedPerspective(p.id)}
              activeOpacity={0.7}
            >
              <Icon name={p.icon} size={18} color={isActive ? colors.white : colors.gray[500]} />
              <Text
                style={[
                  styles.perspectiveLabel,
                  isActive && { color: colors.white },
                ]}
                numberOfLines={1}
              >
                {getPerspectiveLabel(p)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Coloring Gallery or Volumes */}
      {selectedPerspective === 'coloriage' ? (
        <ColoringGallery
          chapterId={id as string}
          protagonistName={chapter?.protagonistName}
        />
      ) : (
        <>
          {/* Volumes List */}
          <View style={styles.volumesSection}>
            <Text style={styles.volumesTitle}>
              {selectedPerspective === 'protagonist'
                ? `Version ${chapter?.protagonistName || 'Protagoniste'}`
                : 'Version Narrateur'}
            </Text>
            <Text style={styles.volumesCount}>
              {volumes.length} volume{volumes.length !== 1 ? 's' : ''}
            </Text>

            {(() => {
              // Same logic as web ChapterTableOfContents_V3:
              // Show accessible volumes + first locked one, per perspective
              const perspectiveKey = selectedPerspective === 'protagonist' ? 'PROTAGONIST' : 'NARRATOR';
              const firstLockedIdx = volumes.findIndex((v: any) => {
                const perspectiveAccess = v.accessByPerspective?.[perspectiveKey];
                const isAccessible = perspectiveAccess?.isAccessible || false;
                return !isAccessible;
              });
              const displayed = firstLockedIdx === -1
                ? volumes
                : volumes.slice(0, firstLockedIdx + 1);
              return displayed.map((volume) => (
                <VolumeBook
                  key={volume.id}
                  volume={volume}
                  perspective={selectedPerspective === 'protagonist' ? 'protagonist' : 'narrateur'}
                  onPress={() => handleSelectVolume(volume)}
                />
              ));
            })()}
          </View>
        </>
      )}

      <View style={{ height: spacing['4xl'] }} />
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
    height: 360,
    position: 'relative',
  },
  heroCover: {
    width: SCREEN_WIDTH,
    height: 360,
  },
  heroCoverPlaceholder: {
    backgroundColor: colors.boudoir[950],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCoverFallback: {
    fontSize: 80,
    color: colors.gold,
    opacity: 0.3,
    fontFamily: 'GreatVibes_400Regular',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 15, 10, 0.55)',
  },
  backButton: {
    position: 'absolute',
    top: spacing['3xl'],
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: 36,
    color: colors.goldLight,
    marginBottom: -4,
  },
  heroTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize['3xl'],
    color: colors.white,
    marginBottom: spacing.md,
  },
  heroLevels: {
    opacity: 0.9,
  },

  // Description
  descriptionSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  descriptionText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.gray[600],
    lineHeight: 24,
  },

  // Accroche
  accrocheSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  accrocheText: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize.lg,
    // fontStyle: 'italic',
    color: colors.charcoal,
    lineHeight: 26,
  },

  // Genres
  genresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Separator
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  separatorLine: {
    width: 48,
    height: 1,
    backgroundColor: colors.goldLight,
  },

  // Error
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },

  // Volumes
  volumesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  volumesTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['2xl'],
    color: colors.charcoal,
  },
  volumesCount: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.xl,
  },
  volumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  volumeLeft: {
    alignItems: 'center',
    width: 44,
  },
  volumeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.boudoir[900],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  volumeNumberFree: {
    backgroundColor: colors.boudoir[950],
    borderColor: colors.gold,
  },
  volumeNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.goldLight,
  },
  volumeConnector: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray[200],
    marginTop: 4,
  },
  volumeContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  volumeTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.charcoal,
  },
  freeBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  freeBadgeText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
  },
  volumeStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  volumeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  volumeStatText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    fontWeight: '500',
  },

  // Perspective Selector
  perspectiveSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  perspectiveTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
  },
  perspectiveLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.gray[500],
  },

});

export default ChapterDetailScreen;
