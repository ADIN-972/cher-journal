import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { useVolumeStore } from '@/stores/volumeStore';
import CachedImage from '@/components/CachedImage';
import { colors, spacing, fontSize, borderRadius } from '@/utils/theme';
import type { Volume } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const ChapterDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { selectedChapter } = useChapterStore();
  const { volumes, loading, error, fetchVolumes, setCurrentVolume } =
    useVolumeStore();

  useEffect(() => {
    if (id) {
      fetchVolumes(id as string);
    }
  }, [id]);

  const handleSelectVolume = (volume: Volume) => {
    setCurrentVolume(volume);
    router.push(`/reader/${volume.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.rose} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Chapter Header */}
      {selectedChapter && (
        <View style={styles.chapterHeader}>
          {selectedChapter.coverAssetId && (
            <CachedImage
              assetId={selectedChapter.coverAssetId}
              imageUrl={`${API_BASE_URL}/assets/${selectedChapter.coverAssetId}`}
              width={120}
              height={170}
              style={styles.headerCover}
            />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{selectedChapter.title}</Text>
            <Text style={styles.headerProtagonist}>
              {selectedChapter.protagonistName}
            </Text>
            {selectedChapter.description && (
              <Text style={styles.headerDescription} numberOfLines={3}>
                {selectedChapter.description}
              </Text>
            )}
            <View style={styles.statsRow}>
              {selectedChapter.niveau_intensite > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>
                    Intensite {selectedChapter.niveau_intensite}
                  </Text>
                </View>
              )}
              {selectedChapter.niveau_douceur > 0 && (
                <View style={[styles.statBadge, styles.statBadgeGold]}>
                  <Text style={[styles.statBadgeText, styles.statBadgeTextGold]}>
                    Douceur {selectedChapter.niveau_douceur}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Volumes List */}
      <View style={styles.volumesSection}>
        <Text style={styles.volumesTitle}>
          Volumes ({volumes.length})
        </Text>

        {volumes.map((volume) => (
          <TouchableOpacity
            key={volume.id}
            onPress={() => handleSelectVolume(volume)}
            style={styles.volumeRow}
            activeOpacity={0.7}
          >
            <View style={styles.volumeNumber}>
              <Text style={styles.volumeNumberText}>{volume.volumeNumber}</Text>
            </View>
            <View style={styles.volumeInfo}>
              <Text style={styles.volumeTitle}>
                {volume.title || `Volume ${volume.volumeNumber}`}
              </Text>
              {volume.isFree && (
                <Text style={styles.freeLabel}>Gratuit</Text>
              )}
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
};

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
  chapterHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.boudoir[950],
  },
  headerCover: {
    width: 120,
    height: 170,
    borderRadius: borderRadius.lg,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.lg,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerProtagonist: {
    fontSize: fontSize.base,
    color: colors.roseLight,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  headerDescription: {
    fontSize: fontSize.sm,
    color: colors.boudoir[200],
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  statBadgeText: {
    fontSize: fontSize.xs,
    color: colors.roseLight,
    fontWeight: '500',
  },
  statBadgeGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  statBadgeTextGold: {
    color: colors.goldLight,
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  volumesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  volumesTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  volumeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.boudoir[950],
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  volumeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  volumeTitle: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.charcoal,
  },
  freeLabel: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '500',
    marginTop: 2,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.gray[400],
    fontWeight: '300',
  },
});

export default ChapterDetailScreen;
