import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/utils/theme';

export default function QuoteSection() {
  const tc = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: tc.surface, borderColor: tc.separator }]}>
      <Text style={[styles.handwriting, { color: tc.gold }]}>Cher Journal...</Text>
      <Text style={[styles.quote, { color: tc.textSecondary }]}>
        "La passion n'est pas une emotion qui se vit, c'est une atmosphere qui se respire, un
        parfum qui s'impregne sur la peau et dans l'ame."
      </Text>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: tc.separator }]} />
        <Text style={[styles.label, { color: tc.textTertiary }]}>Secrets de Boudoir</Text>
        <View style={[styles.line, { backgroundColor: tc.separator }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  handwriting: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['4xl'],
    marginBottom: spacing.md,
  },
  quote: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});
