import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '@/services/api/client';
import Icon from '@/components/Icon';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

interface NotificationPref {
  category: string;
  email: boolean;
  push: boolean;
}

const CATEGORY_META: Record<string, { label: string; description: string; icon: string }> = {
  'new-chapters': {
    label: 'Nouveaux chapitres',
    description: 'Recevez une notification pour les nouvelles publications',
    icon: 'auto_stories',
  },
  promotions: {
    label: 'Promotions et offres',
    description: 'Restez informe des offres speciales et reductions',
    icon: 'sell',
  },
  reviews: {
    label: 'Reponses aux avis',
    description: "Notifications lorsque quelqu'un repond a vos avis",
    icon: 'rate_review',
  },
  newsletter: {
    label: 'Newsletter',
    description: 'Recevez notre newsletter hebdomadaire',
    icon: 'mail',
  },
};

export default function NotificationsScreen() {
  const tc = useThemeColors();
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const fetchPrefs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/me/notification-preferences');
      setPrefs(res.data?.data ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les preferences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const toggle = async (category: string, field: 'email' | 'push') => {
    const updated = prefs.map((p) =>
      p.category === category ? { ...p, [field]: !p[field] } : p
    );
    setPrefs(updated);
    setSaving(category);
    try {
      await api.put('/me/notification-preferences', {
        preferences: [updated.find((p) => p.category === category)!],
      });
    } catch {
      // Revert on error
      setPrefs(prefs);
    } finally {
      setSaving(null);
    }
  };

  const handleTestNotification = async () => {
    setSendingTest(true);
    try {
      await api.post('/me/test-notification');
      Alert.alert('Envoye', 'Une notification de test a ete envoyee a vos appareils.');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification. Verifiez que vous avez autorise les notifications.');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Notifications" subtitle="Gerez vos alertes et rappels" />

      <View style={styles.section}>
        {prefs.map((pref) => {
          const meta = CATEGORY_META[pref.category] || {
            label: pref.category,
            description: '',
            icon: 'notifications',
          };
          return (
            <View
              key={pref.category}
              style={[styles.card, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
            >
              <View style={styles.cardHeader}>
                <Icon name={meta.icon} size={24} color={tc.gold} />
                <View style={styles.cardTextBlock}>
                  <Text style={[styles.cardTitle, { color: tc.text }]}>{meta.label}</Text>
                  <Text style={[styles.cardDescription, { color: tc.textSecondary }]}>
                    {meta.description}
                  </Text>
                </View>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleItem}>
                  <Switch
                    value={pref.email}
                    onValueChange={() => toggle(pref.category, 'email')}
                    trackColor={{ false: tc.separator, true: tc.gold }}
                    thumbColor="#FFFFFF"
                    disabled={saving === pref.category}
                  />
                  <View style={styles.toggleLabel}>
                    <Icon name="mail" size={16} color={tc.textSecondary} />
                    <Text style={[styles.toggleText, { color: tc.text }]}>Email</Text>
                  </View>
                </View>

                <View style={styles.toggleItem}>
                  <Switch
                    value={pref.push}
                    onValueChange={() => toggle(pref.category, 'push')}
                    trackColor={{ false: tc.separator, true: tc.gold }}
                    thumbColor="#FFFFFF"
                    disabled={saving === pref.category}
                  />
                  <View style={styles.toggleLabel}>
                    <Icon name="notifications" size={16} color={tc.textSecondary} />
                    <Text style={[styles.toggleText, { color: tc.text }]}>Push</Text>
                  </View>
                </View>

                {saving === pref.category && (
                  <ActivityIndicator size="small" color={tc.gold} />
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Test notification */}
      <View style={styles.section}>
        <View style={[styles.testCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
          <Icon name="notifications_active" size={28} color={tc.gold} />
          <Text style={[styles.testTitle, { color: tc.text }]}>Tester les notifications</Text>
          <Text style={[styles.testDesc, { color: tc.textSecondary }]}>
            Envoyez une notification de test pour verifier que tout fonctionne.
          </Text>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: tc.gold }]}
            onPress={handleTestNotification}
            disabled={sendingTest}
            activeOpacity={0.8}
          >
            {sendingTest ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="send" size={16} color="#FFFFFF" />
                <Text style={styles.testButtonText}>Envoyer un test</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: fs.sm,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing['2xl'],
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleText: {
    fontSize: fs.sm,
  },
  testCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  testTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    marginTop: spacing.xs,
  },
  testDesc: {
    fontSize: fs.sm,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  testButtonText: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
