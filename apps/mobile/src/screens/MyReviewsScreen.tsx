import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { reviewsAPI, chaptersAPI, type Review } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import ChapterReviewModal from '@/components/ChapterReviewModal';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';
import ScreenHeader from '@/components/ScreenHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  PENDING: { color: '#CA8A04', bg: '#FEF9C3', icon: 'schedule', label: 'En attente' },
  APPROVED: { color: '#16A34A', bg: '#DCFCE7', icon: 'check_circle', label: 'Approuvé' },
  REJECTED: { color: '#DC2626', bg: '#FEE2E2', icon: 'cancel', label: 'Rejeté' },
};

const MyReviewsScreen: React.FC = () => {
  const router = useRouter();
  const tc = useThemeColors();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New review state
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [chapters, setChapters] = useState<
    { id: string; title: string; protagonistName: string; coverUrl: string | null }[]
  >([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    title: string;
    protagonistName: string;
    coverUrl: string | null;
  } | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewsAPI.getUserReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const openChapterPicker = async () => {
    setShowChapterPicker(true);
    if (chapters.length > 0) return;
    setLoadingChapters(true);
    try {
      const data = await chaptersAPI.getChapters();
      // Exclude chapters already reviewed
      const reviewedIds = new Set(reviews.map((r) => r.chapter?.id || (r as any).chapterId));
      setChapters(
        (Array.isArray(data) ? data : [])
          .filter((ch: any) => !reviewedIds.has(ch.id))
          .map((ch: any) => ({
            id: ch.id,
            title: ch.title,
            protagonistName: ch.protagonistName || '',
            coverUrl: ch.coverUrl || '',
          }))
      );
    } catch {
      // silent
    } finally {
      setLoadingChapters(false);
    }
  };

  const selectChapter = (ch: {
    id: string;
    title: string;
    protagonistName: string;
    coverUrl: string | null;
  }) => {
    setShowChapterPicker(false);
    setReviewTarget(ch);
  };

  const onReviewModalClose = () => {
    setReviewTarget(null);
    fetchReviews();
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditText(review.reviewText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditText('');
  };

  const saveReview = async (chapterId: string) => {
    if (editRating === 0 || editText.trim().length < 10) return;
    setIsSaving(true);
    try {
      await reviewsAPI.createOrUpdate({
        chapterId,
        rating: editRating,
        reviewText: editText.trim(),
      });
      await fetchReviews();
      cancelEdit();
    } catch (err: any) {
      Alert.alert('Erreur', err.userMessage || 'Impossible de sauvegarder');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReview = async (chapterId: string) => {
    const confirmed =
      typeof window !== 'undefined' && window.confirm
        ? window.confirm('Supprimer cet avis ?')
        : await new Promise<boolean>((resolve) =>
            Alert.alert('Supprimer', 'Supprimer cet avis ?', [
              { text: 'Non', onPress: () => resolve(false) },
              { text: 'Oui', style: 'destructive', onPress: () => resolve(true) },
            ])
          );
    if (!confirmed) return;

    try {
      await reviewsAPI.deleteReview(chapterId);
      await fetchReviews();
    } catch (err: any) {
      Alert.alert('Erreur', err.userMessage || 'Impossible de supprimer');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.gold} />
        <Text style={[styles.loadingText, { color: tc.textSecondary }]}>Chargement de vos avis...</Text>
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
      <ScreenHeader
        title="Mes Avis"
        subtitle="Retrouvez tous les avis que vous avez laisses."
        rightAction={
          <TouchableOpacity
            style={styles.newReviewButton}
            onPress={openChapterPicker}
            activeOpacity={0.7}
          >
            <Icon name="add" size={16} color={colors.white} />
            <Text style={styles.newReviewText}>Nouvel avis</Text>
          </TouchableOpacity>
        }
      />

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="rate_review" size={56} color={tc.gold} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyText, { color: tc.textSecondary }]}>Vous n'avez pas encore laisse d'avis</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => {
            const chapterId = review.chapter?.id || (review as any).chapterId || '';
            const chapterTitle = review.chapter?.title || (review as any).chapterTitle || '';
            const statusCfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.PENDING;
            const isEditing = editingId === review.id;
            const chapterProtagonistName = review.chapter?.protagonistName || '';
            const chapterCoverUrl = review.chapter?.coverUrl || null;

            return (
              <View key={review.id} style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
                {isEditing ? (
                  // --- Edit mode ---
                  <View>
                    <Text
                      style={[styles.cardTitle, { color: tc.text }]}
                    >{`${chapterProtagonistName ? `${chapterProtagonistName} - ` : ''}${chapterTitle}`}</Text>

                    <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Note</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <TouchableOpacity key={n} onPress={() => setEditRating(n)}>
                          <Icon
                            name={n <= editRating ? 'star' : 'star_border'}
                            size={32}
                            color={n <= editRating ? tc.gold : `${tc.gold}50`}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.fieldLabel, { color: tc.textSecondary }]}>Avis ({editText.trim().length}/2000)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                      value={editText}
                      onChangeText={setEditText}
                      multiline
                      maxLength={2000}
                      textAlignVertical="top"
                      placeholder="Decrivez votre experience..."
                      placeholderTextColor={tc.placeholder}
                    />
                    {editText.trim().length < 10 && editText.length > 0 && (
                      <Text style={styles.errorHint}>Minimum 10 caracteres requis</Text>
                    )}

                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          (isSaving || editText.trim().length < 10 || editRating === 0) && {
                            opacity: 0.5,
                          },
                        ]}
                        onPress={() => saveReview(chapterId)}
                        disabled={isSaving || editText.trim().length < 10 || editRating === 0}
                      >
                        <Text style={styles.saveButtonText}>
                          {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelEditButton, { backgroundColor: tc.surfaceSecondary }]}
                        onPress={cancelEdit}
                        disabled={isSaving}
                      >
                        <Text style={styles.cancelEditText}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.lg, width: '100%' }}>
                    {chapterCoverUrl ? (
                      <View>
                        <Image
                          source={{ uri: chapterCoverUrl }}
                          style={{ width: 100, height: 120, borderRadius: borderRadius.md }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 100,
                          height: 120,
                          borderRadius: borderRadius.md,
                          marginBottom: spacing.lg,
                          backgroundColor: colors.boudoir[800],
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Icon name="auto_stories" size={46} color={colors.gold} />
                      </View>
                    )}

                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[styles.cardTitle, { color: tc.text }]}
                          >{`${chapterProtagonistName ? `${chapterProtagonistName} - ` : ''}${chapterTitle}`}</Text>
                          <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Icon
                                key={n}
                                name={n <= review.rating ? 'star' : 'star_border'}
                                size={18}
                                color={n <= review.rating ? tc.gold : `${tc.gold}40`}
                              />
                            ))}
                            <Text style={[styles.ratingText, { color: tc.textSecondary }]}>{review.rating}/5</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Icon name={statusCfg.icon} size={14} color={statusCfg.color} />
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                              {statusCfg.label}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.dateText, { color: tc.textTertiary }]}>
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>

                      <Text style={[styles.reviewText, { color: tc.textSecondary }]}>{review.reviewText}</Text>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity onPress={() => startEdit(review)}>
                          <Text style={[styles.editLink, { color: tc.gold }]}>Modifier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteReview(chapterId)}>
                          <Text style={styles.deleteLink}>Supprimer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: spacing['4xl'] }} />

      {/* Chapter picker modal */}
      <Modal
        visible={showChapterPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChapterPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerContainer, { backgroundColor: tc.card }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: tc.cardBorder }]}>
              <Text style={[styles.pickerTitle, { color: tc.text }]}>Choisir un chapitre</Text>
              <TouchableOpacity
                onPress={() => setShowChapterPicker(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={22} color={tc.text} />
              </TouchableOpacity>
            </View>
            {loadingChapters ? (
              <ActivityIndicator
                size="large"
                color={tc.gold}
                style={{ paddingVertical: spacing['3xl'] }}
              />
            ) : chapters.length === 0 ? (
              <Text style={[styles.pickerEmpty, { color: tc.textSecondary }]}>Aucun chapitre disponible pour un nouvel avis</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {chapters.map((ch) => (
                  <TouchableOpacity
                    key={ch.id}
                    style={[styles.pickerItem, { borderBottomColor: tc.separator }]}
                    onPress={() => selectChapter(ch)}
                    activeOpacity={0.7}
                  >
                    {ch.coverUrl ? (
                      <Image
                        source={{ uri: ch.coverUrl }}
                        style={styles.pickerCover}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.pickerCover, styles.pickerCoverPlaceholder]}>
                        <Icon name="auto_stories" size={16} color={tc.gold} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerItemName, { color: tc.gold }]}>{ch.protagonistName}</Text>
                      <Text style={[styles.pickerItemText, { color: tc.text }]}>{ch.title}</Text>
                    </View>
                    <Icon name="chevron_right" size={18} color={tc.textTertiary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Review modal */}
      {reviewTarget && (
        <ChapterReviewModal
          visible={!!reviewTarget}
          onClose={onReviewModalClose}
          chapterId={reviewTarget.id}
          chapterTitle={reviewTarget.title}
          chapterProtagonistName={reviewTarget.protagonistName}
          chapterCoverUrl={reviewTarget.coverUrl}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    fontFamily: 'Newsreader_400Regular_Italic',
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
    fontSize: fontSize['2xl'],
    color: colors.charcoal,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  newReviewText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.base,
    color: colors.gray[500],
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
    padding: spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    width: '100%',
  },
  cardTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },
  reviewText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  editLink: {
    fontSize: fontSize.sm,
    color: colors.gold,
    fontWeight: '500',
  },
  deleteLink: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '500',
  },

  // Edit mode
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.gray[500],
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.charcoal,
    minHeight: 120,
  },
  errorHint: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelEditText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray[600],
  },

  // Chapter picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  pickerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.charcoal,
  },
  pickerEmpty: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
    fontFamily: 'Newsreader_400Regular_Italic',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  pickerCover: {
    width: 40,
    height: 55,
    borderRadius: borderRadius.md,
  },
  pickerCoverPlaceholder: {
    backgroundColor: colors.boudoir[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemName: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fontSize.xl,
    color: colors.gold,
    marginBottom: -2,
  },
  pickerItemText: {
    fontSize: fontSize.sm,
    color: colors.charcoal,
  },
});

export default MyReviewsScreen;
