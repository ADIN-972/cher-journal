import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { customStoriesAPI, museChaptersAPI, type CustomStoryRequest, type MuseChapterEntry } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';

const GENRE_LABELS: Record<string, string> = {
  PASSIONS_CHARNELLES: 'Passions Charnelles',
  ROMANCES_TENDRES: 'Romances Tendres',
  MYSTERIES_SENSUELS: 'Mysteres Sensuels',
  INTERDITS: 'Interdits',
  CONQUETES: 'Conquetes',
  REVES_SECRETS: 'Reves Secrets',
  PASSION_BRUTALE: 'Passion Brutale',
  AMOUR_COMPLIQUE: 'Amour Complique',
  DESIR_NOCTURNE: 'Desir Nocturne',
  LIBERATION: 'Liberation',
  DECOUVERTE_DE_SOI: 'Decouverte de Soi',
  INTIMITE_PSYCHOLOGIQUE: 'Intimite Psychologique',
  EVEIL_DU_DESIR: 'Eveil du Desir',
  RELATIONS_TRANSFORMATRICES: 'Relations Transformatrices',
  MEMOIRE_DU_CORPS: 'Memoire du Corps',
};

const EXPLICIT_LABELS: Record<string, string> = {
  ROMANTIQUE: 'Romantique',
  SUGGESTIF: 'Suggestif',
  SENSUEL: 'Sensuel',
  EXPLICITE: 'Explicite',
  TRES_EXPLICITE: 'Tres Explicite',
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  PENDING: { color: '#CA8A04', bg: '#FEF9C3', icon: 'schedule', label: 'En attente' },
  UNDER_REVIEW: { color: '#2563EB', bg: '#DBEAFE', icon: 'visibility', label: 'En examen' },
  APPROVED: { color: '#16A34A', bg: '#DCFCE7', icon: 'check_circle', label: 'Approuve' },
  REJECTED: { color: '#DC2626', bg: '#FEE2E2', icon: 'cancel', label: 'Rejete' },
  ARCHIVED: { color: '#6B7280', bg: '#F3F4F6', icon: 'archive', label: 'Archive' },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const MyRequestsScreen: React.FC = () => {
  const router = useRouter();
  const [stories, setStories] = useState<CustomStoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [museChapters, setMuseChapters] = useState<MuseChapterEntry[]>([]);

  const fetchStories = useCallback(async () => {
    try {
      const [storiesData, museData] = await Promise.all([
        customStoriesAPI.getMyStories(),
        museChaptersAPI.getMyMuseChapters().catch(() => [] as MuseChapterEntry[]),
      ]);
      setStories(Array.isArray(storiesData) ? storiesData : []);
      setMuseChapters(museData);
      setError(null);
    } catch (err: any) {
      setError(err.userMessage || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStories();
    }, [fetchStories])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStories();
    setRefreshing(false);
  };

  const handleCancel = async (storyId: string) => {
    // window.confirm works on web, Alert.alert on native
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm('Etes-vous sur de vouloir annuler cette demande ?')
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Annuler la demande',
            'Etes-vous sur de vouloir annuler cette demande ?',
            [
              { text: 'Non', onPress: () => resolve(false) },
              { text: 'Oui, annuler', style: 'destructive', onPress: () => resolve(true) },
            ],
          )
        );

    if (!confirmed) return;

    try {
      await customStoriesAPI.cancelStory(storyId);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    } catch (err: any) {
      const msg = err.userMessage || "Impossible d'annuler";
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(msg);
      } else {
        Alert.alert('Erreur', msg);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Chargement de vos demandes...</Text>
      </View>
    );
  }

  if (error && stories.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="error" size={40} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="edit_note" size={56} color={colors.gold} style={{ opacity: 0.4 }} />
        <Text style={styles.emptyTitle}>Aucune demande</Text>
        <Text style={styles.emptyText}>
          Vous n'avez pas encore soumis de demandes de creation d'histoire personnalisee.
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/account/create-story')}
          activeOpacity={0.7}
        >
          <Icon name="auto_awesome" size={18} color={colors.white} />
          <Text style={styles.createButtonText}>Creer une demande</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/account')} style={{ marginBottom: spacing.sm }}>
          <Icon name="arrow_back" size={22} color={colors.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mes Demandes</Text>
            <Text style={styles.headerSubtitle}>
              {stories.length} demande{stories.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newRequestButton}
            onPress={() => router.push('/account/create-story')}
            activeOpacity={0.7}
          >
            <Icon name="add" size={16} color={colors.white} />
            <Text style={styles.newRequestText}>Nouvelle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Muse chapters section */}
      {museChapters.length > 0 && (
        <View style={styles.museSection}>
          {museChapters.map((entry) => (
            <View key={entry.id} style={styles.museCard}>
              <View style={styles.museCardHeader}>
                <View style={styles.museIconContainer}>
                  <Icon name="auto_awesome" size={22} color="#D4AF37" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.museTitle}>Votre histoire a pris vie !</Text>
                  <Text style={styles.museChapterTitle}>{entry.chapter.title}</Text>
                  <Text style={styles.museProtagonist}>
                    Protagoniste : {entry.chapter.protagonistName}
                  </Text>
                </View>
              </View>
              {entry.promotion && (
                <View style={styles.musePromoBadge}>
                  <Icon name="redeem" size={14} color="#7C3AED" />
                  <Text style={styles.musePromoText}>Promotion : {entry.promotion.name}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.museButton}
                onPress={() => router.push(`/chapters/${entry.chapter.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.museButtonText}>Voir le chapitre</Text>
                <Icon name="arrow_forward" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Stories list */}
      <View style={styles.list}>
        {stories.map((story) => {
          const statusCfg = STATUS_CONFIG[story.status] || STATUS_CONFIG.PENDING;
          const isExpanded = expandedId === story.id;

          return (
            <View key={story.id} style={[styles.card, story.status === 'REJECTED' && styles.cardRejected]}>
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardProtagonist}>{story.protagonistName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Icon name={statusCfg.icon} size={14} color={statusCfg.color} />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {story.description}
                  </Text>
                </View>
              </View>

              {/* Info grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Genres</Text>
                  <View style={styles.genreRow}>
                    {(story.selectedGenres || []).slice(0, 2).map((g, i) => (
                      <Text key={i} style={styles.genreTag}>
                        {GENRE_LABELS[g] || g}
                      </Text>
                    ))}
                    {(story.selectedGenres || []).length > 2 && (
                      <Text style={styles.genreTag}>+{story.selectedGenres.length - 2}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Explicite</Text>
                  <Text style={styles.infoValue}>
                    {EXPLICIT_LABELS[story.explicitLevel] || story.explicitLevel}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Photos</Text>
                  <Text style={styles.infoValue}>{(story.photoAssetIds || []).length}/10</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{formatDate(story.submittedAt || story.createdAt)}</Text>
                </View>
              </View>

              {/* Rejection reason */}
              {story.status === 'REJECTED' && (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionTitle}>Raison du rejet</Text>
                  <Text style={styles.rejectionText}>
                    {story.rejectionReason || 'Aucune raison specifiee'}
                  </Text>
                  {story.rejectionNotes && (
                    <>
                      <Text style={[styles.rejectionTitle, { marginTop: spacing.sm }]}>
                        Notes additionnelles
                      </Text>
                      <Text style={styles.rejectionText}>{story.rejectionNotes}</Text>
                    </>
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => setExpandedId(isExpanded ? null : story.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.detailsButtonText}>Details</Text>
                  <Icon
                    name={isExpanded ? 'expand_less' : 'expand_more'}
                    size={18}
                    color={colors.gray[600]}
                  />
                </TouchableOpacity>

                {story.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancel(story.id)}
                    activeOpacity={0.7}
                  >
                    <Icon name="delete" size={16} color={colors.error} />
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Expanded details */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedLabel}>Description</Text>
                  <Text style={styles.expandedText}>{story.description}</Text>

                  <Text style={[styles.expandedLabel, { marginTop: spacing.md }]}>
                    Genres selectionnes
                  </Text>
                  <View style={styles.genreWrap}>
                    {(story.selectedGenres || []).map((g, i) => (
                      <Text key={i} style={styles.genreTagExpanded}>
                        {GENRE_LABELS[g] || g}
                      </Text>
                    ))}
                  </View>

                  {story.status === 'APPROVED' && (
                    <View style={styles.approvedBox}>
                      <Icon name="auto_awesome" size={18} color={colors.success} />
                      <Text style={styles.approvedText}>
                        Felicitations ! Votre demande a ete approuvee. Un auteur travaille
                        actuellement a la creation de votre histoire personnalisee.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Newsreader_400Regular_Italic',
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  emptyTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.charcoal,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['3xl'],
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.rose,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  newRequestText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.rose,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  createButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  cardRejected: {
    borderColor: `${colors.error}40`,
    borderStyle: 'dashed',
  },
  cardHeader: {
    padding: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardProtagonist: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    lineHeight: 20,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  infoItem: {
    minWidth: '40%',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.gray[400],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.charcoal,
    fontWeight: '500',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  genreTag: {
    fontSize: 11,
    backgroundColor: colors.gray[100],
    color: colors.gray[600],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Rejection
  rejectionBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  rejectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: fontSize.sm,
    color: '#B91C1C',
    lineHeight: 20,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  detailsButtonText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    fontSize: fontSize.sm,
    color: colors.error,
  },

  // Expanded
  expandedSection: {
    backgroundColor: colors.gray[100],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: spacing.lg,
  },
  expandedLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  expandedText: {
    fontSize: fontSize.sm,
    color: colors.charcoal,
    lineHeight: 22,
  },
  genreWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreTagExpanded: {
    fontSize: fontSize.xs,
    backgroundColor: `${colors.rose}15`,
    color: colors.rose,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Muse chapters
  museSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  museCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#D4AF3740',
    overflow: 'hidden',
    padding: spacing.lg,
  },
  museCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  museIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  museTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    color: '#7C3AED',
    marginBottom: 2,
  },
  museChapterTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 2,
  },
  museProtagonist: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  musePromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED12',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  musePromoText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#7C3AED',
  },
  museButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#7C3AED',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
  },
  museButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },

  // Approved
  approvedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  approvedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#166534',
    lineHeight: 20,
  },
});

export default MyRequestsScreen;
