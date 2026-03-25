import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@/components/Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';

export interface BookCardProps {
  id: string;
  title: string;
  protagonistName: string;
  coverUrl: string | null;
  globalProgress: number;
  narratorProgress: number;
  protagonistProgress: number;
  narratorLastVolume: number;
  protagonistLastVolume: number;
  readVolumes: number;
  totalVolumes: number;
  lastReadPerspective: string;
  onPress: () => void;
}

const BookCard: React.FC<BookCardProps> = ({
  title,
  protagonistName,
  coverUrl,
  narratorProgress,
  protagonistProgress,
  narratorLastVolume,
  protagonistLastVolume,
  totalVolumes,
  onPress,
}) => {
  const tc = useThemeColors();
  return (
    <TouchableOpacity style={[styles.bookCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]} onPress={onPress} activeOpacity={0.7}>
      {/* Cover */}
      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.bookCover}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : (
        <View style={[styles.bookCover, styles.bookCoverPlaceholder, { backgroundColor: tc.boudoir800 }]}>
          <Text style={[styles.bookCoverFallback, { color: tc.gold }]}>{title.charAt(0)}</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.bookInfo}>
        <Text style={[styles.bookProtagonist, { color: tc.gold }]}>{protagonistName}</Text>
        <Text style={[styles.bookTitle, { color: tc.text }]} numberOfLines={1}>
          {title}
        </Text>

        {/* Narrator progress */}
        <View style={styles.progressSection}>
          <Icon name="menu_book" size={14} color={tc.gold} />
          <View style={[styles.progressBarBg, { backgroundColor: tc.cardBorder }]}>
            <View
              style={[styles.progressBarFill, { width: `${Math.min(narratorProgress, 100)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{narratorLastVolume}/{totalVolumes}</Text>
        </View>

        {/* Protagonist progress */}
        <View style={styles.progressSection}>
          <Icon name="person" size={14} color={tc.rose} />
          <View style={[styles.progressBarBg, { backgroundColor: tc.cardBorder }]}>
            <View
              style={[styles.progressBarFill, styles.progressBarProtagonist, { width: `${Math.min(protagonistProgress, 100)}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: tc.rose }]}>{protagonistLastVolume}/{totalVolumes}</Text>
        </View>
      </View>

      <Icon name="chevron_right" size={20} color={tc.textTertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookCover: {
    width: 65,
    height: 90,
    borderRadius: borderRadius.md,
  },
  bookCoverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCoverFallback: {
    fontSize: fontSize['2xl'],
    fontWeight: '300',
    color: colors.gold,
    opacity: 0.5,
  },
  bookInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bookProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
    color: colors.gold,
    marginBottom: -4,
  },
  bookTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize.lg,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  progressBarProtagonist: {
    backgroundColor: colors.rose,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold,
    minWidth: 32,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
});

export default BookCard;
