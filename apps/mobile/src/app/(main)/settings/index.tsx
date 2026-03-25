import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenHeader from '@/components/ScreenHeader';
import Icon from '@/components/Icon';
import { useTheme, useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';

const PREFS_KEY = 'user_preferences';

interface Prefs {
  fontSize: 'small' | 'medium' | 'large';
  autoNextVolume: boolean;
  adultContent: boolean;
}

const DEFAULT_PREFS: Prefs = {
  fontSize: 'medium',
  autoNextVolume: true,
  adultContent: true,
};

const FONT_SIZES: { id: Prefs['fontSize']; label: string; sample: number }[] = [
  { id: 'small', label: 'Petit', sample: 13 },
  { id: 'medium', label: 'Moyen', sample: 16 },
  { id: 'large', label: 'Grand', sample: 20 },
];

export default function SettingsScreen() {
  const { mode, isDark, toggleMode } = useTheme();
  const tc = useThemeColors();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) {
        try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch { /* ignore */ }
      }
    });
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Preferences" subtitle="Personnalisez votre experience" />

      {/* Theme */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.cardRow}>
            <View style={styles.cardHeader}>
              <Icon name={isDark ? 'dark_mode' : 'light_mode'} size={24} color={tc.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: tc.text }]}>Theme</Text>
                <Text style={[styles.cardDesc, { color: tc.textSecondary }]}>
                  {isDark ? 'Mode sombre active' : 'Mode clair active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{ false: colors.gray[300], true: tc.gold }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      {/* Font Size */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Icon name="format_size" size={24} color={tc.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: tc.text }]}>Taille de police</Text>
              <Text style={[styles.cardDesc, { color: tc.textSecondary }]}>Ajustez la taille du texte pour votre confort</Text>
            </View>
          </View>
          <View style={styles.fontSizeGrid}>
            {FONT_SIZES.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[styles.fontSizeBtn, { borderColor: tc.cardBorder }, prefs.fontSize === size.id && styles.fontSizeBtnActive]}
                onPress={() => update({ fontSize: size.id })}
                activeOpacity={0.7}
              >
                <Text style={[styles.fontSizeSample, { fontSize: size.sample, color: tc.text }]}>Aa</Text>
                <Text style={[styles.fontSizeLabel, { color: tc.textSecondary }, prefs.fontSize === size.id && { color: tc.gold }]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Auto next volume */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.cardRow}>
            <View style={styles.cardHeader}>
              <Icon name="play_circle" size={24} color={tc.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: tc.text }]}>Lecture automatique</Text>
                <Text style={[styles.cardDesc, { color: tc.textSecondary }]}>Passer au volume suivant automatiquement</Text>
              </View>
            </View>
            <Switch
              value={prefs.autoNextVolume}
              onValueChange={(v) => update({ autoNextVolume: v })}
              trackColor={{ false: colors.gray[300], true: tc.gold }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      {/* Adult content */}
      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <View style={styles.cardRow}>
            <View style={styles.cardHeader}>
              <Icon name="shield" size={24} color={tc.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: tc.text }]}>Contenu pour adultes</Text>
                <Text style={[styles.cardDesc, { color: tc.textSecondary }]}>Afficher le contenu reserve aux adultes</Text>
              </View>
            </View>
            <Switch
              value={prefs.adultContent}
              onValueChange={(v) => update({ adultContent: v })}
              trackColor={{ false: colors.gray[300], true: tc.gold }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Icon name="info" size={18} color={tc.textTertiary} />
          <Text style={[styles.infoText, { color: tc.textTertiary }]}>
            Les preferences sont sauvegardees automatiquement sur cet appareil.
          </Text>
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.xl,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: colors.charcoal,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },

  // Font size
  fontSizeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  fontSizeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  fontSizeBtnActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  fontSizeSample: {
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  fontSizeLabel: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  fontSizeLabelActive: {
    color: colors.gold,
    fontWeight: '600',
  },

  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoText: {
    fontSize: fs.xs,
    color: colors.gray[400],
    fontStyle: 'italic',
    flex: 1,
  },
});
