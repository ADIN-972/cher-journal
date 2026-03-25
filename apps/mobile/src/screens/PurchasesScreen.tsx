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
import { useRouter, useFocusEffect } from 'expo-router';
import { ordersAPI, type Purchase } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import UnlockVolumeDrawer from '@/components/UnlockVolumeDrawer';
import UnlockChapterDrawer from '@/components/UnlockChapterDrawer';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';
import ScreenHeader from '@/components/ScreenHeader';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  completed: { label: 'Complete', color: '#16A34A', bg: 'rgba(22,163,74,0.1)', icon: 'check_circle' },
  pending: { label: 'En attente', color: '#D97706', bg: 'rgba(217,119,6,0.1)', icon: 'pending' },
  refunded: { label: 'Rembourse', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: 'undo' },
};

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function groupByMonth(purchases: Purchase[]): Record<string, Purchase[]> {
  return purchases.reduce((acc, p) => {
    const d = new Date(p.date);
    const key = d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, Purchase[]>);
}

export default function PurchasesScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVolumeDrawer, setShowVolumeDrawer] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);

  const fetchPurchases = useCallback(async () => {
    try {
      const data = await ordersAPI.getUserOrders();
      // Sort by date desc
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPurchases(data);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPurchases();
    setRefreshing(false);
  };

  const paidPurchases = purchases.filter((p) => p.status === 'completed');
  const grouped = groupByMonth(paidPurchases);
  const months = Object.keys(grouped);

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
      <ScreenHeader title="Mes Achats" subtitle="Historique complet de vos transactions" />

      {purchases.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="shopping_bag" size={56} color={`${tc.gold}40`} />
          <Text style={[styles.emptyText, { color: tc.text }]}>Aucun achat pour le moment</Text>
          <Text style={[styles.emptySubtext, { color: tc.textSecondary }]}>
            Vos achats de volumes et chapitres apparaitront ici.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{paidPurchases.length}</Text>
              <Text style={styles.summaryLabel}>Achats</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatPrice(paidPurchases.reduce((sum, p) => sum + p.amount, 0))}
              </Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>

          {/* Grouped by month */}
          {months.map((monthKey) => (
            <View key={monthKey} style={styles.monthGroup}>
              <Text style={[styles.monthTitle, { borderBottomColor: tc.cardBorder }]}>{monthKey}</Text>
              {grouped[monthKey].map((purchase) => {
                const statusCfg = STATUS_CONFIG[purchase.status] || STATUS_CONFIG.completed;
                return (
                  <View key={purchase.id} style={[styles.purchaseCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
                    <View style={styles.purchaseIconWrap}>
                      <Icon name="receipt_long" size={20} color={colors.gold} />
                    </View>
                    <View style={styles.purchaseContent}>
                      <Text style={[styles.purchaseTitle, { color: tc.text }]} numberOfLines={2}>
                        {purchase.itemTitle}
                      </Text>
                      <View style={styles.purchaseMeta}>
                        <Text style={[styles.purchaseDate, { color: tc.textSecondary }]}>
                          {new Date(purchase.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                          <Icon name={statusCfg.icon} size={10} color={statusCfg.color} />
                          <Text style={[styles.statusText, { color: statusCfg.color }]}>
                            {statusCfg.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.purchaseAmount}>{formatPrice(purchase.amount)}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Paywall / Upsell Section */}
      <View style={[styles.paywallSection, { borderTopColor: tc.cardBorder }]}>
        <Text style={[styles.paywallSectionTitle, { color: tc.text }]}>Debloquer du contenu</Text>

        {/* Single volume */}
        <TouchableOpacity
          style={[styles.paywallCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          onPress={() => setShowVolumeDrawer(true)}
          activeOpacity={0.7}
        >
          <View style={styles.paywallIconWrap}>
            <Icon name="book" size={24} color={tc.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paywallTitle, { color: tc.text }]}>Debloquer un volume</Text>
            <Text style={[styles.paywallDesc, { color: tc.textSecondary }]}>
              Achetez un volume individuel pour poursuivre votre lecture.
            </Text>
          </View>
          <Icon name="arrow_forward" size={18} color={tc.gold} />
        </TouchableOpacity>

        {/* Full chapter */}
        <TouchableOpacity
          style={[styles.paywallCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          onPress={() => setShowChapterDrawer(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.paywallIconWrap, { backgroundColor: 'rgba(225,29,72,0.08)' }]}>
            <Icon name="auto_stories" size={24} color={tc.rose} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paywallTitle, { color: tc.text }]}>Debloquer un chapitre entier</Text>
            <Text style={[styles.paywallDesc, { color: tc.textSecondary }]}>
              L'integrale d'un chapitre a prix reduit.
            </Text>
          </View>
          <Icon name="arrow_forward" size={18} color={tc.rose} />
        </TouchableOpacity>

        {/* Club Prive */}
        <View style={[styles.paywallCard, styles.paywallCardClub]}>
          <View style={[styles.paywallIconWrap, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
            <Icon name="workspace_premium" size={24} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paywallTitle, { color: colors.white }]}>Le Club Prive</Text>
            <Text style={[styles.paywallDesc, { color: 'rgba(255,255,255,0.6)' }]}>
              Acces illimite a tous les chapitres Narrateur, sans timer.
            </Text>
            <View style={styles.clubBadge}>
              <Text style={styles.clubBadgeText}>Bientot</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.paywallButton, { borderColor: 'rgba(168,85,247,0.3)' }]}
            onPress={() => router.push('/account/subscription')}
            activeOpacity={0.7}
          >
            <Text style={[styles.paywallButtonText, { color: '#A855F7' }]}>Voir</Text>
            <Icon name="arrow_forward" size={14} color="#A855F7" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 80 }} />

      <UnlockVolumeDrawer
        visible={showVolumeDrawer}
        onClose={() => { setShowVolumeDrawer(false); handleRefresh(); }}
      />
      <UnlockChapterDrawer
        visible={showChapterDrawer}
        onClose={() => { setShowChapterDrawer(false); handleRefresh(); }}
      />
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
  },

  // Summary card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.boudoir[950],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs['2xl'],
    color: colors.gold,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: fs.xs,
    color: colors.boudoir[200],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(212,175,55,0.2)',
    marginVertical: spacing.sm,
  },

  // Month group
  monthGroup: {
    marginBottom: spacing.xl,
  },
  monthTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: colors.gold,
    textTransform: 'capitalize',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },

  // Purchase card
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  purchaseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseContent: {
    flex: 1,
  },
  purchaseTitle: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 4,
  },
  purchaseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  purchaseDate: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  purchaseAmount: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs.lg,
    color: colors.gold,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Paywall section
  paywallSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  paywallSectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  paywallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  paywallCardClub: {
    backgroundColor: '#1A0A14',
    borderColor: 'rgba(168,85,247,0.3)',
  },
  paywallIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(212,175,55,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 2,
  },
  paywallDesc: {
    fontSize: fs.xs,
    color: colors.gray[500],
    lineHeight: 16,
  },
  paywallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  paywallButtonText: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: colors.gold,
  },
  clubBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  clubBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#C084FC',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
