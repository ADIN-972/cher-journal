import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize, borderRadius, colors } from '@/utils/theme';
import type { Chapter } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * (4 / 3);
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

interface Props {
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
}

export default function RecentChaptersSection({ chapters, onSelectChapter }: Props) {
  const tc = useThemeColors();
  const router = useRouter();

  const getCoverUrl = (ch: Chapter) => ch.coverAsset?.url ? `${API_BASE_URL}${ch.coverAsset.url}` : null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: tc.text }]}>Nos derniers chapitres</Text>
        <TouchableOpacity onPress={() => router.push('/chapters')}>
          <Text style={[styles.seeAllLink, { color: tc.rose }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionSubTitle, { color: tc.softGold, marginTop: -spacing.lg }]}>
        Ecrits a la lumiere de la bougie...
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={[styles.card, { backgroundColor: tc.boudoir900 }]}
            onPress={() => onSelectChapter(chapter)}
            activeOpacity={0.85}
          >
            {getCoverUrl(chapter) ? (
              <Image
                source={{ uri: getCoverUrl(chapter)! }}
                style={[styles.cardImage, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View
                style={[
                  styles.cardImage,
                  styles.cardPlaceholder,
                  { backgroundColor: tc.boudoir800 },
                ]}
              >
                <Text
                  style={{
                    fontSize: fontSize['4xl'],
                    fontWeight: '300',
                    color: tc.gold,
                    opacity: 0.4,
                  }}
                >
                  {chapter.title.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardProtagonist} numberOfLines={1}>
                {chapter.protagonistName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    marginBottom: -2,
  },
  sectionSubTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
    marginBottom: spacing.xl,
  },
  seeAllLink: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.lg,
  },
  row: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
  },
  cardPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: borderRadius.xl,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  cardProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['4xl'],
    color: colors.white,
  },
});
