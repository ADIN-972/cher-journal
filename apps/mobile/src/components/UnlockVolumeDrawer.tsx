import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import {
  chaptersAPI,
  pricingAPI,
  stripeAPI,
  type VolumePriceInfo,
} from '@/services/api/chapters';
import type { Chapter, Volume } from '@/types';
import Icon from '@/components/Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';

const API_ORIGIN = (
  process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com/api'
).replace(/\/api$/, '');

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = 'chapter' | 'volumes' | 'recap';

interface VolumeWithPrice {
  volume: Volume;
  price: VolumePriceInfo;
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export default function UnlockVolumeDrawer({ visible, onClose }: Props) {
  const tc = useThemeColors();
  const [step, setStep] = useState<Step>('chapter');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);

  // Step 1: selected chapter
  const [selectedChapter, setSelectedChapter] = useState<(Chapter & { volumes?: Volume[] }) | null>(null);

  // Step 2: volumes with prices
  const [volumesWithPrices, setVolumesWithPrices] = useState<VolumeWithPrice[]>([]);
  const [selectedVolumeNumbers, setSelectedVolumeNumbers] = useState<Set<number>>(new Set());
  const [loadingVolumes, setLoadingVolumes] = useState(false);

  // Step 3: checkout
  const [purchasing, setPurchasing] = useState(false);

  // Fetch chapters on open
  useEffect(() => {
    if (visible) {
      setStep('chapter');
      setSelectedChapter(null);
      setSelectedVolumeNumbers(new Set());
      fetchChapters();
    }
  }, [visible]);

  // Track which chapters have all volumes accessible
  const [chapterFullyOwned, setChapterFullyOwned] = useState<Set<string>>(new Set());

  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const data = await chaptersAPI.getChapters();
      const published = data.filter((c) => c.status === 'PUBLISHED' && !c.isPrivateLocked);
      setChapters(published);

