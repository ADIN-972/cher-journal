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

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const DEVICE_ICONS: Record<Device['type'], string> = {
  desktop: 'computer',
  mobile: 'smartphone',
  tablet: 'tablet',
};

export default function DevicesScreen() {
  const tc = useThemeColors();
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Windows PC',
      type: 'desktop',
      browser: 'Chrome 120',
      location: 'Paris, France',
      lastActive: '2024-01-15T10:00:00Z',
      isCurrent: true,
    },
    {
      id: '2',
      name: 'iPhone 13',
      type: 'mobile',
      browser: 'Safari iOS',
      location: 'Paris, France',
      lastActive: '2024-01-14T18:30:00Z',
      isCurrent: false,
    },
    {
      id: '3',
      name: 'iPad Pro',
      type: 'tablet',
      browser: 'Safari iPadOS',
      location: 'Lyon, France',
      lastActive: '2024-01-10T14:20:00Z',
      isCurrent: false,
    },
  ]);

  const formatLastActive = (date: string) => {
    const now = new Date();
    const deviceDate = new Date(date);
    const diffMs = now.getTime() - deviceDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const handleRevokeDevice = (deviceId: string) => {
    Alert.alert(
      'Deconnecter',
      'Etes-vous sur de vouloir deconnecter cet appareil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnecter',
          style: 'destructive',
          onPress: () => {
            setDevices(devices.filter((d) => d.id !== deviceId));
            // TODO: Call API to revoke device session
          },
        },
      ]
    );
  };

  const handleRevokeAll = () => {
    Alert.alert(
      'Deconnecter tous les appareils',
      'Etes-vous sur de vouloir deconnecter tous les autres appareils ? Seule votre session actuelle sera conservee.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnecter tout',
          style: 'destructive',
          onPress: () => {
            setDevices(devices.filter((d) => d.isCurrent));
            // TODO: Call API to revoke all other sessions
            Alert.alert('Succes', 'Tous les autres appareils ont ete deconnectes.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: tc.background }]}>
      <ScreenHeader title="Appareils Connectes" subtitle="Sessions actives et securite" />

      {/* Security Info Banner */}
      <View style={styles.section}>
        <View style={styles.securityBanner}>
          <Icon name="info" size={22} color="#2563EB" />
          <View style={styles.securityTextBlock}>
            <Text style={styles.securityTitle}>Conseil de securite</Text>
            <Text style={styles.securityDescription}>
              Si vous ne reconnaissez pas un appareil, deconnectez-le immediatement et changez votre mot de passe.
            </Text>
          </View>
        </View>
      </View>

      {/* Devices List */}
      <View style={styles.section}>
        {devices.map((device) => (
          <View
            key={device.id}
            style={[
              styles.card,
              { backgroundColor: tc.card, borderColor: tc.cardBorder },
              device.isCurrent && { borderColor: tc.gold },
            ]}
          >
            <View style={styles.cardContent}>
              {/* Device Icon */}
              <View style={[styles.deviceIcon, { backgroundColor: tc.separatorLight }, device.isCurrent && styles.deviceIconCurrent]}>
                <Icon
                  name={DEVICE_ICONS[device.type]}
                  size={26}
                  color={device.isCurrent ? tc.gold : tc.textSecondary}
                />
              </View>

              {/* Device Info */}
              <View style={styles.deviceInfo}>
                <View style={styles.deviceTitleRow}>
                  <Text style={[styles.deviceName, { color: tc.text }]}>{device.name}</Text>
                  {device.isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: tc.gold }]}>
                      <Text style={styles.currentBadgeText}>Actuel</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Icon name="web" size={16} color={tc.textTertiary} />
                  <Text style={[styles.detailText, { color: tc.textSecondary }]}>{device.browser}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="location_on" size={16} color={tc.textTertiary} />
                  <Text style={[styles.detailText, { color: tc.textSecondary }]}>{device.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={16} color={tc.textTertiary} />
                  <Text style={[styles.detailText, { color: tc.textSecondary }]}>{formatLastActive(device.lastActive)}</Text>
                </View>
              </View>

              {/* Revoke Button */}
              {!device.isCurrent && (
                <TouchableOpacity
                  onPress={() => handleRevokeDevice(device.id)}
                  activeOpacity={0.7}
                  style={styles.revokeButton}
                >
                  <Icon name="logout" size={22} color={tc.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Revoke All Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.revokeAllButton}
          onPress={handleRevokeAll}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={18} color={tc.error} />
          <Text style={[styles.revokeAllText, { color: tc.error }]}>Deconnecter tous les autres appareils</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardCurrent: {
    borderColor: colors.gold,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconCurrent: {
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  deviceName: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.lg,
    color: colors.charcoal,
  },
  currentBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  detailText: {
    fontSize: fs.sm,
    color: colors.gray[500],
  },
  revokeButton: {
    padding: spacing.sm,
  },
  revokeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.25)',
    paddingVertical: spacing.lg,
  },
  revokeAllText: {
    fontSize: fs.sm,
    fontWeight: '700',
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
