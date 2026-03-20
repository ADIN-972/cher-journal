import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';

const FEATURES = [
  { icon: 'auto_stories', text: 'Tous les chapitres Narrateur en acces immediat' },
  { icon: 'timer_off', text: "Plus de timer d'attente" },
  { icon: 'loyalty', text: '-30% sur la perspective Protagoniste' },
  { icon: 'new_releases', text: 'Nouveautes en avant-premiere' },
  { icon: 'palette', text: 'Galerie de coloriage exclusive' },
  { icon: 'download', text: 'Telechargement pour lecture hors-ligne' },
  { icon: 'block', text: 'Sans publicite' },
];

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/account')}
          style={{ marginBottom: spacing.sm }}
        >
          <Icon name="arrow_back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Abonnement</Text>
        <Text style={styles.headerSubtitle}>Gerez votre abonnement et vos avantages.</Text>
      </View>

      {/* Current status - no subscription */}
      <View style={styles.statusCard}>
        <Icon name="card_membership" size={40} color={`${colors.gold}40`} />
        <Text style={styles.statusText}>Vous n'avez pas d'abonnement actif</Text>
      </View>

      {/* Club Prive teaser */}
      <View style={styles.clubCard}>
        <View style={styles.clubGlow} />

        <View style={styles.clubHeader}>
          <Icon name="workspace_premium" size={32} color="#A855F7" />
          <View style={styles.clubBadge}>
            <Text style={styles.clubBadgeText}>Bientot</Text>
          </View>
        </View>

        <Text style={styles.clubTitle}>Le Club Prive</Text>
        <Text style={styles.clubSubtitle}>
          Acces illimite a tous les chapitres en perspective Narrateur. Acces immediat, sans
          attente. -30% sur la perspective Protagoniste.
        </Text>

        {/* Features */}
        <View style={styles.featuresList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Icon name="check_circle" size={18} color="#A855F7" />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Price teaser */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>A partir de</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>9,99</Text>
            <Text style={styles.priceCurrency}>EUR/mois</Text>
          </View>
          <Text style={styles.priceNote}>Sans engagement, resiliable a tout moment</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} disabled>
          <Icon name="notifications_active" size={20} color={colors.white} />
          <Text style={styles.ctaText}>Me prevenir du lancement</Text>
        </TouchableOpacity>

        <Text style={styles.comingSoonNote}>En preparation - Lancement prevu prochainement</Text>
      </View>

      {/* What you get section */}
      <View style={styles.comparisonSection}>
        <Text style={styles.comparisonTitle}>Gratuit vs Club Prive</Text>

        <View style={styles.comparisonCard}>
          {[
            { label: 'Chapitres gratuits', free: true, club: true, clubText: null },
            { label: 'Acces immediat (sans timer)', free: false, club: true, clubText: null },
            { label: 'Chapitres premium', free: false, club: true, clubText: null },
            { label: 'Vue Protagoniste', free: false, club: false, clubText: '-30%' },
            { label: 'Avant-premieres', free: false, club: true, clubText: null },
            { label: 'Coloriages', free: false, club: true, clubText: null },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonFeature}>{row.label}</Text>
                <View style={styles.comparisonCol}>
                  <Icon
                    name={row.free ? 'check' : 'close'}
                    size={18}
                    color={row.free ? '#16A34A' : colors.gray[400]}
                  />
                </View>
                <View style={styles.comparisonCol}>
                  {row.clubText ? (
                    <Text style={styles.comparisonDiscount}>{row.clubText}</Text>
                  ) : (
                    <Icon
                      name={row.club ? 'check' : 'close'}
                      size={18}
                      color={row.club ? '#A855F7' : colors.gray[400]}
                    />
                  )}
                </View>
              </View>
              {i < arr.length - 1 && <View style={styles.comparisonDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.comparisonLabels}>
          <Text style={styles.comparisonLabelLeft} />
          <Text style={styles.comparisonLabelFree}>Gratuit</Text>
          <Text style={styles.comparisonLabelClub}>Club</Text>
        </View>
      </View>

      <View style={{ height: 80}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['3xl'],
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },

  // Status card
  statusCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing['2xl'],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    gap: spacing.md,
  },
  statusText: {
    fontSize: fs.sm,
    color: colors.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Club card
  clubCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: '#1A0A14',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  clubGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  clubBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  clubBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clubTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['3xl'],
    color: colors.white,
    marginBottom: spacing.sm,
  },
  clubSubtitle: {
    fontSize: fs.sm,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },

  // Features
  featuresList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: fs.sm,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },

  // Price
  priceSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(168,85,247,0.2)',
  },
  priceLabel: {
    fontSize: fs.xs,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
  },
  priceCurrency: {
    fontSize: fs.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  priceNote: {
    fontSize: fs.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: spacing.sm,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#7C3AED',
    opacity: 0.6,
  },
  ctaText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
  },
  comingSoonNote: {
    fontSize: fs.xs,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.md,
  },

  // Comparison
  comparisonSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
  },
  comparisonTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  comparisonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  comparisonFeature: {
    width: '60%',
    fontSize: fs.sm,
    color: colors.charcoal,
  },
  comparisonCol: {
    width: '20%',
    alignItems: 'center' as const,
  },
  comparisonDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
  },
  comparisonLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  comparisonLabelLeft: {
    width: '60%',
  },
  comparisonLabelFree: {
    width: '20%',
    fontSize: fs.xs,
    color: colors.gray[500],
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonLabelClub: {
    width: '20%',
    fontSize: fs.xs,
    color: '#A855F7',
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonDiscount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A855F7',
  },
});
