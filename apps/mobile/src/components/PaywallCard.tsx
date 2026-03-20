import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from './Icon';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';

interface PricingInfo {
  chapterId: string;
  chapterTitle: string;
  volumeNumber: number;
  volumeTitle: string;
  // Volume unit price (depends on perspective + blockage type)
  volumePrice: number;
  // Chapter bundle price (narrator = bundleDiscountedPrice, protagonist = computed)
  chapterBundlePrice: number;
  blockageType: string | null;
  perspective: 'NARRATOR' | 'PROTAGONIST';
}

interface PaywallCardProps {
  perspective: 'NARRATOR' | 'PROTAGONIST';
  pricingInfo: PricingInfo | null;
  purchaseLoading?: boolean;
  waitLoading?: boolean;
  activeWaitsCount?: number;
  maxWaitsAllowed?: number;
  hasActiveWaitForVolume?: boolean;
  onPurchaseVolume?: () => void;
  onPurchaseChapter?: () => void;
  onStartWait?: () => void;
}

const formatPrice = (cents: number) => `${(cents / 100).toFixed(2)} €`;

const MAX_WAITS = 2;

const PaywallCard: React.FC<PaywallCardProps> = ({
  perspective,
  pricingInfo,
  purchaseLoading = false,
  waitLoading = false,
  activeWaitsCount = 0,
  maxWaitsAllowed = MAX_WAITS,
  hasActiveWaitForVolume = false,
  onPurchaseVolume,
  onPurchaseChapter,
  onStartWait,
}) => {
  const isProta = perspective === 'PROTAGONIST';
  const accent = isProta ? colors.rose : colors.gold;
  const volNum = pricingInfo?.volumeNumber
    ? String(pricingInfo.volumeNumber).padStart(2, '0')
    : '';

  return (
    <View style={styles.container}>
      {pricingInfo && pricingInfo.volumePrice > 0 ? (
        <>
          {/* --- Attendre pour lire (WAIT_OR_PAY, narrateur only) --- */}
          {pricingInfo.blockageType === 'WAIT_OR_PAY' && !isProta && !hasActiveWaitForVolume && (
            <View style={styles.cardWait}>
              <View style={styles.waitHeader}>
                <View style={styles.waitIconBox}>
                  <Icon name="timer" size={24} color="#059669" />
                </View>
                <View style={styles.waitHeaderText}>
                  <Text style={styles.waitTitle}>Attendre pour lire</Text>
                  <Text style={styles.waitFreeLabel}>100% Gratuit</Text>
                </View>
              </View>

              <Text style={styles.waitDescription}>
                Activez un compte a rebours de 24h et accedez gratuitement a ce volume.
              </Text>

              {activeWaitsCount >= maxWaitsAllowed ? (
                /* Limit reached */
                <View style={styles.waitLimitBanner}>
                  <Icon name="error" size={18} color="#DC2626" />
                  <View style={styles.waitLimitTextWrap}>
                    <Text style={styles.waitLimitTitle}>Limite atteinte</Text>
                    <Text style={styles.waitLimitDesc}>
                      Vous avez {maxWaitsAllowed} comptes a rebours actifs. Veuillez attendre qu'un timer se termine pour en demarrer un nouveau.
                    </Text>
                  </View>
                </View>
              ) : (
                /* Start button */
                <TouchableOpacity
                  style={styles.waitButton}
                  onPress={onStartWait}
                  disabled={waitLoading || !onStartWait}
                  activeOpacity={0.7}
                >
                  {waitLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Icon name="timer" size={18} color={colors.white} />
                      <Text style={styles.waitButtonText}>Demarrer le compte a rebours</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Active timers counter */}
              <View style={styles.waitCounter}>
                <View style={styles.waitCounterLeft}>
                  <Icon name="schedule" size={14} color="#059669" />
                  <Text style={styles.waitCounterLabel}>Timers actifs</Text>
                </View>
                <Text style={styles.waitCounterValue}>{activeWaitsCount} / {maxWaitsAllowed}</Text>
              </View>
            </View>
          )}

          {/* --- Option 1 : Volume Unique --- */}
          <View style={[styles.card, styles.cardVolume]}>
            {/* Background icon */}
            <View style={styles.cardBgIcon}>
              <Icon name="auto_stories" size={48} color={colors.gray[300]} />
            </View>

            <Text style={[styles.optionLabel, { color: accent }]}>
              {isProta ? 'Perspective Intime' : 'Option 1 : Volume Unique'}
            </Text>

            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Text style={styles.cardTitle}>
                  {volNum}. {pricingInfo.volumeTitle || (isProta ? 'Perspective intime' : 'Ce volume')}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {isProta
                    ? 'Debloquer la version protagoniste'
                    : 'Deblocage immediat du recit'}
                </Text>
              </View>
              <Text style={[styles.cardPrice, { color: accent }]}>
                {formatPrice(pricingInfo.volumePrice)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.cardButtonLight}
              onPress={onPurchaseVolume}
              disabled={purchaseLoading}
              activeOpacity={0.7}
            >
              {purchaseLoading ? (
                <ActivityIndicator size="small" color={colors.charcoal} />
              ) : (
                <>
                  <Icon name="shopping_cart" size={18} color={colors.charcoal} />
                  <Text style={styles.cardButtonLightText}>
                    {isProta ? 'Debloquer cette perspective' : 'Acheter ce volume'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* --- Option 2 : Integrale du Chapitre --- */}
          {pricingInfo.chapterBundlePrice > 0 && (
            <View style={[styles.card, styles.cardBundle, { borderColor: `${accent}40` }]}>
              {/* Badge */}
              <View style={[styles.bundleBadge, { backgroundColor: accent }]}>
                <Text style={styles.bundleBadgeText}>Offre Privilege</Text>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.cardRowLeft}>
                  <Text style={styles.cardTitleLarge}>
                    {isProta ? 'Toutes les Perspectives' : "L'Integrale du Chapitre"}
                  </Text>
                  <Text style={styles.cardSubtitleItalic}>
                    {isProta
                      ? 'Tous les volumes en version intime (-25%)'
                      : 'Tous les volumes accessibles'}
                  </Text>
                </View>
                <Text style={[styles.cardPriceLarge, { color: colors.charcoal }]}>
                  {formatPrice(pricingInfo.chapterBundlePrice)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.cardButtonPrimary, { backgroundColor: accent }]}
                onPress={onPurchaseChapter}
                disabled={purchaseLoading}
                activeOpacity={0.7}
              >
                {purchaseLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Icon name="auto_awesome" size={18} color={colors.white} />
                    <Text style={styles.cardButtonPrimaryText}>
                      {isProta ? 'Debloquer toutes les perspectives' : 'Debloquer le chapitre entier'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* --- Option 3 : Le Club Prive (Coming Soon) --- */}
          <View style={styles.cardClub}>
            <View style={styles.clubHeader}>
              <Icon name="workspace_premium" size={28} color="#A855F7" />
              <View style={styles.clubBadge}>
                <Text style={styles.clubBadgeText}>Bientot</Text>
              </View>
            </View>

            <Text style={styles.clubTitle}>Le Club Prive</Text>
            <Text style={styles.clubDescription}>
              Acces illimite a tous les chapitres Narrateur. Acces immediat, sans attente. -30% sur la perspective Protagoniste.
            </Text>

            <View style={styles.clubFeatures}>
              {[
                'Tous les chapitres Narrateur sans attente',
                'Acces anticipe aux nouveaux chapitres',
                '-30% sur la perspective Protagoniste',
                'Sans engagement, resiliable a tout moment',
              ].map((feature, idx) => (
                <View key={idx} style={styles.clubFeatureRow}>
                  <Icon name="check_circle" size={16} color="#A855F7" />
                  <Text style={styles.clubFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.clubButton} disabled activeOpacity={1}>
              <Icon name="notifications_active" size={18} color={colors.white} />
              <Text style={styles.clubButtonText}>Me prevenir du lancement</Text>
            </TouchableOpacity>

            <Text style={styles.clubFooter}>
              En preparation - Lancement prevu prochainement
            </Text>
          </View>

          {/* Wait info hint (when no onStartWait handler provided) */}
          {pricingInfo.blockageType === 'WAIT_OR_PAY' && !isProta && !onStartWait && (
            <View style={styles.waitInfo}>
              <Icon name="schedule" size={16} color={colors.gray[500]} />
              <Text style={styles.waitInfoText}>
                Vous pouvez aussi attendre 24h pour lire ce volume gratuitement
              </Text>
            </View>
          )}
        </>
      ) : (
        /* Generic paywall without pricing */
        <View style={[styles.card, styles.cardVolume]}>
          <Icon name="lock" size={36} color={accent} style={{ alignSelf: 'center', marginBottom: spacing.lg }} />
          <Text style={[styles.cardTitle, { textAlign: 'center' }]}>
            Contenu verrouille
          </Text>
          <Text style={[styles.cardSubtitle, { textAlign: 'center', marginBottom: spacing.lg }]}>
            Ce contenu est disponible a l'achat sur le site web
          </Text>
          <TouchableOpacity
            style={[styles.cardButtonPrimary, { backgroundColor: accent }]}
            onPress={() => Linking.openURL('https://moncherjournal.com')}
          >
            <Text style={styles.cardButtonPrimaryText}>Ouvrir le site web</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },

  // --- Card base ---
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  cardVolume: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardBundle: {
    backgroundColor: 'rgba(225, 29, 72, 0.06)',
    borderWidth: 1,
  },
  cardBgIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    opacity: 0.08,
  },

  // --- Option label ---
  optionLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.md,
  },

  // --- Card row (title + price) ---
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  cardRowLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: fs.lg,
    fontWeight: '700',
    color: colors.charcoal,
  },
  cardTitleLarge: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    fontWeight: '700',
    color: colors.charcoal,
  },
  cardSubtitle: {
    fontSize: fs.sm,
    color: colors.gray[400],
    marginTop: 2,
  },
  cardSubtitleItalic: {
    fontSize: fs.sm,
    color: colors.gray[500],
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardPrice: {
    //fontFamily: 'Cinzel_700Bold',
    fontSize: fs['2xl'],
  },
  cardPriceLarge: {
   //fontFamily: 'Cinzel_700Bold',
    fontSize: fs['3xl'],
  },

  // --- Buttons ---
  cardButtonLight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    height: 50,
  },
  cardButtonLightText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.charcoal,
  },
  cardButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardButtonPrimaryText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
  },

  // --- Bundle badge ---
  bundleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  bundleBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // --- Club Prive ---
  cardClub: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  clubBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  clubBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  clubTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs['2xl'],
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  clubDescription: {
    fontSize: fs.sm,
    color: colors.gray[500],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  clubFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  clubFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  clubFeatureText: {
    flex: 1,
    fontSize: fs.xs,
    color: colors.gray[500],
    lineHeight: 18,
  },
  clubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#A855F7',
    opacity: 0.5,
    height: 46,
  },
  clubButtonText: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: colors.white,
  },
  clubFooter: {
    fontSize: fs.xs,
    color: colors.gray[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // --- Wait limit banner ---
  waitLimitBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    marginBottom: spacing.md,
  },
  waitLimitTextWrap: {
    flex: 1,
  },
  waitLimitTitle: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  waitLimitDesc: {
    fontSize: fs.xs,
    color: 'rgba(220, 38, 38, 0.8)',
    lineHeight: 16,
  },

  // --- Wait counter ---
  waitCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(5, 150, 105, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
    marginTop: spacing.md,
  },
  waitCounterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waitCounterLabel: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  waitCounterValue: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: '#059669',
  },

  // --- Wait to Read card ---
  cardWait: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(5, 150, 105, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  waitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  waitIconBox: {
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  waitHeaderText: {
    flex: 1,
  },
  waitTitle: {
    fontSize: fs.lg,
    fontWeight: '700',
    color: colors.charcoal,
  },
  waitFreeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  waitDescription: {
    fontSize: fs.sm,
    color: colors.gray[500],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  waitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    height: 50,
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  waitButtonText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
  },

  // --- Wait info (bottom note) ---
  waitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: borderRadius.lg,
  },
  waitInfoText: {
    flex: 1,
    fontSize: fs.sm,
    color: colors.gray[500],
    lineHeight: 18,
  },
});

export { PaywallCard, type PricingInfo };
export default PaywallCard;
