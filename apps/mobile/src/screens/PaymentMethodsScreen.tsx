import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from '@/components/Icon';
import ScreenHeader from '@/components/ScreenHeader';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors } from '@/theme/ThemeContext';

interface PaymentMethod {
  id: string;
  type: 'card';
  cardBrand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
};

export default function PaymentMethodsScreen() {
  const tc = useThemeColors();
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      cardBrand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardBrand: 'mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const handleSetDefault = (methodId: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === methodId,
      }))
    );
    // TODO: Call API to set default payment method
    Alert.alert('Succes', 'Moyen de paiement par defaut mis a jour.');
  };

  const handleRemove = (methodId: string) => {
    Alert.alert(
      'Supprimer',
      'Etes-vous sur de vouloir supprimer ce moyen de paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setMethods(methods.filter((m) => m.id !== methodId));
            // TODO: Call API to remove payment method
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    // TODO: Navigate to Stripe add card flow
    Alert.alert('Bientot disponible', 'L\'ajout de moyen de paiement sera bientot disponible.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Moyens de Paiement" subtitle="Cartes et methodes de paiement" />

      {/* Payment Methods List */}
      <View style={styles.section}>
        {methods.map((method) => (
          <View
            key={method.id}
            style={[
              styles.card,
              { backgroundColor: tc.card, borderColor: tc.cardBorder },
              method.isDefault && { borderColor: tc.gold },
            ]}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View style={[styles.cardIcon, { backgroundColor: tc.separatorLight }, method.isDefault && styles.cardIconDefault]}>
                <Icon
                  name="credit_card"
                  size={28}
                  color={method.isDefault ? tc.gold : tc.textSecondary}
                />
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardBrand, { color: tc.text }]}>
                    {BRAND_LABELS[method.cardBrand] || method.cardBrand}
                  </Text>
                  {method.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: tc.gold }]}>
                      <Text style={styles.defaultBadgeText}>Par defaut</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardNumber, { color: tc.text }]}>
                  **** **** **** {method.last4}
                </Text>
                <Text style={[styles.cardExpiry, { color: tc.textSecondary }]}>
                  Expire {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.cardActions, { borderTopColor: tc.separatorLight }]}>
              {!method.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(method.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.setDefaultText, { color: tc.gold }]}>Definir par defaut</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleRemove(method.id)}
                activeOpacity={0.7}
                style={styles.removeButton}
              >
                <Icon name="delete" size={20} color={tc.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add Payment Method */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}
          onPress={handleAddPayment}
          activeOpacity={0.7}
        >
          <Icon name="add" size={22} color={tc.gold} />
          <Text style={[styles.addButtonText, { color: tc.text }]}>Ajouter un moyen de paiement</Text>
        </TouchableOpacity>
      </View>

      {/* Security Info Banner */}
      <View style={styles.section}>
        <View style={styles.securityBanner}>
          <Icon name="verified_user" size={22} color="#2563EB" />
          <View style={styles.securityTextBlock}>
            <Text style={styles.securityTitle}>Paiements securises</Text>
            <Text style={styles.securityDescription}>
              Toutes vos informations de paiement sont cryptees et securisees. Nous utilisons Stripe pour traiter les paiements.
            </Text>
          </View>
        </View>
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardDefault: {
    borderColor: colors.gold,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconDefault: {
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardBrand: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: colors.charcoal,
  },
  defaultBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  cardNumber: {
    fontSize: fs.base,
    fontWeight: '500',
    color: colors.charcoal,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  setDefaultText: {
    fontSize: fs.sm,
    fontWeight: '600',
    color: colors.gold,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    paddingVertical: spacing.xl,
  },
  addButtonText: {
    fontSize: fs.base,
    fontWeight: '600',
    color: colors.charcoal,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(37,99,235,0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.2)',
    padding: spacing.lg,
  },
  securityTextBlock: {
    flex: 1,
  },
  securityTitle: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: '#1E3A5F',
    marginBottom: spacing.xs,
  },
  securityDescription: {
    fontSize: fs.sm,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
