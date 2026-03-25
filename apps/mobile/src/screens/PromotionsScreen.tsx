import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { promotionsAPI, type Promotion } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';
import ScreenHeader from '@/components/ScreenHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

function getPromoValue(type: string, value?: number | null): string {
  if (type === 'FREE') return 'GRATUIT';
  if (type === 'PERCENT' && value) return `-${value}%`;
  if (type === 'FIXED' && value) return `-${(value / 100).toFixed(2)}EUR`;
  return '';
}

function getPromoIcon(type: string): string {
  if (type === 'FREE') return 'card_giftcard';
  if (type === 'PERCENT') return 'percent';
  return 'attach_money';
}

const SCOPE_LABELS: Record<string, string> = {
  CHAPTER: 'Chapitre complet',
  VOLUME: 'Prochain volume',
  EPILOGUE: 'Epilogue',
  POV_CHAPTER: 'POV Protagoniste (chapitre)',
  POV_VOLUME: 'POV Protagoniste (volume)',
  COLORING: 'Pages de coloriage',
  BUNDLE: 'Bundle',
  SUBSCRIPTION: 'Abonnement',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function PromotionsScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromotions = useCallback(async () => {
    try {
      const data = await promotionsAPI.getApplicable();
      setPromotions(data);
    } catch (err) {
      console.error('Failed to load promotions:', err);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPromotions();
    }, [fetchPromotions])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.gold} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tc.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tc.gold} />
      }
    >
      <ScreenHeader title="Mes Promotions" subtitle="Codes promo et offres speciales" />

      {promotions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="card_giftcard" size={56} color={`${tc.gold}40`} />
          <Text style={[styles.emptyText, { color: tc.text }]}>Aucune promotion disponible</Text>
          <Text style={[styles.emptySubtext, { color: tc.textSecondary }]}>
            Les offres speciales et codes promo apparaitront ici lorsqu'ils seront disponibles.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {promotions.map((promo) => (
            <View key={promo.id} style={styles.promoCard}>
              {/* Gold header with value */}
              <View style={styles.promoHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoName} numberOfLines={2}>{promo.name}</Text>
                  {promo.description ? (
                    <Text style={styles.promoDesc} numberOfLines={2}>{promo.description}</Text>
                  ) : null}
                </View>
                <View style={styles.promoValueBox}>
                  <Icon name={getPromoIcon(promo.type)} size={16} color={colors.white} />
                  <Text style={styles.promoValue}>{getPromoValue(promo.type, promo.value)}</Text>
                </View>
              </View>

              {/* Body: scope + 2-column layout */}
              <View style={[styles.promoBody, { backgroundColor: tc.card }]}>
                <View style={styles.scopeBadge}>
                  <Text style={styles.scopeText}>{SCOPE_LABELS[promo.scope] || promo.scope}</Text>
                </View>

                <View style={styles.bodyColumns}>
                  {/* Left: cover image */}
                  {promo.content?.chapterCoverUrl ? (
                    <Image
                      source={{ uri: `${API_ORIGIN}${promo.content.chapterCoverUrl}` }}
                      style={styles.contentCover}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.contentCover, styles.contentCoverPlaceholder]}>
                      <Icon name="card_giftcard" size={24} color={tc.gold} />
                    </View>
                  )}

                  {/* Right: details */}
                  <View style={styles.bodyRight}>
                    {promo.content?.chapterTitle && (
                      <>
                        {promo.content.protagonistName && (
                          <Text style={[styles.contentProtagonist, { color: tc.gold }]}>{promo.content.protagonistName}</Text>
                        )}
                        <Text style={[styles.contentTitle, { color: tc.text }]} numberOfLines={2}>
                          {promo.content.chapterTitle}
                        </Text>
                        {promo.content.volumeNumber != null && (
                          <Text style={[styles.contentVolume, { color: tc.textSecondary }]}>
                            Volume {promo.content.volumeNumber}
                          </Text>
                        )}
                      </>
                    )}

                    <View style={styles.detailsRow}>
                      <Icon name="calendar_today" size={12} color={tc.textTertiary} />
                      <Text style={[styles.detailText, { color: tc.textSecondary }]}>
                        Jusqu'au {formatDate(promo.endsAt)}
                      </Text>
                    </View>

                    {promo.userRemainingUses !== null && promo.userRemainingUses > 0 && (
                      <View style={styles.detailsRow}>
                        <Icon name="person" size={12} color={tc.textTertiary} />
                        <Text style={[styles.detailText, { color: tc.textSecondary }]}>
                          {promo.userRemainingUses}x disponible{promo.userRemainingUses > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Action */}
              <TouchableOpacity
                style={styles.promoButton}
                activeOpacity={0.8}
                onPress={() => {
                  if (promo.content?.chapterId) {
                    router.push(`/chapters/${promo.content.chapterId}`);
                  }
                }}
              >
                <Text style={styles.promoButtonText}>En profiter</Text>
                <Icon name="arrow_forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

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

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
  },
  emptySubtext: {
    fontSize: fs.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },

  // Promo card
  promoCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.boudoir[950],
  },
  promoName: {
    fontSize: fs.lg,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: fs.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  promoValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  promoValue: {
    fontSize: fs.xl,
    fontWeight: '800',
    color: colors.white,
  },

  // Body
  promoBody: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  scopeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168,85,247,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  scopeText: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: '#7C3AED',
  },

  // 2-column layout
  bodyColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contentCover: {
    width: 80,
    height: 110,
    borderRadius: borderRadius.md,
  },
  contentCoverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyRight: {
    flex: 1,
    gap: spacing.sm,
  },
  contentProtagonist: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['4xl'],
    color: colors.gold,
  },
  contentTitle: {
    fontSize: fs['xl'],
    fontFamily: 'Newsreader_400Regular',
    color: colors.charcoal,
  },
  contentVolume: {
    fontSize: fs.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Details
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },

  // Button
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.gold,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.2)',
  },
  promoButtonText: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: colors.white,
  },
});
