import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize } from '@/utils/theme';

interface EmotionalLevelsProps {
  intensite: number;
  douceur: number;
  danger: number;
  transformation: number;
}

const levels = [
  { key: 'intensite', icon: 'local_fire_department', label: 'Intensite' },
  { key: 'douceur', icon: 'favorite', label: 'Douceur' },
  { key: 'danger', icon: 'warning', label: 'Danger' },
  { key: 'transformation', icon: 'auto_fix_high', label: 'Transformation' },
] as const;

const EmotionalLevels: React.FC<EmotionalLevelsProps> = ({
  intensite,
  douceur,
  danger,
  transformation,
}) => {
  const tc = useThemeColors();
  const values: Record<string, number> = { intensite, douceur, danger, transformation };

  return (
    <View style={styles.container}>
      {levels.map(({ key, icon, label }) => (
        <View key={key} style={styles.item} accessibilityLabel={`${label}: ${values[key]}/5`}>
          <Icon name={icon} size={16} color={tc.gold} />
          <Text style={[styles.value, { color: tc.textSecondary }]}>{values[key]}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  value: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.gray[600],
  },
});

export default EmotionalLevels;
