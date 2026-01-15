import prisma from "../../../lib/prisma.js";
import { priceSchemaService } from "../../admin/price-schemas/price-schemas.service.js";

interface GetVolumePriceOptions {
  chapterId: string;
  volumeNumber: number;
  userId?: string;
}

export const pricingService = {
  /**
   * Get the price for a specific volume
   * Considers entitlements, wait times, and applicable promotions
   * Uses new V2 architecture: PriceSchema + ChapterPriceOverride
   */
  async getVolumePrice(options: GetVolumePriceOptions) {
    const { chapterId, volumeNumber, userId } = options;

    // Get chapter and volume details
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    const volume = await prisma.volume.findUnique({
      where: {
        chapterId_volumeNumber: {
          chapterId,
          volumeNumber,
        },
      },
    });

    if (!volume) {
      throw new Error("VOLUME_NOT_FOUND");
    }

    // Check if user already has access via entitlement
    let hasAccess = false;
    let canWait = true;

    if (userId) {
      const entitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId,
          volumeFrom: { lte: volumeNumber },
          volumeTo: { gte: volumeNumber },
        },
      });

      if (entitlement) {
        hasAccess = true;
      }

      // Check if wait unlock exists
      const unlock = await prisma.unlock.findUnique({
        where: {
          userId_chapterId_volumeNumber: {
            userId,
            chapterId,
            volumeNumber,
          },
        },
      });

      if (unlock && unlock.unlocksAt > new Date()) {
        canWait = false; // Already waiting
      }
    }

    // Determine the price based on volume type
    // Use new V2 architecture to get chapter prices
    const chapterPrices = await priceSchemaService.getChapterPrices(chapterId);

    let basePriceInCents = 0;
    let volumeType = "";

    if (volume.isFinalPaywall) {
      // Paywall volumes are always paid
      basePriceInCents = chapterPrices.pricePaywall || 0;
      volumeType = "PAYWALL";
      canWait = false;
    } else if (volume.volumeNumber > 10) {
      // Epilogues
      basePriceInCents = chapterPrices.priceEpilogue || 0;
      volumeType = "EPILOGUE";
      if (basePriceInCents > 0) {
        canWait = false; // Can't wait for paid epilogues
      }
    } else {
      // Standard free-to-read volumes
      basePriceInCents = chapterPrices.priceFreeToRead || 0;
      volumeType = "FREE_TO_READ";
    }

    // If price is 0 and they can wait, no purchase needed
    if (basePriceInCents === 0 && canWait) {
      return {
        basePrice: 0,
        finalPrice: 0,
        hasAccess,
        canWait: true,
        waitDuration: Number(volume.waitDuration),
        volumeType,
        promotion: null,
      };
    }

    // If they already have access, no price
    if (hasAccess) {
      return {
        basePrice: 0,
        finalPrice: 0,
        hasAccess: true,
        canWait: false,
        waitDuration: 0,
        volumeType,
        promotion: null,
      };
    }

    // Calculate final price with promotions
    // For volumes, we use PriceScope.VOLUME with refId = volumeId
    const pricesForVolume = await prisma.price.findMany({
      where: {
        scope: "VOLUME",
        refId: volume.id,
      },
      include: {
        promotions: {
          where: {
            isActive: true,
          },
        },
      },
    });

    let finalPrice = basePriceInCents;
    let appliedPromotion = null;
    const now = new Date();

    // Find best applicable promotion
    let bestDiscount = 0;
    for (const priceRecord of pricesForVolume) {
      for (const promo of priceRecord.promotions) {
        // Check date validity
        if (now < promo.startsAt || now > promo.endsAt) continue;

        // Check max uses
        if (promo.maxUses) {
          const usageCount = await prisma.appliedPromotion.count({
            where: { promotionId: promo.id },
          });
          if (usageCount >= promo.maxUses) continue;
        }

        // Check per-user limit
        if (userId && promo.perUserLimit) {
          const userUsageCount = await prisma.appliedPromotion.count({
            where: {
              promotionId: promo.id,
              userId,
            },
          });
          if (userUsageCount >= promo.perUserLimit) continue;
        }

        // Calculate discount
        let discount = 0;
        if (promo.type === "PERCENT" && promo.value) {
          discount = Math.floor((basePriceInCents * promo.value) / 100);
        } else if (promo.type === "FIXED" && promo.value) {
          discount = promo.value;
        } else if (promo.type === "FREE") {
          discount = basePriceInCents;
        }

        if (discount > bestDiscount) {
          bestDiscount = discount;
          appliedPromotion = promo;
        }
      }
    }

    if (bestDiscount > 0) {
      finalPrice = Math.max(0, basePriceInCents - bestDiscount);
    }

    return {
      basePrice: basePriceInCents,
      finalPrice,
      hasAccess,
      canWait: basePriceInCents === 0 && canWait,
      waitDuration: Number(volume.waitDuration),
      volumeType,
      promotion: appliedPromotion
        ? {
            id: appliedPromotion.id,
            type: appliedPromotion.type,
            value: appliedPromotion.value,
            discount: bestDiscount,
          }
        : null,
    };
  },

  /**
   * Check if volume is published (at chapter and volume level)
   */
  async isVolumePublished(
    chapterId: string,
    volumeNumber: number
  ): Promise<boolean> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { publishedAt: true },
    });

    if (!chapter) return false;
    if (chapter.publishedAt && chapter.publishedAt > new Date()) return false;

    const volume = await prisma.volume.findUnique({
      where: {
        chapterId_volumeNumber: {
          chapterId,
          volumeNumber,
        },
      },
      select: { publishedAt: true },
    });

    if (!volume) return false;
    if (volume.publishedAt && volume.publishedAt > new Date()) return false;

    return true;
  },
};
