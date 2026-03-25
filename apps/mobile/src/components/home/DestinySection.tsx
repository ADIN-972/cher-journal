import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize, borderRadius } from '@/utils/theme';
import Icon from '@/components/Icon';

export default function DestinySection() {
  const tc = useThemeColors();
  const router = useRouter();

  const items = [
    "Le nom et l'apparence de votre protagoniste",
    'Sa personnalite, ses desirs et ses secrets',
    "L'intensite emotionnelle de son univers",
    'Les lieux et evenements cles des 10 volumes',
    'Comment vous imaginez la fin',
  ];

  return (
    <View style={[styles.container, {}]}>
      {/* Corner decorations */}
      <View
        style={[
          styles.corner,
          { borderColor: tc.gold },
          { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { borderColor: tc.gold },
          { bottom: 3, right: 12, borderBottomWidth: 2, borderRightWidth: 2 },
        ]}
      />

      <Text style={[styles.heading, { color: tc.text }]}>
        Creez votre <Text style={{ color: tc.gold }}>destin</Text>
      </Text>
      <Text style={[styles.subTitle, { color: tc.softGold }]}>
        Chaque secret merite d'etre ecrit...
      </Text>

      <Text style={[styles.quote, { color: tc.textSecondary }]}>
        "Entre ces pages, le temps s'arrete. Plongez dans l'intimite de vos pensees et laissez la
        magie de vos mots dessiner l'invisible."
      </Text>

      <Text style={[styles.text, { color: tc.textSecondary }]}>
        L'auteur recherche sa nouvelle muse. Un portrait, une confidence, un frisson... pretez votre
        essence pour incarner l'heroine du prochain roman.
      </Text>

      <Text style={[styles.text, { color: tc.textSecondary }]}>
        Proposez-nous les elements de votre histoire personnalisee :
      </Text>

      {items.map((item, idx) => (
        <View key={idx} style={styles.listItem}>
          <Icon name="star" size={16} color={tc.softGold} />
          <Text style={[styles.listText, { color: tc.textSecondary }]}>{item}</Text>
        </View>
      ))}

      <Text style={[styles.small, { color: tc.textTertiary }]}>
        Les histoires approuvees seront creees gratuitement. Vous aurez acces a votre histoire en
        bundle special et en edition imprimee.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: tc.gold }]}
        onPress={() => router.push('/account/create-story')}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Commencer l'aventure</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  heading: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  quote: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  listText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  small: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
