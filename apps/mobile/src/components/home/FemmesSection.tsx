import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme/ThemeContext';
import { spacing, fontSize } from '@/utils/theme';

export default function FemmesSection() {
  const tc = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: tc.surface, borderColor: tc.separator }]}>
      <Text style={[styles.title, { color: tc.gold }]}>Les Femmes de Cher Journal...</Text>

      <Text style={[styles.quote, { color: tc.textSecondary }]}>
        "Une collection de recits intimes et sensoriels."
      </Text>

      <Text style={[styles.text, { color: tc.text }]} >
        Cher Journal est une serie de recits ecrits a la premiere personne, ou chaque femme incarne
        une rencontre singuliere, un territoire emotionnel et charnel, un moment de bascule.
      </Text>

      <Text style={[styles.text, { color: tc.text }]}>
        Ces histoires ne racontent pas des conquetes, elles racontent des liens.
      </Text>

      <Text style={[styles.text, { color: tc.text }]}>
        Chaque protagoniste donne naissance a un cycle de volumes, des instants suspendus, vecus
        dans des lieux precis, charges de tension, de desir, de silences et de choix.
      </Text>

      <Text style={[styles.text, { color: tc.text }]}>
        Certaines histoires s'eteignent doucement... D'autres transforment a jamais.{'\n'}
        Ici, l'erotisme n'est jamais gratuit. Il est sensoriel, introspectif, guide par l'ecoute et
        la presence.
      </Text>

      <Text style={[styles.quote, { color: tc.textSecondary }]}>
        "Une galerie de femmes, libres et complexes."
      </Text>

      <Text style={[styles.text, { color: tc.text }]}>
        Les femmes de Cher Journal ne sont ni idealisees, ni soumises a un archetype unique. Elles
        sont multiples, parfois contradictoires, toujours incarnees.{'\n\n'}
        Certaines cherchent la douceur, d'autres explorent la domination, l'abandon, la
        reappropriation du corps. Toutes refusent d'etre reduites a un role.{'\n\n'}
        Chaque recit est raconte dans un journal intime, ou le narrateur, homme attentif, dominant
        mais profondement a l'ecoute, accompagne sans jamais effacer, guide sans jamais posseder.
      </Text>

      <View style={styles.attribution}>
        <View style={[styles.attrLine, { backgroundColor: tc.gold }]} />
        <Text style={[styles.attrName, { color: tc.gold }]}>Fifann</Text>
        <View style={[styles.attrLine, { backgroundColor: tc.gold }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  quote: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  attrLine: {
    width: 40,
    height: 1,
  },
  attrName: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize['2xl'],
  },
});
