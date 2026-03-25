import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import Icon from '@/components/Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  route?: string;
  comingSoon?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Ma Bibliotheque',
    items: [
      {
        id: 'my-books',
        label: 'Mes Livres',
        icon: 'auto_stories',
        description: 'Vos chapitres et votre progression de lecture',
        route: '/account/my-books',
      },
      {
        id: 'purchases',
        label: 'Mes Achats',
        icon: 'receipt_long',
        description: 'Historique de vos achats et factures',
        route: '/account/purchases',
      },
      {
        id: 'promotions',
        label: 'Mes Promotions',
        icon: 'card_giftcard',
        description: 'Codes promo et offres speciales',
        route: '/account/promotions',
      },
    ],
  },
  {
    title: 'Interactions',
    items: [
      {
        id: 'reviews',
        label: 'Mes Avis',
        icon: 'rate_review',
        description: 'Vos critiques et evaluations',
        route: '/account/my-reviews',
      },
      {
        id: 'custom-stories',
        label: 'Mes Demandes',
        icon: 'auto_awesome',
        description: 'Vos demandes d\'histoires personnalisees',
        route: '/account/my-requests',
      },
      {
        id: 'claims',
        label: 'Support',
        icon: 'support_agent',
        description: 'Vos demandes d\'assistance',
        route: '/account/support',
      },
    ],
  },
  {
    title: 'Abonnement',
    items: [
      {
        id: 'subscription',
        label: 'Mon Abonnement',
        icon: 'card_membership',
        description: 'Gerez votre abonnement Club Prive',
        route: '/account/subscription',
      },
      {
        id: 'payment-info',
        label: 'Moyens de Paiement',
        icon: 'credit_card',
        description: 'Cartes et methodes de paiement',
        route: '/account/payment-info',
      },
    ],
  },
  {
    title: 'Parametres',
    items: [
      {
        id: 'account-info',
        label: 'Mon Compte',
        icon: 'account_circle',
        description: 'Informations personnelles et mot de passe',
        route: '/account/account-info',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: 'tune',
        description: 'Theme, langue et preferences de lecture',
        route: '/settings',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'notifications',
        description: 'Gerez vos alertes et rappels',
        route: '/account/notifications',
      },
      {
        id: 'devices',
        label: 'Appareils Connectes',
        icon: 'devices',
        description: 'Sessions actives et securite',
        route: '/account/devices',
      },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const tc = useThemeColors();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Etes-vous sur de vouloir vous deconnecter ?')) {
        await logout();
        router.replace('/(auth)/login');
      }
    } else {
      Alert.alert(
        'Deconnexion',
        'Etes-vous sur de vouloir vous deconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Se deconnecter',
            style: 'destructive',
            onPress: async () => {
              await logout();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    }
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.comingSoon) return;
    if (item.route) router.push(item.route);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tc.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: tc.background }]}>
        <Text style={[styles.headerName, { color: tc.text }]}>
          {user?.firstName || 'Cher'} {user?.lastName || 'Lecteur'}
        </Text>
        <Text style={[styles.headerEmail, { color: tc.textSecondary }]}>{user?.email}</Text>
        <View style={[styles.headerDivider, { backgroundColor: tc.gold }]} />
      </View>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tc.text }]}>{section.title}</Text>
          <View style={styles.sectionCards}>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: tc.card, borderColor: tc.cardBorder },
                  item.comingSoon && styles.cardDisabled,
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={item.comingSoon ? 1 : 0.7}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: tc.badgeBg }]}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.comingSoon ? tc.textTertiary : tc.gold}
                  />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[
                        styles.cardLabel,
                        { color: tc.text },
                        item.comingSoon && { color: tc.textTertiary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.comingSoon && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Bientot</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.cardDesc,
                      { color: tc.textSecondary },
                      item.comingSoon && { color: tc.textTertiary },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
                {!item.comingSoon && (
                  <Icon name="chevron_right" size={20} color={tc.textTertiary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
        <Icon name="logout" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Se deconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing['4xl'] + spacing.xl,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.boudoir[950],
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 2,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: fs['3xl'],
    color: colors.gold,
  },
  headerName: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['4xl'],
    marginBottom: spacing.xs,
  },
  headerEmail: {
    fontSize: fs.sm,
    color: colors.boudoir[200],
  },
  headerDivider: {
    width: 50,
    height: 1,
    backgroundColor: colors.gold,
    marginTop: spacing.xl,
  },

  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: colors.charcoal,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  },
  sectionCards: {
    gap: spacing.sm,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardLabel: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
  },
  cardLabelDisabled: {
    color: colors.gray[500],
  },
  cardDesc: {
    fontSize: fs.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  cardDescDisabled: {
    color: colors.gray[400],
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing['3xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  logoutText: {
    fontSize: fs.base,
    fontWeight: '600',
    color: '#DC2626',
  },
});
