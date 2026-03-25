import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Icon from './Icon';
import { useThemeColors } from '@/theme/ThemeContext';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import api from '@/services/api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = (SCREEN_WIDTH - spacing.xs * 2 - spacing.xs) / 2;

interface ColoringPage {
  id: string;
  title: string;
  pageNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface ColoringGalleryProps {
  chapterId: string;
  protagonistName?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';

const ColoringGallery: React.FC<ColoringGalleryProps> = ({ chapterId, protagonistName }) => {
  const tc = useThemeColors();
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/chapters/${chapterId}/assets?tag=coloring`);
        if (response.data?.success && response.data?.data) {
          setPages(
            response.data.data.map((asset: any, index: number) => ({
              id: asset.id,
              title: asset.label || `Illustration ${index + 1}`,
              pageNumber: index + 1,
              imageUrl: asset.url?.startsWith('http') ? asset.url : `${API_BASE_URL}${asset.url}`,
              thumbnailUrl: asset.thumbnailUrl,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch coloring pages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (chapterId) fetchPages();
  }, [chapterId]);

  const hasPages = pages.length > 0;

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { color: tc.text }]}>
          Livre de <Text style={[styles.heroAccent, { color: tc.rose }]}>Coloriage</Text>
        </Text>
        <Text style={[styles.heroText, { color: tc.textSecondary }]}>
          Plongez dans l'intimite de nos creations. Des designs exclusifs faconnes avec soin pour
          sublimer chaque chapitre.
        </Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.features}>
        <FeatureCard
          icon="palette"
          title="Designs Exclusifs"
          subtitle="Illustrations haute couture"
          iconColor={colors.rose}
        />
        <FeatureCard
          icon="cloud_download"
          title="Telechargement"
          subtitle="Qualite 4K prete a imprimer"
          iconColor="#f59e0b"
        />
        <FeatureCard
          icon="collections"
          title="Galerie Personnelle"
          subtitle="Sauvegardez vos oeuvres"
          iconColor={colors.gray[500]}
        />
      </View>

      {/* Gallery Section */}
      <View style={[styles.galleryCard, { backgroundColor: tc.card }]}>
        {/* Header */}
        <View style={[styles.galleryHeader, { borderBottomColor: tc.separatorLight }]}>
          <Text style={[styles.galleryTitle, { color: tc.text }]}>Collection : {protagonistName || 'Boudoir'}</Text>
          {!hasPages && !isLoading && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Bientot disponible</Text>
              <View style={styles.comingSoonDot} />
            </View>
          )}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tc.rose} />
            <Text style={[styles.loadingText, { color: tc.textSecondary }]}>Chargement des creations...</Text>
          </View>
        ) : hasPages ? (
          <View style={styles.grid}>
            {pages.map((page) => (
              <TouchableOpacity key={page.id} style={styles.pageCard} activeOpacity={0.8}>
                <Image
                  source={{ uri: page.thumbnailUrl || page.imageUrl }}
                  style={styles.pageImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                />
                <View style={styles.pageOverlay}>
                  <Text style={styles.pageNumber}>Page {page.pageNumber}</Text>
                  <Text style={styles.pageTitle}>{page.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {pages.length < 4 && <InProgressCard />}
          </View>
        ) : (
          <View style={styles.grid}>
            <LockedCard title="Illustrations No. 01" description="Eveil des Sens" />
            <LockedCard title="Illustrations No. 02" description="Ombre et Lumiere" />
            <LockedCard title="Illustrations No. 03" description="Details de Soie" />
            <InProgressCard />
          </View>
        )}
      </View>
    </View>
  );
};

// Sub-components

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  iconColor: string;
}> = ({ icon, title, subtitle, iconColor }) => {
  const tc = useThemeColors();
  return (
    <View style={[styles.featureCard, { backgroundColor: tc.card, borderColor: tc.cardBorder }]}>
      <View style={[styles.featureIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: tc.text }]}>{title}</Text>
        <Text style={[styles.featureSubtitle, { color: tc.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const LockedCard: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  const tc = useThemeColors();
  return (
    <View style={[styles.lockedCard, { borderColor: tc.cardBorder, backgroundColor: tc.surfaceSecondary }]}>
      <Icon name="lock" size={40} color={tc.textTertiary} style={{ opacity: 0.3 }} />
      <Text style={[styles.lockedTitle, { color: tc.textSecondary }]}>{title}</Text>
      <Text style={[styles.lockedDesc, { color: tc.text }]}>{description}</Text>
    </View>
  );
};

const InProgressCard: React.FC = () => {
  const tc = useThemeColors();
  return (
    <View style={[styles.inProgressCard, { backgroundColor: `${tc.rose}0D`, borderColor: `${tc.rose}4D` }]}>
      <Icon name="hourglass_empty" size={32} color={`${tc.rose}99`} />
      <Text style={[styles.inProgressTitle, { color: tc.rose }]}>Nouveau Design</Text>
      <Text style={[styles.inProgressText, { color: tc.textTertiary }]}>En cours de creation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing['2xl'],
  },

  // Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroTitle: {
    fontFamily: 'Newsreader_400Regular',
    fontSize: fontSize['3xl'],
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  heroAccent: {
    color: colors.rose,
    fontFamily: 'Newsreader_400Regular_Italic',
  },
  heroText: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    lineHeight: 24,
  },

  // Features
  features: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  // Gallery Card
  galleryCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  galleryTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.xl,
    color: colors.charcoal,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: `${colors.rose}cc`,
  },
  comingSoonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose,
  },

  // Loading
  loadingContainer: {
    padding: spacing['4xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Page Card
  pageCard: {
    width: CARD_SIZE / 2,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  pageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pageNumber: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.gray[300],
    marginBottom: 2,
  },
  pageTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.sm,
    color: colors.white,
  },

  // Locked Card
  lockedCard: {
    width: CARD_SIZE / 2,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  lockedTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.gray[500],
    textAlign: 'center',
  },
  lockedDesc: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fontSize.sm,
    color: colors.charcoal,
    textAlign: 'center',
  },

  // In Progress Card
  inProgressCard: {
    width: CARD_SIZE / 2,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    backgroundColor: 'rgba(225, 29, 72, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  inProgressTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.rose,
    textAlign: 'center',
  },
  inProgressText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.gray[400],
    textAlign: 'center',
  },
});

export default ColoringGallery;
