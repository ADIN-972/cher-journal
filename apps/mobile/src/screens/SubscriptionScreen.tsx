import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import api from '@/services/api/client';
import Icon from '@/components/Icon';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

interface SubscriptionData {
  id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE';
  planName: string;
  priceAmountCents: number;
  currency: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const getFeatures = (discountPercent: number) => [
  { icon: 'auto_stories', text: 'Tous les chapitres Narrateur en acces immediat' },
  { icon: 'timer_off', text: "Plus de timer d'attente" },
  { icon: 'loyalty', text: `-${discountPercent}% sur la perspective Protagoniste` },
  { icon: 'new_releases', text: 'Nouveautes en avant-premiere' },
  { icon: 'palette', text: 'Galerie de coloriage exclusive' },
  { icon: 'download', text: 'Telechargement pour lecture hors-ligne' },
  { icon: 'block', text: 'Sans publicite' },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  PAST_DUE: 'En retard',
  CANCELLED: 'Resilie',
  TRIALING: 'Essai gratuit',
  INCOMPLETE: 'Incomplet',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#16A34A',
  PAST_DUE: '#CA8A04',
  CANCELLED: '#DC2626',
  TRIALING: '#2563EB',
  INCOMPLETE: '#6B7280',
};

export default function SubscriptionScreen() {
  const tc = useThemeColors();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [clubInfo, setClubInfo] = useState<{ priceCents: number; discountPercent: number } | null>(
    null
  );

  useEffect(() => {
    api
      .get('/club-info')
      .then((res) => setClubInfo(res.data?.data ?? null))
      .catch(() => {});
  }, []);

  const discountPercent = clubInfo?.discountPercent ?? 0;
  const features = getFeatures(discountPercent);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/me/subscription');
      setSubscription(res.data?.data ?? null);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const successUrl = `${API_BASE_URL.replace('/api', '')}/subscription-success`;
      const cancelUrl = `${API_BASE_URL.replace('/api', '')}/subscription-cancel`;
      const res = await api.post('/stripe/create-subscription-checkout', {
        successUrl,
        cancelUrl,
      });
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de creer la session de paiement.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Resilier l'abonnement",
      "Etes-vous sur ? Vous garderez l'acces jusqu'a la fin de la periode facturee.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Resilier',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              const res = await api.post('/me/subscription/cancel');
              setSubscription(res.data?.data ?? null);
            } catch {
              Alert.alert('Erreur', 'Impossible de resilier votre abonnement.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} EUR`;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Mon Abonnement" subtitle="Gerez votre abonnement et vos avantages." />

      {subscription ? (
        /* Active subscription */
        <View style={[styles.activeCard, { backgroundColor: tc.card }]}>
          <View style={styles.activeHeader}>
            <View>
              <View style={styles.activeTitleRow}>
                <Icon name="workspace_premium" size={28} color="#A855F7" />
                <Text style={[styles.activePlanName, { color: tc.text }]}>Plan {subscription.planName}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${STATUS_COLORS[subscription.status] || '#6B7280'}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: STATUS_COLORS[subscription.status] || '#6B7280' },
                  ]}
                >
                  {STATUS_LABELS[subscription.status] || 'Inconnu'}
                </Text>
              </View>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.activePriceAmount}>
                {formatPrice(subscription.priceAmountCents)}
              </Text>
              <Text style={[styles.activePricePeriod, { color: tc.textSecondary }]}>par mois</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresList}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Icon name="check_circle" size={18} color="#16A34A" />
                <Text style={[styles.activeFeatureText, { color: tc.text }]}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Billing info */}
          <View style={[styles.billingRow, { borderTopColor: tc.cardBorder }]}>
            <Icon name="calendar_today" size={16} color={tc.textSecondary} />
            <Text style={[styles.billingText, { color: tc.textSecondary }]}>
              Prochain renouvellement le{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {subscription.cancelAtPeriodEnd && (
            <View style={styles.cancelNotice}>
              <Text style={styles.cancelNoticeText}>
                Votre abonnement sera resilie a la fin de la periode facturee.
              </Text>
            </View>
          )}

          {/* Cancel button */}
          {!subscription.cancelAtPeriodEnd && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isCancelling}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>
                {isCancelling ? 'Resiliation en cours...' : "Resilier l'abonnement"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* No subscription - show Club Prive teaser */
        <>
          <View style={[styles.statusCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
            <Icon name="card_membership" size={40} color={`${tc.gold}40`} />
            <Text style={[styles.statusText, { color: tc.textSecondary }]}>Vous n'avez pas d'abonnement actif</Text>
          </View>

          <View style={styles.clubCard}>
            <View style={styles.clubGlow} />

            <View style={styles.clubHeader}>
              <Icon name="workspace_premium" size={32} color="#A855F7" />
              <Text style={styles.clubTitle}>Le Club Prive</Text>
            </View>

            <Text style={styles.clubSubtitle}>
              Acces illimite a tous les chapitres en perspective Narrateur. Acces immediat, sans
              attente. -{discountPercent}% sur la perspective Protagoniste.
            </Text>

            {/* Features */}
            <View style={styles.featuresList}>
              {features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Icon name="check_circle" size={18} color="#A855F7" />
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            {/* Price */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>A partir de</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>
                  {clubInfo ? (clubInfo.priceCents / 100).toFixed(2).replace('.', ',') : '9,99'}
                </Text>
                <Text style={styles.priceCurrency}>EUR/mois</Text>
              </View>
              <Text style={styles.priceNote}>Sans engagement, resiliable a tout moment</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaButton, isSubscribing && { opacity: 0.6 }]}
              activeOpacity={0.8}
              onPress={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="workspace_premium" size={20} color={colors.white} />
              )}
              <Text style={styles.ctaText}>
                {isSubscribing ? 'Redirection...' : "S'abonner maintenant"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Comparison table */}
      <View style={styles.comparisonSection}>
        <Text style={[styles.comparisonTitle, { color: tc.text }]}>Gratuit vs Club Prive</Text>

        <View style={[styles.comparisonCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          {[
            { label: 'Chapitres gratuits', free: true, club: true, clubText: null },
            { label: 'Acces immediat (sans timer)', free: false, club: true, clubText: null },
            { label: 'Chapitres premium', free: false, club: true, clubText: null },
            {
              label: 'Vue Protagoniste',
              free: false,
              club: false,
              clubText: `-${discountPercent}%`,
            },
            { label: 'Avant-premieres', free: false, club: true, clubText: null },
            { label: 'Coloriages', free: false, club: true, clubText: null },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={styles.comparisonRow}>
                <Text style={[styles.comparisonFeature, { color: tc.text }]}>{row.label}</Text>
                <View style={styles.comparisonCol}>
                  <Icon
                    name={row.free ? 'check' : 'close'}
                    size={18}
                    color={row.free ? '#16A34A' : tc.textTertiary}
                  />
                </View>
                <View style={styles.comparisonCol}>
                  {row.clubText ? (
                    <Text style={styles.comparisonDiscount}>{row.clubText}</Text>
                  ) : (
                    <Icon
                      name={row.club ? 'check' : 'close'}
                      size={18}
                      color={row.club ? '#A855F7' : tc.textTertiary}
                    />
                  )}
                </View>
              </View>
              {i < arr.length - 1 && <View style={[styles.comparisonDivider, { backgroundColor: tc.separatorLight }]} />}
            </View>
          ))}
        </View>

        <View style={styles.comparisonLabels}>
          <Text style={styles.comparisonLabelLeft} />
          <Text style={[styles.comparisonLabelFree, { color: tc.textSecondary }]}>Gratuit</Text>
          <Text style={styles.comparisonLabelClub}>Club</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['2xl'],
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: fs.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Status card (no subscription)
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

  // Active subscription card
  activeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activePlanName: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['2xl'],
    color: colors.charcoal,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: fs.xs,
    fontWeight: '600',
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  activePriceAmount: {
    fontSize: fs['2xl'],
    fontWeight: '700',
    color: '#A855F7',
  },
  activePricePeriod: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  activeFeatureText: {
    fontSize: fs.sm,
    color: colors.charcoal,
    flex: 1,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  billingText: {
    fontSize: fs.sm,
    color: colors.gray[500],
    flex: 1,
  },
  cancelNotice: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
  },
  cancelNoticeText: {
    fontSize: fs.sm,
    color: '#DC2626',
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.25)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Club card (no subscription)
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
  clubTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['3xl'],
    color: colors.white,
    marginLeft: spacing.sm,
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
  },
  ctaText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
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
