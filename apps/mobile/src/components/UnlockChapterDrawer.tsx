import React, { useState, useEffect } from 'react';
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
import { chaptersAPI, stripeAPI } from '@/services/api/chapters';
import type { Chapter } from '@/types';
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

type Step = 'chapters' | 'recap';

interface ChapterWithPricing extends Chapter {
  volumes?: any[];
  pricing?: {
    bundleOriginalPrice: number;
    bundleDiscountedPrice: number;
    totalVolumes: number;
  };
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

export default function UnlockChapterDrawer({ visible, onClose }: Props) {
  const tc = useThemeColors();
  const [step, setStep] = useState<Step>('chapters');
  const [chapters, setChapters] = useState<ChapterWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [purchasing, setPurchasing] = useState(false);

  // Fetch chapters with pricing on open
  useEffect(() => {
    if (visible) {
      setStep('chapters');
      setSelectedIds(new Set());
      fetchChaptersWithPricing();
    }
  }, [visible]);

  const fetchChaptersWithPricing = async () => {
    setLoading(true);
    try {
      const allChapters = await chaptersAPI.getChapters();
      const published = allChapters.filter((c) => c.status === 'PUBLISHED' && !c.isPrivateLocked);

      // Fetch full details (with pricing) in parallel
      const detailed = await Promise.all(
        published.map(async (ch) => {
          try {
            const full = await chaptersAPI.getChapter(ch.id);
            return { ...ch, ...full } as ChapterWithPricing;
          } catch {
            return ch as ChapterWithPricing;
          }
        })
      );

      setChapters(detailed);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedChapters = chapters.filter((ch) => selectedIds.has(ch.id));
  const totalPrice = selectedChapters.reduce(
    (sum, ch) => sum + (ch.pricing?.bundleDiscountedPrice || 0),
    0
  );
  const totalOriginal = selectedChapters.reduce(
    (sum, ch) => sum + (ch.pricing?.bundleOriginalPrice || 0),
    0
  );
  const totalDiscount = totalOriginal - totalPrice;

  const handleCheckout = async () => {
    if (selectedChapters.length === 0) return;

    setPurchasing(true);
    try {
      // Process each chapter purchase
      for (const ch of selectedChapters) {
        const session = await stripeAPI.createCheckoutSession({
          chapterId: ch.id,
          type: 'CHAPTER',
          scopes: ['BASE'],
          successUrl: 'https://moncherjournal.com/account?purchase=success',
          cancelUrl: 'https://moncherjournal.com/account?purchase=cancelled',
        });
        if (session.url) {
          await WebBrowser.openBrowserAsync(session.url);
        }
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de lancer le paiement.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: tc.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: tc.cardBorder }]}>
          <TouchableOpacity onPress={step === 'chapters' ? onClose : () => setStep('chapters')}>
            <Icon
              name={step === 'chapters' ? 'close' : 'arrow_back'}
              size={24}
              color={tc.text}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tc.text }]}>
            {step === 'chapters' ? 'Choisir les chapitres' : 'Recapitulatif'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step indicator */}
        <View style={styles.steps}>
          <View
            style={[
              styles.stepDot,
              step === 'chapters' && styles.stepDotActive,
              step === 'recap' && styles.stepDotDone,
            ]}
          />
          <View style={[styles.stepLine, step === 'recap' && styles.stepLineDone]} />
          <View style={[styles.stepDot, step === 'recap' && styles.stepDotActive]} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* STEP 1: Chapter selection */}
          {step === 'chapters' &&
            (loading ? (
              <ActivityIndicator
                size="large"
                color={tc.gold}
                style={{ marginTop: spacing['3xl'] }}
              />
            ) : (
              <>
                {chapters.map((ch) => {
                  const isFullyOwned = (ch.pricing?.bundleDiscountedPrice ?? 0) === 0;
                  const isSelected = selectedIds.has(ch.id);
                  const coverUrl = ch.coverAsset?.objectKey
                    ? `${API_ORIGIN}/uploads/${ch.coverAsset.objectKey}`
                    : ch.coverAsset?.url
                      ? `${API_ORIGIN}${ch.coverAsset.url}`
                      : null;
                  return (
                    <TouchableOpacity
                      key={ch.id}
                      style={[
                        styles.chapterItem,
                        { backgroundColor: tc.card, borderColor: tc.cardBorder },
                        isSelected && styles.chapterItemSelected,
                        isFullyOwned && { opacity: 0.45 },
                      ]}
                      onPress={() => !isFullyOwned && toggleChapter(ch.id)}
                      activeOpacity={isFullyOwned ? 1 : 0.7}
                      disabled={isFullyOwned}
                    >
                      {isFullyOwned ? (
                        <Icon name="check_circle" size={20} color="#16A34A" />
                      ) : (
                        <View style={[styles.checkbox, { borderColor: tc.textTertiary }, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Icon name="check" size={14} color="#FFFFFF" />}
                        </View>
                      )}
                      {coverUrl ? (
                        <Image
                          source={{ uri: coverUrl }}
                          style={styles.chapterCover}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.chapterCover, styles.coverPlaceholder, { backgroundColor: tc.boudoir800 }]}>
                          <Icon name="auto_stories" size={20} color={tc.gold} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.chapterProtagonist,
                            { color: tc.gold },
                            isFullyOwned && { color: tc.textTertiary },
                          ]}
                        >
                          {ch.protagonistName}
                        </Text>
                        <Text
                          style={[styles.chapterTitle, { color: tc.text }, isFullyOwned && { color: tc.textTertiary }]}
                          numberOfLines={2}
                        >
                          {ch.title}
                        </Text>
                        <Text style={[styles.chapterVolCount, { color: tc.textSecondary }]}>
                          {ch.pricing?.totalVolumes || ch.volumes?.length || '?'} volumes
                        </Text>
                        {isFullyOwned && (
                          <Text style={styles.chapterOwnedLabel}>
                            Tous les volumes sont accessibles
                          </Text>
                        )}
                      </View>
                      {!isFullyOwned && (
                        <Text style={[styles.chapterPrice, { color: tc.gold }]}>
                          {formatPrice(ch.pricing!.bundleDiscountedPrice)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            ))}

          {/* STEP 2: Recap */}
          {step === 'recap' && (
            <>
              <Text style={[styles.recapSectionTitle, { color: tc.textSecondary }]}>
                {selectedChapters.length} chapitre{selectedChapters.length > 1 ? 's' : ''}{' '}
                selectionne{selectedChapters.length > 1 ? 's' : ''}
              </Text>

              {selectedChapters.map((ch) => {
                const coverUrl =
                  ch.coverAsset?.url ||
                  (ch.coverAsset?.objectKey
                    ? `${API_ORIGIN}/uploads/${ch.coverAsset.objectKey}`
                    : null);
                return (
                  <View key={ch.id} style={[styles.recapItem, { borderBottomColor: tc.separatorLight }]}>
                    {coverUrl ? (
                      <Image
                        source={{ uri: coverUrl }}
                        style={styles.recapCover}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.recapCover, styles.coverPlaceholder, { backgroundColor: tc.boudoir800 }]}>
                        <Icon name="auto_stories" size={16} color={tc.gold} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.recapProtagonist, { color: tc.gold }]}>{ch.protagonistName}</Text>
                      <Text style={[styles.recapTitle, { color: tc.text }]} numberOfLines={2}>
                        {ch.title}
                      </Text>
                      <Text style={[styles.recapVolumes, { color: tc.textSecondary }]}>
                        {ch.pricing?.totalVolumes || '?'} volumes - Integrale
                      </Text>
                    </View>
                    <Text style={[styles.recapPrice, { color: tc.gold }]}>
                      {ch.pricing?.bundleDiscountedPrice
                        ? formatPrice(ch.pricing.bundleDiscountedPrice)
                        : 'Gratuit'}
                    </Text>
                  </View>
                );
              })}

              {/* Totals */}
              <View style={[styles.recapTotals, { borderTopColor: tc.cardBorder }]}>
                {totalDiscount > 0 && (
                  <>
                    <View style={styles.recapTotalRow}>
                      <Text style={[styles.recapTotalLabel, { color: tc.textSecondary }]}>Sous-total</Text>
                      <Text style={[styles.recapTotalValue, { color: tc.textSecondary }]}>{formatPrice(totalOriginal)}</Text>
                    </View>
                    <View style={styles.recapTotalRow}>
                      <Text style={[styles.recapTotalLabel, { color: '#16A34A' }]}>Reduction</Text>
                      <Text style={[styles.recapTotalValue, { color: '#16A34A' }]}>
                        -{formatPrice(totalDiscount)}
                      </Text>
                    </View>
                  </>
                )}
                <View style={[styles.recapTotalRow, styles.recapTotalFinal, { borderTopColor: tc.cardBorder }]}>
                  <Text style={[styles.recapFinalLabel, { color: tc.text }]}>Total</Text>
                  <Text style={[styles.recapFinalValue, { color: tc.gold }]}>{formatPrice(totalPrice)}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom bar */}
        {step === 'chapters' && selectedIds.size > 0 && (
          <View style={[styles.bottomBar, { backgroundColor: tc.card, borderTopColor: tc.cardBorder }]}>
            <View>
              <Text style={[styles.bottomBarCount, { color: tc.textSecondary }]}>
                {selectedIds.size} chapitre{selectedIds.size > 1 ? 's' : ''}
              </Text>
              <Text style={[styles.bottomBarPrice, { color: tc.gold }]}>{formatPrice(totalPrice)}</Text>
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
              <Text style={[styles.bottomBarPrice, { color: tc.gold }]}>{formatPrice(totalPrice)}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
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

  // Steps
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
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
  stepDotDone: { backgroundColor: '#16A34A' },
  stepLine: { width: 40, height: 2, backgroundColor: colors.gray[300] },
  stepLineDone: { backgroundColor: '#16A34A' },

  content: { flex: 1, paddingHorizontal: spacing.lg },

  // Chapter list
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
  chapterItemSelected: {
    backgroundColor: 'rgba(212,175,55,0.06)',
    borderColor: colors.gold,
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
  chapterCover: { width: 50, height: 70, borderRadius: borderRadius.md },
  coverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
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
  chapterVolCount: {
    fontSize: fs.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  chapterOwnedLabel: {
    fontSize: fs.xs,
    color: '#16A34A',
    fontStyle: 'italic',
    marginTop: 2,
  },
  chapterPriceCol: { alignItems: 'flex-end' },
  chapterPrice: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs.base,
    color: colors.gold,
  },

  // Recap
  recapSectionTitle: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginVertical: spacing.lg,
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  recapCover: { width: 45, height: 65, borderRadius: borderRadius.md },
  recapProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs.xl,
    color: colors.gold,
  },
  recapTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fs.sm,
    color: colors.charcoal,
  },
  recapVolumes: { fontSize: fs.xs, color: colors.gray[500], marginTop: 2 },
  recapPrice: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs.lg,
    color: colors.gold,
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
  recapTotalLabel: { fontSize: fs.sm, color: colors.gray[500] },
  recapTotalValue: { fontSize: fs.sm, color: colors.gray[500] },
  recapTotalFinal: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  recapFinalLabel: { fontSize: fs.lg, fontWeight: '700', color: colors.charcoal },
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
  bottomBarCount: { fontSize: fs.xs, color: colors.gray[500] },
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
  bottomBarBtnText: { fontSize: fs.base, fontWeight: '700', color: colors.white },
});
