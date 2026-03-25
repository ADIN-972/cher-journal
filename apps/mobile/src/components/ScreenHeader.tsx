import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize as fs } from '@/utils/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  rightAction?: React.JSX.Element | null;
}

export default function ScreenHeader({ title, subtitle, backTo = '/account', rightAction }: ScreenHeaderProps) {
  const router = useRouter();
  const tc = useThemeColors();

  return (
    <View style={[styles.header, { backgroundColor: tc.headerBg, borderBottomColor: tc.separator }]}>
      <TouchableOpacity
        onPress={() => router.replace(backTo as any)}
        style={[styles.backButton, { backgroundColor: tc.surfaceSecondary }]}
      >
        <Icon name="arrow_back" size={22} color={tc.text} />
      </TouchableOpacity>
      <View style={styles.headerTextBlock}>
        <Text style={[styles.headerTitle, { color: tc.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.headerSubtitle, { color: tc.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['2xl'],
  },
  headerSubtitle: {
    fontSize: fs.xs,
    marginTop: 2,
  },
});