      // Fetch pricing for each chapter to detect fully owned
      const fullyOwned = new Set<string>();
      await Promise.all(
        published.map(async (ch) => {
          try {
            const full = await chaptersAPI.getChapter(ch.id);
            if (full.pricing && full.pricing.bundleDiscountedPrice === 0) {
              fullyOwned.add(ch.id);
            }
          } catch { /* ignore */ }
        })
      );
      setChapterFullyOwned(fullyOwned);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setLoadingChapters(false);
    }
  };

  // When chapter selected, fetch volumes + prices
  const handleSelectChapter = async (chapter: Chapter) => {
    setLoadingVolumes(true);
    setStep('volumes');
    try {
      const fullChapter = await chaptersAPI.getChapter(chapter.id);
      setSelectedChapter(fullChapter);

      const volumes = fullChapter.volumes || [];
      const publishedVolumes = volumes.filter((v) => v.status === 'PUBLISHED');

      // Fetch prices for all volumes in parallel
      const pricePromises = publishedVolumes.map(async (vol) => {
        try {
          const price = await pricingAPI.getVolumePrice(chapter.id, vol.volumeNumber);
          return { volume: vol, price };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(pricePromises);
      setVolumesWithPrices(results.filter(Boolean) as VolumeWithPrice[]);
    } catch (err) {
      console.error('Failed to load volumes:', err);
      Alert.alert('Erreur', 'Impossible de charger les volumes.');
      setStep('chapter');
    } finally {
      setLoadingVolumes(false);
    }
  };

  const toggleVolume = (volumeNumber: number) => {
    setSelectedVolumeNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(volumeNumber)) {
        next.delete(volumeNumber);
      } else {
        next.add(volumeNumber);
      }
      return next;
    });
  };

  // Selected volumes with their prices
  const selectedItems = volumesWithPrices.filter((vp) =>
    selectedVolumeNumbers.has(vp.volume.volumeNumber)
  );

  const totalBase = selectedItems.reduce((sum, vp) => sum + vp.price.basePrice, 0);
  const totalFinal = selectedItems.reduce((sum, vp) => sum + vp.price.finalPrice, 0);
  const totalDiscount = totalBase - totalFinal;

  const handleCheckout = async () => {
    if (selectedItems.length === 0 || !selectedChapter) return;

    setPurchasing(true);
    try {
      if (selectedItems.length === 1) {
        // Single volume purchase
        const vp = selectedItems[0];
        const session = await stripeAPI.createCheckoutSession({
          chapterId: selectedChapter.id,
          type: 'VOLUME',
          volumeNumber: vp.volume.volumeNumber,
          scopes: ['BASE'],
          successUrl: 'https://moncherjournal.com/account?purchase=success',
          cancelUrl: 'https://moncherjournal.com/account?purchase=cancelled',
        });
        if (session.url) {
          await WebBrowser.openBrowserAsync(session.url);
        }
      } else {
        // Multiple volumes: purchase one by one (API doesn't support batch)
        for (const vp of selectedItems) {
          const session = await stripeAPI.createCheckoutSession({
            chapterId: selectedChapter.id,
            type: 'VOLUME',
            volumeNumber: vp.volume.volumeNumber,
            scopes: ['BASE'],
            successUrl: 'https://moncherjournal.com/account?purchase=success',
            cancelUrl: 'https://moncherjournal.com/account?purchase=cancelled',
          });
          if (session.url) {
            await WebBrowser.openBrowserAsync(session.url);
          }
        }
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de lancer le paiement.');
    } finally {
      setPurchasing(false);
    }
  };

  const goBack = () => {
    if (step === 'volumes') {
      setStep('chapter');
      setSelectedChapter(null);
      setSelectedVolumeNumbers(new Set());
    } else if (step === 'recap') {
      setStep('volumes');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: tc.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: tc.cardBorder }]}>
          <TouchableOpacity onPress={step === 'chapter' ? onClose : goBack}>
            <Icon name={step === 'chapter' ? 'close' : 'arrow_back'} size={24} color={tc.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tc.text }]}>
            {step === 'chapter' && 'Choisir un chapitre'}
            {step === 'volumes' && 'Choisir les volumes'}
            {step === 'recap' && 'Recapitulatif'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.steps}>
          {['chapter', 'volumes', 'recap'].map((s, i) => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive, ['volumes', 'recap'].includes(step) && i < ['chapter', 'volumes', 'recap'].indexOf(step) && styles.stepDotDone]} />
              {i < 2 && <View style={[styles.stepLine, i < ['chapter', 'volumes', 'recap'].indexOf(step) && styles.stepLineDone]} />}
            </View>
          ))}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* STEP 1: Chapter selection */}
          {step === 'chapter' && (
            loadingChapters ? (
              <ActivityIndicator size="large" color={tc.gold} style={{ marginTop: spacing['3xl'] }} />
            ) : (
              chapters.map((ch) => {
                const coverUrl = ch.coverAsset?.objectKey
                  ? `${API_ORIGIN}/uploads/${ch.coverAsset.objectKey}`
                  : ch.coverAsset?.url
                    ? `${API_ORIGIN}${ch.coverAsset.url}`
                    : null;
                const isFullyOwned = chapterFullyOwned.has(ch.id);
                return (
                  <TouchableOpacity
                    key={ch.id}
                    style={[styles.chapterItem, { backgroundColor: tc.card, borderColor: tc.cardBorder }, isFullyOwned && { opacity: 0.45 }]}
                    onPress={() => !isFullyOwned && handleSelectChapter(ch)}
                    activeOpacity={isFullyOwned ? 1 : 0.7}
                    disabled={isFullyOwned}
                  >
                   
                    {coverUrl ? (
                      <Image source={{ uri: coverUrl }} style={styles.chapterCover} contentFit="cover" />
                    ) : (
                      <View style={[styles.chapterCover, styles.coverPlaceholder, { backgroundColor: tc.boudoir800 }]}>
                        <Icon name="auto_stories" size={20} color={tc.gold} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chapterProtagonist, { color: tc.gold }, isFullyOwned && { color: tc.textTertiary }]}>{ch.protagonistName}</Text>
                      <Text style={[styles.chapterTitle, { color: tc.text }, isFullyOwned && { color: tc.textTertiary }]} numberOfLines={2}>{ch.title}</Text>
                      {isFullyOwned && (
                        <Text style={styles.chapterOwnedLabel}>Tous les volumes sont accessibles</Text>
                      )}
                    </View> {isFullyOwned ? (
                      <Icon name="check_circle" size={20} color="#16A34A" />
                    ) : null}
                    {!isFullyOwned && <Icon name="chevron_right" size={20} color={tc.textTertiary} />}
                  </TouchableOpacity>
                );
              })
            )
          )}

          {/* STEP 2: Volume selection */}
          {step === 'volumes' && (
            loadingVolumes ? (
              <ActivityIndicator size="large" color={tc.gold} style={{ marginTop: spacing['3xl'] }} />
            ) : (
              <>
                {/* Chapter header */}
                <View style={[styles.volumeChapterHeader, { borderBottomColor: tc.cardBorder }]}>
                  <Text style={[styles.volumeChapterName, { color: tc.gold }]}>{selectedChapter?.protagonistName}</Text>
                  <Text style={[styles.volumeChapterTitle, { color: tc.text }]}>{selectedChapter?.title}</Text>
                </View>

                {/* Purchasable volumes (not free, not owned) */}
                {volumesWithPrices
                  .filter((vp) => !vp.price.hasAccess && !vp.volume.isFree && vp.price.finalPrice > 0)
                  .map((vp) => {
                    const isSelected = selectedVolumeNumbers.has(vp.volume.volumeNumber);
                    const hasPromo = vp.price.promotion !== null;

                    return (
                      <TouchableOpacity
                        key={vp.volume.id}
                        style={[styles.volumeItem, { backgroundColor: tc.card, borderColor: tc.cardBorder }, isSelected && styles.volumeItemSelected]}
                        onPress={() => toggleVolume(vp.volume.volumeNumber)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, { borderColor: tc.textTertiary }, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Icon name="check" size={14} color="#FFFFFF" />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.volumeTitle, { color: tc.text }]}>
                            Vol. {vp.volume.volumeNumber} - {vp.volume.title}
                          </Text>
                        </View>
                        <View style={styles.volumePriceCol}>
                          {vp.price.canWait && (
                            <Icon name="schedule" size={14} color="#D97706" style={{ marginBottom: 2 }} />
                          )}
                          {hasPromo && vp.price.basePrice !== vp.price.finalPrice && (
                            <Text style={[styles.volumePriceStruck, { color: tc.textTertiary }]}>{formatPrice(vp.price.basePrice)}</Text>
                          )}
                          <Text style={[styles.volumePrice, { color: tc.text }, hasPromo && { color: '#16A34A' }]}>
                            {formatPrice(vp.price.finalPrice)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                {/* Non-purchasable volumes (free or already owned) */}
                {volumesWithPrices.filter((vp) => vp.price.hasAccess || vp.volume.isFree || vp.price.finalPrice === 0).length > 0 && (
                  <View style={[styles.ownedSection, { borderTopColor: tc.cardBorder }]}>
                    <Text style={[styles.ownedSectionTitle, { color: tc.textTertiary }]}>Deja accessibles</Text>
                    {volumesWithPrices
                      .filter((vp) => vp.price.hasAccess || vp.volume.isFree || vp.price.finalPrice === 0)
                      .map((vp) => {
                        const isFree = (vp.volume.isFree || vp.price.finalPrice === 0) && !vp.price.hasAccess;
                        return (
                          <View key={vp.volume.id} style={[styles.volumeItem, { backgroundColor: tc.card, borderColor: tc.cardBorder }, styles.volumeItemOwned]}>
                            <Icon
                              name={isFree ? 'card_giftcard' : 'check_circle'}
                              size={18}
                              color={isFree ? tc.gold : '#16A34A'}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.volumeTitle, { color: tc.textTertiary }]}>
                                Vol. {vp.volume.volumeNumber} - {vp.volume.title}
                              </Text>
                            </View>
                            <Text style={[styles.volumeStatusLabel, { color: tc.textTertiary }]}>
                              {isFree ? 'Gratuit' : 'Possede'}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                )}
              </>
            )
          )}

          {/* STEP 3: Recap */}
          {step === 'recap' && selectedChapter && (
            <>
              <View style={[styles.recapChapter, { borderBottomColor: tc.cardBorder }]}>
                <Text style={[styles.recapChapterName, { color: tc.gold }]}>{selectedChapter.protagonistName}</Text>
                <Text style={[styles.recapChapterTitle, { color: tc.text }]}>{selectedChapter.title}</Text>
              </View>

              <Text style={[styles.recapSectionTitle, { color: tc.textSecondary }]}>
                {selectedItems.length} volume{selectedItems.length > 1 ? 's' : ''} selectionne{selectedItems.length > 1 ? 's' : ''}
              </Text>

              {selectedItems.map((vp) => (
                <View key={vp.volume.id} style={[styles.recapItem, { borderBottomColor: tc.separatorLight }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recapItemTitle, { color: tc.text }]}>
                      Vol. {vp.volume.volumeNumber} - {vp.volume.title}
                    </Text>
                    {vp.price.promotion && (
                      <View style={styles.recapPromo}>
                        <Icon name="loyalty" size={12} color="#16A34A" />
                        <Text style={styles.recapPromoText}>
                          {vp.price.promotion.type === 'PERCENT' && `-${vp.price.promotion.value}%`}
                          {vp.price.promotion.type === 'FIXED' && `-${formatPrice(vp.price.promotion.discount)}`}
                          {vp.price.promotion.type === 'FREE' && 'Gratuit'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.recapPriceCol}>
                    {vp.price.basePrice !== vp.price.finalPrice && (
                      <Text style={[styles.recapPriceStruck, { color: tc.textTertiary }]}>{formatPrice(vp.price.basePrice)}</Text>
                    )}
                    <Text style={[styles.recapPrice, { color: tc.text }]}>
                      {vp.price.finalPrice === 0 ? 'Gratuit' : formatPrice(vp.price.finalPrice)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Totals */}
              <View style={[styles.recapTotals, { borderTopColor: tc.cardBorder }]}>
                {totalDiscount > 0 && (
                  <View style={styles.recapTotalRow}>
                    <Text style={[styles.recapTotalLabel, { color: tc.textSecondary }]}>Sous-total</Text>
                    <Text style={[styles.recapTotalValue, { color: tc.textSecondary }]}>{formatPrice(totalBase)}</Text>
                  </View>
                )}
                {totalDiscount > 0 && (
                  <View style={styles.recapTotalRow}>
                    <Text style={[styles.recapTotalLabel, { color: '#16A34A' }]}>Promotions</Text>
                    <Text style={[styles.recapTotalValue, { color: '#16A34A' }]}>-{formatPrice(totalDiscount)}</Text>
                  </View>
                )}
                <View style={[styles.recapTotalRow, styles.recapTotalFinal, { borderTopColor: tc.cardBorder }]}>
                  <Text style={[styles.recapFinalLabel, { color: tc.text }]}>Total</Text>
                  <Text style={[styles.recapFinalValue, { color: tc.gold }]}>{formatPrice(totalFinal)}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom action bar */}
        {step === 'volumes' && selectedVolumeNumbers.size > 0 && (
          <View style={[styles.bottomBar, { backgroundColor: tc.card, borderTopColor: tc.cardBorder }]}>
            <View>
              <Text style={[styles.bottomBarCount, { color: tc.textSecondary }]}>
                {selectedVolumeNumbers.size} volume{selectedVolumeNumbers.size > 1 ? 's' : ''}
              </Text>
              <Text style={[styles.bottomBarPrice, { color: tc.gold }]}>{formatPrice(totalFinal)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bottomBarBtn, { backgroundColor: tc.gold }]}
              onPress={() => setStep('recap')}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomBarBtnText}>Continuer</Text>
              <Icon name="arrow_forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {step === 'recap' && (
          <View style={[styles.bottomBar, { backgroundColor: tc.card, borderTopColor: tc.cardBorder }]}>
            <View>
              <Text style={[styles.bottomBarPrice, { color: tc.gold }]}>{formatPrice(totalFinal)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.bottomBarBtn, { backgroundColor: tc.gold }, purchasing && { opacity: 0.6 }]}
              onPress={handleCheckout}
              disabled={purchasing}
              activeOpacity={0.8}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="shopping_cart" size={18} color="#FFFFFF" />
                  <Text style={styles.bottomBarBtnText}>Payer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
  },

  // Steps indicator
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray[300],
  },
  stepDotActive: {
    backgroundColor: colors.gold,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotDone: {
    backgroundColor: '#16A34A',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.gray[300],
  },
  stepLineDone: {
    backgroundColor: '#16A34A',
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Chapter list (step 1)
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  chapterCover: {
    width: 50,
    height: 70,
    borderRadius: borderRadius.md,
  },
  coverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterOwnedLabel: {
    fontSize: fs.xs,
    color: '#16A34A',
    fontStyle: 'italic',
    marginTop: 2,
  },
  chapterProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['2xl'],
    color: colors.gold,
    lineHeight: 28,
  },
  chapterTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fs.base,
    color: colors.charcoal,
  },

  // Volume list (step 2)
  volumeChapterHeader: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: spacing.md,
  },
  volumeChapterName: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['3xl'],
    color: colors.gold,
  },
  volumeChapterTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fs.lg,
    color: colors.charcoal,
  },
  volumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  volumeItemSelected: {
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderColor: colors.gold,
  },
  volumeItemOwned: {
    opacity: 0.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  volumeTitle: {
    fontSize: fs.sm,
    fontWeight: '500',
    color: colors.charcoal,
  },
  volumeOwned: {
    fontSize: fs.xs,
    color: '#16A34A',
    marginTop: 2,
  },
  volumeStatusLabel: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: colors.gray[400],
    fontStyle: 'italic',
  },
  ownedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  ownedSectionTitle: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  volumePriceCol: {
    alignItems: 'flex-end',
  },
  volumePrice: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: colors.charcoal,
  },
  volumePriceStruck: {
    fontSize: fs.xs,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  volumePriceOwned: {
    fontSize: fs.sm,
    color: colors.gray[400],
  },

  // Recap (step 3)
  recapChapter: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    marginBottom: spacing.lg,
  },
  recapChapterName: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['3xl'],
    color: colors.gold,
  },
  recapChapterTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fs.lg,
    color: colors.charcoal,
  },
  recapSectionTitle: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  recapItemTitle: {
    fontSize: fs.base,
    fontWeight: '500',
    color: colors.charcoal,
  },
  recapPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recapPromoText: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: '#16A34A',
  },
  recapPriceCol: {
    alignItems: 'flex-end',
  },
  recapPrice: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.charcoal,
  },
  recapPriceStruck: {
    fontSize: fs.xs,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },

  // Totals
  recapTotals: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.gray[200],
  },
  recapTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  recapTotalLabel: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },
  recapTotalValue: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },
  recapTotalFinal: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  recapFinalLabel: {
    fontSize: fs.lg,
    fontWeight: '700',
    color: colors.charcoal,
  },
  recapFinalValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs.xl,
    color: colors.gold,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBarCount: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  bottomBarPrice: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs.xl,
    color: colors.gold,
  },
  bottomBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bottomBarBtnText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
  },
});
