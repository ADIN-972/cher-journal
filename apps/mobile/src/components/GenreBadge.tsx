import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';

const GENRE_ICONS: Record<string, string> = {
  ROMANCES_TENDRES: 'favorite',
  INTERDITS: 'lock',
  LIBERATION: 'flight_takeoff',
  PASSION_BRUTALE: 'whatshot',
  INTIMITE_PSYCHOLOGIQUE: 'psychology',
  MEMOIRE_DU_CORPS: 'self_improvement',
  DECOUVERTE_DE_SOI: 'lightbulb',
  RELATIONS_TRANSFORMATRICES: 'auto_fix_high',
  PASSIONS_CHARNELLES: 'local_fire_department',
  MYSTERIES_SENSUELS: 'nightlife',
  DESIR_NOCTURNE: 'dark_mode',
  AMOUR_COMPLIQUE: 'favorite_border',
  CONQUETES: 'trending_up',
  REVES_SECRETS: 'cloud',
};

const GENRE_LABELS: Record<string, string> = {
  ROMANCES_TENDRES: 'Romances Tendres',
  INTERDITS: 'Interdits',
  LIBERATION: 'Liberation',
  PASSION_BRUTALE: 'Passion Brute',
  INTIMITE_PSYCHOLOGIQUE: 'Intimite Psychologique',
  MEMOIRE_DU_CORPS: 'Memoire du Corps',
  DECOUVERTE_DE_SOI: 'Decouverte de Soi',
  RELATIONS_TRANSFORMATRICES: 'Relations Transformatrices',
  PASSIONS_CHARNELLES: 'Passions Charnelles',
  MYSTERIES_SENSUELS: 'Mysteres Sensuels',
  DESIR_NOCTURNE: 'Desir Nocturne',
  AMOUR_COMPLIQUE: 'Amour Complique',
  CONQUETES: 'Conquetes',
  REVES_SECRETS: 'Reves Secrets',
};

interface GenreBadgeProps {
  genre: string;
}

const GenreBadge: React.FC<GenreBadgeProps> = ({ genre }) => {
  const icon = GENRE_ICONS[genre] || 'label';
  const label = GENRE_LABELS[genre] || genre;

  return (
    <View style={styles.badge}>
      <Icon name={icon} size={12} color={colors.gold} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gold,
  },
});

export default GenreBadge;
