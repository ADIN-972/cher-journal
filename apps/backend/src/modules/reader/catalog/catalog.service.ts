import prisma from '../../../lib/prisma';
import { ChapterStatus, VolumeStatus, OrderStatus } from '@prisma/client';
import { priceSchemaService } from '../../admin/price-schemas/price-schemas.service';
import { resolveAssetUrl } from '../../../lib/assetUtils';
import { AccessControlService } from '../../../lib/accessControl';
import momentSelectionService from './moment-selection.service';

// Helper to convert BigInt to number for JSON serialization
const convertBigIntToNumber = (obj: any): any => {
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToNumber(value)])
    );
  }
  return obj;
};

export class CatalogService {
  private accessControl = new AccessControlService();

  async listChapters(userId?: string) {
    const chapters = await prisma.chapter.findMany({
      where: {
        status: ChapterStatus.PUBLISHED,
        // Chapter must be either without scheduledFor OR scheduled date has passed
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lte: new Date() } }
        ]
      },
      include: {
        coverAsset: true,
        genres: {
          select: {
            genre: true,
          },
        },
        _count: {
          select: {
            volumes: {
              where: {
                // Only count volumes that are published and accessible
                status: VolumeStatus.PUBLISHED,
                OR: [
                  { scheduledFor: null },
                  { scheduledFor: { lte: new Date() } }
                ]
              }
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user authenticated, fetch all their volume reads in one query for efficiency
    let userVolumeReadsMap = new Map<string, number[]>(); // Map of chapterId -> volumeNumbers with progress > 0
    if (userId) {
      const userReads = await prisma.volumeRead.findMany({
        where: {
          userId,
          progress: { gt: 0 } // Only get volumes with progress > 0
        },
        select: {
          chapterId: true,
          volumeNumber: true,
        },
      });

      // Group by chapterId for efficient lookup
      for (const read of userReads) {
        if (!userVolumeReadsMap.has(read.chapterId)) {
          userVolumeReadsMap.set(read.chapterId, []);
        }
        userVolumeReadsMap.get(read.chapterId)!.push(read.volumeNumber);
      }
    }

    // Calculate totalCharacterCount for each chapter and serialize assets
    const chaptersWithCharacterCount = await Promise.all(
      chapters.map(async (chapter) => {
        // Calculate total character count by aggregating NARRATOR versions
        const result = await prisma.volumeVersion.aggregate({
          where: {
            volume: {
              chapterId: chapter.id,
              status: VolumeStatus.PUBLISHED,
              OR: [
                { scheduledFor: null },
                { scheduledFor: { lte: new Date() } }
              ]
            },
            perspective: 'NARRATOR'
          },
          _sum: {
            characterCount: true
          }
        });

        // Resolve cover asset URL (use thumbnail if it exists)
        const coverAssetUrl = await resolveAssetUrl(chapter.coverAsset);

        // Check if user has started reading this chapter (has any volume with progress > 0)
        const hasStartedReading = userVolumeReadsMap.has(chapter.id);

        return {
          ...chapter,
          totalCharacterCount: result._sum.characterCount || 0,
          hasStartedReading,
          // Replace coverAsset with serialized version containing the resolved URL
          coverAsset: chapter.coverAsset ? {
            id: chapter.coverAsset.id,
            url: coverAssetUrl,
            mimeType: chapter.coverAsset.mimeType,
          } : null,
        };
      })
    );

    // Add isFavorite flag based on moment selection configuration
    const chaptersWithFavoriteFlag = await momentSelectionService.enrichChaptersWithFavoriteFlag(chaptersWithCharacterCount);

    // Convert BigInt fields to numbers for JSON serialization
    return convertBigIntToNumber(chaptersWithFavoriteFlag);
  }

  async getChapter(id: string, userId?: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        coverAsset: true,
        genres: {
          select: {
            genre: true,
          },
        },
        // Return ALL volumes so users can see what's coming
        volumes: {
          include: {
            illustrationAsset: true,
            versions: {
              select: {
                id: true,
                perspective: true,
                characterCount: true,
              },
            },
          },
          orderBy: { volumeNumber: 'asc' },
        },
      },
    });

    if (!chapter) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // If user authenticated, check entitlements, unlocks, and volume reads
    let hasAccess = false;
    let scopes: string[] | null = null;
    let unlocks: { volumeNumber: number; unlocksAt: Date }[] = [];
    let volumeReads: { volumeNumber: number; perspective: string; firstReadAt: Date; progress: number; canStartWaitFrom: Date | null }[] = [];

    if (userId) {
      // Aggregate all entitlements' scopes so the frontend gets a complete picture.
      // e.g. if user has ['BASE'] and ['BASE','POV'] from two entitlements,
      // the combined result is ['BASE', 'POV'].
      const entitlements = await prisma.entitlement.findMany({
        where: { userId, chapterId: id },
      });

      if (entitlements.length > 0) {
        hasAccess = true;
        scopes = [...new Set(entitlements.flatMap((e: any) => e.scopes))];

        // Fetch user's unlocks for this chapter
        const userUnlocks = await prisma.unlock.findMany({
          where: {
            userId,
            chapterId: id,
          },
          select: {
            volumeNumber: true,
            unlocksAt: true,
          },
        });

        unlocks = userUnlocks.map(u => ({
          volumeNumber: u.volumeNumber,
          unlocksAt: u.unlocksAt,
        }));
      }

      // Fetch user's volume reads to track progression
      // This should be OUTSIDE the entitlement check because users can read free volumes
      // or volumes they're waiting on without having an entitlement
      const userReads = await prisma.volumeRead.findMany({
        where: {
          userId,
          chapterId: id,
        },
        select: {
          volumeNumber: true,
          perspective: true,
          firstOpenedAt: true,
          progress: true,
          canStartWaitFrom: true,
        },
      });

      volumeReads = userReads.map(r => ({
        volumeNumber: r.volumeNumber,
        perspective: r.perspective,
        firstReadAt: r.firstOpenedAt,
        progress: r.progress,
        canStartWaitFrom: r.canStartWaitFrom,
      }));
    }

    // Find last read volume number (highest volume that was read)
    const lastReadVolumeNumber = volumeReads.length > 0
      ? Math.max(...volumeReads.map(r => r.volumeNumber))
      : 0;

    // Mark each volume with detailed unlock status
    // Implementing VOLUME-ACCESSIBILITY-RULES.md
    const now = new Date();
    const volumesWithAccessibility = (await Promise.all(chapter.volumes.map(async volume => {
      // RULE 0: Unpublished volumes don't exist for clients
      const isPublished = volume.status === VolumeStatus.PUBLISHED &&
        (volume.scheduledFor === null || volume.scheduledFor <= now);

      if (!isPublished) {
        return null; // Exclude unpublished volumes
      }

      // Get access info for both perspectives
      const narratorAccessInfo = await this.accessControl.getVolumeAccessInfo(
        userId,
        id,
        volume.volumeNumber,
        'NARRATOR' as any
      );

      const protagonistAccessInfo = await this.accessControl.getVolumeAccessInfo(
        userId,
        id,
        volume.volumeNumber,
        'PROTAGONIST' as any
      );

      // For backward compatibility, use NARRATOR access as default
      const { isAccessible, blockageType, blockageInfo, canStartWait } = narratorAccessInfo;

      // Store access by perspective
      const accessByPerspective = {
        NARRATOR: narratorAccessInfo,
        PROTAGONIST: protagonistAccessInfo,
      };

      // Get reading progress for this volume per perspective
      const volumeReadsForVolume = volumeReads.filter(r => r.volumeNumber === volume.volumeNumber);
      const progressByPerspective: { NARRATOR?: number; PROTAGONIST?: number } = {};

      for (const read of volumeReadsForVolume) {
        progressByPerspective[read.perspective as 'NARRATOR' | 'PROTAGONIST'] = read.progress;
      }

      // Default to 0 for perspectives that haven't been read
      const progress = progressByPerspective.NARRATOR ?? 0;

      // Resolve illustration asset URL (use thumbnail if it exists)
      const illustrationAssetUrl = await resolveAssetUrl(volume.illustrationAsset);

      return {
        ...volume,
        progressByPerspective,
        accessByPerspective,
        // Replace illustrationAsset with serialized version containing the resolved URL
        illustrationAsset: volume.illustrationAsset ? {
          id: volume.illustrationAsset.id,
          url: illustrationAssetUrl,
          mimeType: volume.illustrationAsset.mimeType,
        } : null,
      };
    }))).filter(v => v !== null); // Remove unpublished volumes

    // Get pricing information for the chapter
    const priceFreeToRead = await this.getPriceFreeToRead(id);
    const pricePaywall = await this.getPricePaywall(id);
    const priceEpilogue = await this.getPriceEpilogue(id);
    const priceProtagonistUnlock = await this.getPriceProtagonistUnlock(id);

    // Calculate bundle pricing (sum of all individual volume prices)
    let bundleOriginalPrice = 0;
    let alreadyAccessiblePrice = 0;
    let nextVolumePrice: number | null = null;

    volumesWithAccessibility.forEach((vol: any) => {
      // Determine individual volume price
      let volumePrice = 0;

      // Free volumes don't cost anything
      if (vol.isFree) {
        volumePrice = 0;
      } else if (vol.volumeNumber <= 8) {
        volumePrice = priceFreeToRead;
      } else if (vol.volumeNumber <= 10) {
        volumePrice = pricePaywall;
      } else {
        volumePrice = priceEpilogue;
      }

      // Attach price to the volume object
      vol.price = volumePrice;

      // Add to total bundle price
      bundleOriginalPrice += volumePrice;

      // Get NARRATOR perspective access info for bundle pricing (default perspective)
      const narratorAccess = vol.accessByPerspective?.NARRATOR;
      const isAccessibleForPricing = narratorAccess?.isAccessible || false;

      // If user already has access to this volume, subtract from what they need to pay
      // (only if the volume isn't free, since free volumes were never part of the cost)
      if (isAccessibleForPricing && !vol.isFree) {
        alreadyAccessiblePrice += volumePrice;
      }

      // Find the first non-accessible, non-free volume (this is the next volume to purchase)
      if (!isAccessibleForPricing && !vol.isFree && nextVolumePrice === null) {
        nextVolumePrice = volumePrice;
      }
    });

    // Subtract already accessible volumes (no discount applied)
    const bundleDiscountedPrice = bundleOriginalPrice - alreadyAccessiblePrice;

    const pricing = {
      priceFreeToRead,
      pricePaywall,
      priceEpilogue,
      priceProtagonistUnlock,
      totalVolumes: volumesWithAccessibility.length,
      bundleOriginalPrice,
      bundleDiscountedPrice,
      nextVolumePrice,
    };

    // Calculate total character count (sum of NARRATOR versions)
    const totalCharacterCount = chapter.volumes.reduce((total, volume) => {
      const narratorVersion = volume.versions?.find(v => v.perspective === 'NARRATOR');
      return total + (narratorVersion?.characterCount || 0);
    }, 0);

    // Resolve chapter cover asset URL (use thumbnail if it exists)
    const coverAssetUrl = await resolveAssetUrl(chapter.coverAsset);

    // Check if user has started reading any volume (progress > 0 for at least one perspective)
    const hasStartedReading = volumesWithAccessibility.some(vol => {
      const progressByPerspective = vol.progressByPerspective || {};
      return Object.values(progressByPerspective).some((p: any) => (p ?? 0) > 0);
    });

    const response = {
      ...chapter,
      volumes: volumesWithAccessibility,
      hasAccess,
      scopes,
      hasStartedReading,
      pricing,
      totalCharacterCount,
      // Replace coverAsset with serialized version containing the resolved URL
      coverAsset: chapter.coverAsset ? {
        id: chapter.coverAsset.id,
        url: coverAssetUrl,
        mimeType: chapter.coverAsset.mimeType,
      } : null,
    };

    // Add isFavorite flag based on moment selection configuration
    const responseWithFavoriteFlag = await momentSelectionService.enrichChapterWithFavoriteFlag(response);

    // Convert BigInt fields (like Volume.waitDuration) to numbers for JSON serialization
    return convertBigIntToNumber(responseWithFavoriteFlag);
  }

  // ============= HELPER METHODS FOR PRICING =============

  /**
   * Get freeToRead price for a chapter
   */
  private async getPriceFreeToRead(chapterId: string): Promise<number> {
    const prices = await priceSchemaService.getChapterPrices(chapterId);
    return prices.priceFreeToRead;
  }

  /**
   * Get paywall price for a chapter
   */
  private async getPricePaywall(chapterId: string): Promise<number> {
    const prices = await priceSchemaService.getChapterPrices(chapterId);
    return prices.pricePaywall;
  }

  /**
   * Get epilogue price for a chapter
   */
  private async getPriceEpilogue(chapterId: string): Promise<number> {
    const prices = await priceSchemaService.getChapterPrices(chapterId);
    return prices.priceEpilogue;
  }

  /**
   * Get protagonist perspective unlock price for a chapter
   */
  private async getPriceProtagonistUnlock(chapterId: string): Promise<number> {
    const prices = await priceSchemaService.getChapterPrices(chapterId);
    return prices.priceProtagonistUnlock;
  }
}
