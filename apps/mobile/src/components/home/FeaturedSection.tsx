import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize, borderRadius, colors } from '@/utils/theme';
import type { Chapter } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

interface Props {
  chapter: Chapter;
  onPress: (chapter: Chapter) => void;
}

export default function FeaturedSection({ chapter, onPress }: Props) {
  const tc = useThemeColors();
  const coverUrl = chapter.coverAsset?.url ? `${API_BASE_URL}${chapter.coverAsset.url}` : null;

  return (
    <ImageBackground
      source={{ uri: 'https://api.moncherjournal.com/uploads/assets/images/home_bg.png' }}
      resizeMode="cover"
    >
      <View style={[styles.section]}>
        <Text style={[styles.sectionTitle, { color: colors.white }]}>La selection du moment</Text>
        <TouchableOpacity
          style={[styles.card]}
          onPress={() => onPress(chapter)}
          activeOpacity={0.85}
        >
          <View style={styles.row}>
            {/* Cover left */}
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={styles.cover}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View style={[styles.cover, styles.placeholder]}>
                <Text style={{ fontSize: 32, color: tc.gold, opacity: 0.3 }}>{'<>'}</Text>
              </View>
            )}

            {/* Text right */}
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {chapter.title}
              </Text>
              {/* {chapter.protagonistName && (
              <Text style={styles.protagonist}>{chapter.protagonistName}</Text>
            )} */}
              {chapter.accroche_classic && (
                <Text style={styles.accroche} numberOfLines={3}>
                  {chapter.accroche_marketing ?? chapter.description}
                </Text>
              )}
            </View>
          </View>

          {/* Button below */}
          <View style={styles.buttonRow}>
            <View style={[styles.badge, { backgroundColor: tc.rose }]}>
              <Text style={styles.badgeText}>S'immerger</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    borderTopColor: colors.goldDark,
    borderTopWidth: 1,
    borderBottomColor: colors.goldDark,
    borderBottomWidth: 1,
    experimental_backgroundImage: `           
    linear-gradient(to right,
     rgba(26, 15, 10, 0.95) 0%,
      rgba(26, 15, 10, 0.6) 40%,
       rgba(26, 15, 10, 0.3) 60%,
        rgba(26, 15, 10, 0.6) 100%),`,
  },
  sectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    marginBottom: spacing.md,
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  card: {
    // borderRadius: borderRadius.xl,
    overflow: 'hidden',
    // elevation: 8,
    // shadowColor: colors.rose,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
  },
  row: {
    flexDirection: 'row',
  },
  cover: {
    width: 120,
    height: 170,
    elevation: 8,
    shadowColor: colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  placeholder: {
    //backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['3xl'],
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  protagonist: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.sm,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  accroche: {
    fontSize: fontSize.sm,
    color: colors.boudoir[100],
    fontStyle: 'italic',
    lineHeight: 18,
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  buttonRow: {
    // paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    marginHorizontal: 'auto',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
