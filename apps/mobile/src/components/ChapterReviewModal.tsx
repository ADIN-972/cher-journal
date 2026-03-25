import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from '@/components/Icon';
import { reviewsAPI } from '@/services/api/chapters';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import { Image } from 'expo-image';

interface ChapterReviewModalProps {
  visible: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle: string;
  chapterProtagonistName?: string;
  chapterCoverUrl?: string | null;
}

export default function ChapterReviewModal({
  visible,
  onClose,
  chapterId,
  chapterTitle,
  chapterProtagonistName,
  chapterCoverUrl,
}: ChapterReviewModalProps) {
  const tc = useThemeColors();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (visible && chapterId) {
      loadExistingReview();
    } else {
      setRating(0);
      setReviewText('');
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [visible, chapterId]);

  const loadExistingReview = async () => {
    setIsLoading(true);
    try {
      const existing = await reviewsAPI.getUserReview(chapterId);
      if (existing) {
        setRating(existing.rating);
        setReviewText(existing.reviewText);
      }
    } catch {
      // No existing review - keep form empty
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await reviewsAPI.createOrUpdate({
        chapterId,
        rating,
        reviewText: reviewText.trim(),
      });

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.userMessage || err.message || "Erreur lors de l'envoi");
      setIsSubmitting(false);
    }
  };

  const canSubmit = rating > 0 && reviewText.trim().length >= 10 && !isSubmitting && !success;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: tc.background }]}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerTitle, { color: tc.gold }]}>Mes Impressions</Text>
                <Text style={[styles.headerSubtitle, { color: tc.textSecondary }]} numberOfLines={1}>
                  {`${chapterProtagonistName ? `${chapterProtagonistName} - ` : ''}${chapterTitle}`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color={tc.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={tc.gold} />
                  <Text style={[styles.loadingText, { color: tc.textSecondary }]}>Chargement...</Text>
                </View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: spacing.lg,
                      marginBottom: spacing.lg,
                      //justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      {chapterCoverUrl ? (
                        <Image
                          source={{ uri: chapterCoverUrl }}
                          style={{
                            width: 100,
                            height: 120,
                            borderRadius: borderRadius.md,
                            marginBottom: spacing.lg,
                          }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={[
                            {
                              width: 100,
                              height: 120,
                              borderRadius: borderRadius.md,
                              marginBottom: spacing.lg,
                              backgroundColor: tc.boudoir800,
                              justifyContent: 'center',
                              alignItems: 'center',
                            },
                          ]}
                        >
                          <Icon name="auto_stories" size={46} color={tc.gold} />
                        </View>
                      )}
                    </View>
                    <View>
                      {/* Intro */}
                      <View style={styles.introRow}>
                        <Icon name="history_edu" size={20} color={tc.gold} />
                        <Text style={[styles.introTitle, { color: tc.text }]}>Confiez vos ressentis</Text>
                      </View>
                      <Text style={[styles.introText, { color: tc.textSecondary }]}>
                        Vos mots resteront secrets jusqu'a leur validation.
                      </Text>

                      {/* Error */}
                      {error && (
                        <View style={styles.errorBox}>
                          <Icon name="error" size={18} color={colors.error} />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      )}

                      {/* Success */}
                      {success && (
                        <View style={styles.successBox}>
                          <Icon name="check_circle" size={18} color={colors.gold} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.successTitle}>
                              Votre impression a ete confiee avec succes !
                            </Text>
                            <Text style={styles.successSubtitle}>
                              Elle sera visible apres validation.
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Rating */}
                      <Text style={styles.label}>Note de lecture</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            activeOpacity={0.7}
                          >
                            <Icon
                              name={star <= rating ? 'star' : 'star_border'}
                              size={36}
                              color={star <= rating ? colors.gold : `${colors.gold}50`}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                  {/* Review Text */}
                  <TextInput
                    style={[styles.textInput, { backgroundColor: tc.card, color: tc.text }]}
                    multiline
                    placeholder="Qu'avez-vous ressenti au fil des pages ?"
                    placeholderTextColor={tc.placeholder}
                    value={reviewText}
                    onChangeText={setReviewText}
                    maxLength={2000}
                    textAlignVertical="top"
                  />
                  <View style={styles.charCountRow}>
                    <View style={styles.statusBadge}>
                      <Icon name="visibility_off" size={12} color={colors.gold} />
                      <Text style={[styles.statusText, { color: tc.textSecondary }]}>En attente de murmure</Text>
                    </View>
                    <Text style={[styles.charCount, { color: tc.textTertiary }]}>{reviewText.length}/2000</Text>
                  </View>

                  {/* Submit */}
                  <TouchableOpacity
                    style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={colors.boudoir[900]} />
                    ) : success ? (
                      <>
                        <Icon name="check" size={16} color={colors.boudoir[900]} />
                        <Text style={styles.submitText}>Envoye</Text>
                      </>
                    ) : (
                      <Text style={styles.submitText}>Confier mon secret</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.gold}20`,
  },
  headerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize['2xl'],
    color: colors.gold,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
    maxWidth: 260,
  },

  // Body
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  // Intro
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  introTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.lg,
    color: colors.charcoal,
  },
  introText: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginBottom: spacing.lg,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.error}10`,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },

  // Success
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.gold}10`,
    borderWidth: 1,
    borderColor: `${colors.gold}30`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: fontSize.sm,
    color: colors.gold,
    fontWeight: '700',
  },
  successSubtitle: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Rating
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: `${colors.gold}90`,
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },

  // Text input
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: `${colors.gold}30`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.base,
    fontFamily: 'Newsreader_400Regular_Italic',
    color: colors.charcoal,
    minHeight: 160,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.gold}08`,
    borderWidth: 1,
    borderColor: `${colors.gold}15`,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.gray[500],
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.gray[400],
  },

  // Submit
  submitButton: {
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: 24,
    marginBottom: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.boudoir[900],
  },
});
