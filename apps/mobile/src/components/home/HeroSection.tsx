import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/utils/theme';

export default function HeroSection() {
  const tc = useThemeColors();

  return (
    <View style={[styles.hero, { backgroundColor: tc.background }]}>
      <Text style={[styles.heroTitle, { color: tc.gold }]}>Cher Journal</Text>
      <View style={[styles.heroSeparator, { backgroundColor: tc.gold }]} />
      <Text style={[styles.heroTagline, { color: tc.textSecondary }]}>
        Plongez dans des histoires sensuelles et intimes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['3xl'],
    alignItems: 'center',
   
  },
  heroTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['4xl'],
    letterSpacing: 1,
  },
  heroSeparator: {
    width: 60,
    height: 1,
    marginVertical: spacing.lg,
  },
  heroTagline: {
    fontSize: fontSize.base,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
