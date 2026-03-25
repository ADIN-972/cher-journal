import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supportAPI, type SupportClaim, type SupportClaimData, type SupportMessage } from '@/services/api/chapters';
import Icon from '@/components/Icon';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';
import ScreenHeader from '@/components/ScreenHeader';

type Category = SupportClaimData['category'];

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'TECHNICAL', label: 'Technique', icon: 'bug_report' },
  { id: 'BILLING', label: 'Facturation', icon: 'receipt' },
  { id: 'CONTENT', label: 'Contenu', icon: 'library_books' },
  { id: 'OTHER', label: 'Autre', icon: 'help' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  OPEN: { label: 'Ouvert', color: '#DC2626', bg: 'rgba(220,38,38,0.1)', icon: 'error' },
  IN_PROGRESS: { label: 'En cours', color: '#D97706', bg: 'rgba(217,119,6,0.1)', icon: 'pending' },
  RESOLVED: { label: 'Resolu', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', icon: 'check_circle' },
  CLOSED: { label: 'Ferme', color: '#16A34A', bg: 'rgba(22,163,74,0.1)', icon: 'task_alt' },
};

export default function SupportScreen() {
  const router = useRouter();
  const tc = useThemeColors();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<Category>('TECHNICAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Claims list state
  const [claims, setClaims] = useState<SupportClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [claimMessages, setClaimMessages] = useState<Record<string, SupportMessage[]>>({});
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      const data = await supportAPI.getMyClaims();
      setClaims(data);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchClaims();
    }, [fetchClaims])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner un sujet.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      Alert.alert('Erreur', 'Le message doit contenir au moins 10 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await supportAPI.submitClaim({ category, subject: subject.trim(), message: message.trim() });
      Alert.alert('Envoye', 'Votre reclamation a ete envoyee avec succes.');
      setSubject('');
      setMessage('');
      setCategory('TECHNICAL');
      setShowForm(false);
      fetchClaims();
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'envoyer votre reclamation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tc.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tc.gold} />
      }
    >
      <ScreenHeader title="Support & Reclamations" subtitle="Besoin d'aide ? Contactez notre equipe." />

      {/* New ticket button */}
      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        <TouchableOpacity
          style={[styles.newTicketBtn, { backgroundColor: tc.gold }, showForm && { backgroundColor: tc.cardBorder }]}
          onPress={() => setShowForm(!showForm)}
          activeOpacity={0.8}
        >
          <Icon name={showForm ? 'close' : 'add'} size={20} color={showForm ? tc.text : colors.white} />
          <Text style={[styles.newTicketText, showForm && { color: tc.text }]}>
            {showForm ? 'Annuler' : 'Nouveau ticket'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form — hidden by default */}
      {showForm && (
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: tc.text }]}>Nouvelle demande</Text>

          {/* Category selection */}
          <Text style={[styles.label, { color: tc.text }]}>Categorie</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryBtn, { backgroundColor: tc.card, borderColor: tc.cardBorder }, category === cat.id && styles.categoryBtnActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Icon
                  name={cat.icon}
                  size={20}
                  color={category === cat.id ? tc.gold : tc.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: tc.textSecondary },
                    category === cat.id && { color: tc.text },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subject */}
          <Text style={[styles.label, { color: tc.text }]}>Sujet</Text>
          <TextInput
            style={[styles.input, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Decrivez brievement votre probleme..."
            placeholderTextColor={tc.placeholder}
          />

          {/* Message */}
          <Text style={[styles.label, { color: tc.text }]}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Decrivez votre probleme en detail..."
            placeholderTextColor={tc.placeholder}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: tc.card }]}
              onPress={() => setShowForm(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon name="send" size={18} color={colors.white} />
                  <Text style={styles.submitText}>Envoyer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Claims list — always visible */}
      <View style={[styles.claimsSection, { borderTopColor: tc.separator }]}>
        <Text style={[styles.sectionTitle, { color: tc.text }]}>
          Mes reclamations ({claims.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={tc.gold} style={{ marginTop: spacing.xl }} />
        ) : claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="support_agent" size={48} color={`${tc.gold}50`} />
            <Text style={[styles.emptyText, { color: tc.textSecondary }]}>Aucune reclamation pour le moment</Text>
          </View>
        ) : (
          claims.map((claim) => {
            const statusCfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.OPEN;
            const isExpanded = expandedId === claim.id;

            return (
              <View
                key={claim.id}
                style={[styles.claimCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
              >
                {/* Header — tappable to expand/collapse */}
                <TouchableOpacity
                  onPress={() => {
                    if (isExpanded) {
                      setExpandedId(null);
                      setReplyText('');
                    } else {
                      setExpandedId(claim.id);
                      // Load messages for this claim
                      supportAPI.getClaimMessages(claim.id).then((full) => {
                        setClaimMessages((prev) => ({ ...prev, [claim.id]: full.messages || [] }));
                      }).catch(() => {});
                    }
                  }}
                  activeOpacity={0.7}
                >
                <View style={styles.claimHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.claimSubject, { color: tc.text }]} numberOfLines={isExpanded ? undefined : 1}>
                      {claim.subject}
                    </Text>
                    <View style={styles.claimMeta}>
                      <Text style={[styles.claimCategory, { color: tc.textSecondary }]}>
                        {CATEGORIES.find((c) => c.id === claim.category)?.label || claim.category}
                      </Text>
                      <Text style={[styles.claimDot, { color: tc.textTertiary }]}>-</Text>
                      <Text style={[styles.claimDate, { color: tc.textTertiary }]}>
                        {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Icon name={statusCfg.icon} size={12} color={statusCfg.color} />
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.claimExpandIndicator}>
                  <Icon
                    name={isExpanded ? 'expand_less' : 'expand_more'}
                    size={20}
                    color={tc.textTertiary}
                  />
                </View>
                </TouchableOpacity>

                {/* Expanded: conversation (outside TouchableOpacity to prevent collapse on tap) */}
                {isExpanded && (
                  <View style={[styles.claimBody, { borderTopColor: tc.separatorLight }]}>
                    {/* Messages */}
                    {(claimMessages[claim.id] || []).length > 0 ? (
                      (claimMessages[claim.id] || []).map((msg) => (
                        <View
                          key={msg.id}
                          style={[
                            styles.msgBubble,
                            msg.role === 'ADMIN' ? styles.msgAdmin : styles.msgUser,
                          ]}
                        >
                          <Text style={styles.msgRole}>
                            {msg.role === 'ADMIN' ? 'Support' : 'Vous'}
                            {' · '}
                            {new Date(msg.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.msgContent}>{msg.content}</Text>
                        </View>
                      ))
                    ) : (
                      /* Legacy fallback */
                      <>
                        <View style={[styles.msgBubble, styles.msgUser]}>
                          <Text style={styles.msgRole}>Vous</Text>
                          <Text style={styles.msgContent}>{claim.message}</Text>
                        </View>
                        {claim.adminNote && (
                          <View style={[styles.msgBubble, styles.msgAdmin]}>
                            <Text style={styles.msgRole}>Support</Text>
                            <Text style={styles.msgContent}>{claim.adminNote}</Text>
                          </View>
                        )}
                      </>
                    )}

                    {/* Reply input */}
                    {claim.status !== 'CLOSED' && (
                      <View style={styles.replyRow}>
                        <TextInput
                          style={[styles.replyInput, { backgroundColor: tc.inputBg, borderColor: tc.inputBorder, color: tc.text }]}
                          value={expandedId === claim.id ? replyText : ''}
                          onChangeText={setReplyText}
                          placeholder="Ecrire un message..."
                          placeholderTextColor={tc.placeholder}
                        />
                        <TouchableOpacity
                          style={[styles.replyBtn, (!replyText.trim() || sendingReply) && { opacity: 0.4 }]}
                          disabled={!replyText.trim() || sendingReply}
                          onPress={async () => {
                            if (!replyText.trim()) return;
                            setSendingReply(true);
                            try {
                              await supportAPI.addMessage(claim.id, replyText.trim());
                              setReplyText('');
                              const full = await supportAPI.getClaimMessages(claim.id);
                              setClaimMessages((prev) => ({ ...prev, [claim.id]: full.messages || [] }));
                              fetchClaims();
                            } catch { /* ignore */ }
                            setSendingReply(false);
                          }}
                        >
                          <Icon name="send" size={18} color={colors.white} />
                        </TouchableOpacity>
                      </View>
                    )}

                    {claim.status === 'RESOLVED' && (
                      <Text style={styles.resolvedHint}>
                        Ticket resolu. Repondre le reouvrira automatiquement.
                      </Text>
                    )}
                    {claim.status === 'CLOSED' && (
                      <Text style={styles.resolvedHint}>
                        Ticket ferme. Creez un nouveau ticket si besoin.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: spacing['4xl'] }} />
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

  // Quick help
  quickHelp: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickHelpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickHelpText: {
    fontSize: fs.xs,
    color: colors.gray[600],
  },

  // New ticket button
  newTicketBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  newTicketBtnActive: {
    backgroundColor: colors.gray[200],
  },
  newTicketText: {
    fontSize: fs.base,
    fontWeight: '700' as const,
    color: colors.white,
  },
  newTicketTextActive: {
    color: colors.charcoal,
  },

  // Form section
  formSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  categoryBtnActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  categoryLabel: {
    fontSize: fs.sm,
    fontWeight: '500',
    color: colors.gray[500],
  },
  categoryLabelActive: {
    color: colors.charcoal,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fs.base,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 120,
  },
  formActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  cancelText: {
    fontSize: fs.base,
    fontWeight: '600' as const,
    color: colors.gray[600],
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: fs.base,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Claims section
  claimsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.xl,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fs.sm,
    color: colors.gray[500],
    fontStyle: 'italic',
  },

  // Claim card
  claimCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  claimSubject: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 4,
  },
  claimMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  claimCategory: {
    fontSize: fs.xs,
    color: colors.gray[500],
  },
  claimDot: {
    fontSize: fs.xs,
    color: colors.gray[400],
  },
  claimDate: {
    fontSize: fs.xs,
    color: colors.gray[400],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Expanded body
  claimBody: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  claimBodyLabel: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  claimMessage: {
    fontSize: fs.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },

  // Admin response
  adminResponse: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(37,99,235,0.05)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
    padding: spacing.lg,
  },
  adminResponseLabel: {
    fontSize: fs.xs,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: spacing.sm,
  },
  adminResponseText: {
    fontSize: fs.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  adminResponseDate: {
    fontSize: fs.xs,
    color: '#2563EB',
    marginTop: spacing.sm,
    opacity: 0.7,
  },

  // Expand indicator
  claimExpandIndicator: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  // Message bubbles
  msgBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  msgUser: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    alignSelf: 'flex-start' as const,
    maxWidth: '85%' as any,
  },
  msgAdmin: {
    backgroundColor: 'rgba(37,99,235,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.12)',
    alignSelf: 'flex-end' as const,
    maxWidth: '85%' as any,
  },
  msgRole: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.gray[400],
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 4,
  },
  msgContent: {
    fontSize: fs.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },

  // Reply
  replyRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fs.sm,
    color: colors.charcoal,
    backgroundColor: colors.white,
  },
  replyBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gold,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  resolvedHint: {
    fontSize: fs.xs,
    color: colors.gray[400],
    fontStyle: 'italic' as const,
    marginTop: spacing.sm,
  },
});
