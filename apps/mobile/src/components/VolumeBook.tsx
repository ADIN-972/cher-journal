import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';

// Roman numeral conversion
const toRoman = (num: number): string => {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  for (const [value, numeral] of map) {
    while (num >= value) { result += numeral; num -= value; }
  }
  return result;
};

// Stable pseudo-random offset from volume id (same as web getStableMargin)
const getStableMargin = (id: string): number => {
  let hash = 0;
  // for (let i = 0; i < id.length; i++) {
  //   const char = id.charCodeAt(i);
  //   hash = (hash << 5) - hash + char;
  //   hash = hash & hash;
  // }
  return Math.floor((Math.abs(hash) % 1000) / 1000 * 21) - 10; // -10 to 10px (same as web)
};

// Colors matching web: bg-[#27365e] for NARRATOR, bg-[#533470] for PROTAGONIST, bg-gray-800 for locked
const NARRATOR_COLOR = '#27365e';
const PROTAGONIST_COLOR = '#533470';
const LOCKED_COLOR = '#1f2937'; // gray-800

interface VolumeBookProps {
  volume: any;
  index?: number;
  perspective: 'narrateur' | 'protagonist';
  onPress: () => void;
}

const VolumeBook: React.FC<VolumeBookProps> = ({ volume, perspective, onPress }) => {
  // Use accessByPerspective (same rules as web)
  const perspectiveKey = perspective === 'protagonist' ? 'PROTAGONIST' : 'NARRATOR';
  const perspectiveAccess = volume.accessByPerspective?.[perspectiveKey];
  const isAccessible = perspectiveAccess?.isAccessible || false;
  const blockageType = perspectiveAccess?.blockageType || null;
  const hasActiveWait = perspectiveAccess?.blockageInfo?.waitRemaining > 0;
  const progression = volume.progressByPerspective?.[perspectiveKey] ?? 0;

  const bgColor = !isAccessible
    ? LOCKED_COLOR
    : perspective === 'protagonist'
      ? PROTAGONIST_COLOR
      : NARRATOR_COLOR;
  const offset = getStableMargin(volume.id);

  // Right-side status indicator
  const renderStatus = () => {
    if (isAccessible) {
      if (progression >= 100) {
        return <Icon name="check_circle" size={16} color={colors.goldLight} />;
      }
      if (progression > 0) {
        return <Text style={styles.progressText}>{progression}%</Text>;
      }
      return <Icon name="auto_stories" size={16} color={colors.goldLight} />;
    }
    if (hasActiveWait) {
      return <Icon name="hourglass_top" size={16} color="rgba(255,255,255,0.5)" />;
    }
    if (blockageType === 'PAYWALL' || blockageType === 'EPILOGUE') {
      return <Icon name="shopping_cart" size={14} color="rgba(255,255,255,0.5)" />;
    }
    return <Icon name="lock" size={16} color="rgba(255,255,255,0.5)" />;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.book,
        {
          backgroundColor: bgColor,
          marginLeft: offset,
        },
      ]}
    >
      {/* Shadow underneath */}
      <View style={styles.bookShadow} />

      {/* Book spine content */}
      <View style={styles.spineContent}>
        {/* Roman numeral */}
        <View style={styles.romanSection}>
          <Text style={styles.romanText}>{toRoman(volume.volumeNumber)}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText} numberOfLines={1}>
            {volume.title || `Volume ${volume.volumeNumber}`}
          </Text>
          {/* Progress bar for accessible volumes */}
          {isAccessible && progression > 0 && progression < 100 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progression}%` }]} />
            </View>
          )}
        </View>

        {/* Right status */}
        <View style={styles.iconSection}>
          {renderStatus()}
        </View>
      </View>

      {/* Top edge highlight */}
      <View style={styles.topEdge} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  book: {
    height: 52,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
    // 3D-ish shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bookShadow: {
    position: 'absolute',
    bottom: -4,
    left: 4,
    right: 4,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 4,
  },
  spineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  romanSection: {
    width: 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(212, 175, 55, 0.4)',
  },
  romanText: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize.lg,
    color: colors.gold,
  },
  spineDivider: {
    width: 2,
    height: '60%',
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  titleSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(212, 175, 55, 0.4)',
    height: '100%',
    marginLeft:2,
  },
  titleText: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize.base,
    color: '#F5E6E0',
    letterSpacing: 0.5,
  },
  iconSection: {
    paddingRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeText: {
    fontSize: 9,
    color: colors.goldLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  progressText: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: '700',
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
});

export default VolumeBook;
