import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize, borderRadius, colors } from '@/utils/theme';
import GenreBadge from '@/components/GenreBadge';
import type { Chapter } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';
const BADGES = ['Coup de foudre', 'Mystere', 'Audace'];

interface Props {
  chapters: (Chapter & { score: number })[];
  onSelectChapter: (chapter: Chapter) => void;
}

export default function PassionsSection({ chapters, onSelectChapter }: Props) {
  const tc = useThemeColors();

  if (chapters.length === 0) return null;

  const getCoverUrl = (ch: Chapter) => ch.coverAsset?.url ? `${API_BASE_URL}${ch.coverAsset.url}` : null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: tc.text }]}>Les Passions Charnelles</Text>
      <Text style={[styles.sectionSubTitle, { color: tc.softGold }]}>
        Chaque volume est une invitation a l'abandon. Une exploration sensorielle des limites du
        plaisir.
      </Text>

      {chapters.map((chapter, index) => (
        <TouchableOpacity
          key={chapter.id}
          style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          onPress={() => onSelectChapter(chapter)}
          activeOpacity={0.85}
        >
          <View style={styles.cardInner}>
            {/* Book Cover */}
            <View style={styles.coverWrap}>
              {getCoverUrl(chapter) ? (
                <Image
                  source={{ uri: getCoverUrl(chapter)! }}
                  style={styles.cover}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
              ) : (
                <View style={[styles.cover, { backgroundColor: tc.boudoir800 }]}>
                  <Text style={{ fontSize: fontSize['3xl'], color: tc.gold, opacity: 0.4 }}>
                    {chapter.title.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={styles.protagonistOverlay}>{chapter.protagonistName}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.badge, { color: tc.textSecondary }]}>{BADGES[index] || 'Populaire'}</Text>
              <Text style={[styles.cardTitle, { color: tc.text }]}>{chapter.title}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: tc.textSecondary }]} numberOfLines={3}>
            {chapter.accroche_marketing || chapter.description}
          </Text>

          {/* Genre Badges */}
          {chapter.genres && chapter.genres.length > 0 && (
            <View style={styles.genres}>
              {chapter.genres.map((g, idx) => (
                <GenreBadge key={idx} genre={g.genre} />
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    marginBottom: -2,
  },
  sectionSubTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardInner: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  coverWrap: {
    width: 100,
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cover: {
    width: 100,
    height: 140,
    borderRadius: borderRadius.lg,
  },
  protagonistOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
    color: colors.white,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['3xl'],
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
});
