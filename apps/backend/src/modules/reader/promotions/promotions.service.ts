import prisma from '../../../lib/prisma';
import type { PriceScope, PromotionType } from '@cher-journal/types';
import { AccessControlService } from '../../../lib/accessControl';

export interface ApplicablePromotion {
  id: string;
  name: string;
  description: string | null;
  scope: PriceScope;
  type: PromotionType;
  value: number | null;
  startsAt: Date;
  endsAt: Date;
  code: string | null;
  content: {
    chapterId: string;
    chapterTitle: string;
    chapterCoverUrl: string | null;
    volumeNumber?: number;
    volumeTitle?: string;
  } | null;
  remainingUses: number | null;
  userRemainingUses: number | null;
}

export class PromotionsService {
  private accessControl = new AccessControlService();

  async usePromotion(
    userId: string,
    promotionId: string,
    selectedRefId?: string
  ): Promise<{
    success: boolean;
    promotion: { id: string; name: string; type: PromotionType; value: number | null };
    message: string;
  }> {
    // 1. Fetch the promotion
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        applied: true,
      },
    });

    if (!promotion) {
      const error = new Error('Promotion not found');
      (error as any).statusCode = 404;
      (error as any).code = 'PROMOTION_NOT_FOUND';
      throw error;
    }

    // 2. Check if promotion is active and within date range
    const now = new Date();
    if (!promotion.isActive || promotion.startsAt > now || promotion.endsAt < now) {
      const error = new Error('This promotion is no longer available');
      (error as any).statusCode = 400;
      (error as any).code = 'PROMOTION_EXPIRED';
      throw error;
    }

    // 3. Check global usage limit - only for non-targeted promotions
    // For SPECIFIC_USERS promotions, ignore maxUses and only check perUserLimit
    if ((promotion as any).targetType !== 'SPECIFIC_USERS') {
      if (promotion.maxUses !== null && promotion.maxUses > 0) {
        if (promotion.applied.length >= promotion.maxUses) {
          const error = new Error('This promotion has reached its usage limit');
          (error as any).statusCode = 400;
          (error as any).code = 'PROMOTION_LIMIT_EXCEEDED';
          throw error;
        }
      }
    }

    // 4. Check per-user limit
    if (promotion.perUserLimit !== null && promotion.perUserLimit > 0) {
      const userUsageCount = promotion.applied.filter((ap: any) => ap.userId === userId).length;
      if (userUsageCount >= promotion.perUserLimit) {
        const error = new Error('You have already used this promotion the maximum number of times');
        (error as any).statusCode = 400;
        (error as any).code = 'USER_LIMIT_EXCEEDED';
        throw error;
      }
    }

    // 5. For general promotions, verify user selected a refId
    if (!promotion.refId && !selectedRefId) {
      const error = new Error('Please select which content to apply this promotion to');
      (error as any).statusCode = 400;
      (error as any).code = 'SELECTION_REQUIRED';
      throw error;
    }

    const appliedRefId = selectedRefId || promotion.refId;

    // 6. Record the applied promotion
    const appliedPromotion = await prisma.appliedPromotion.create({
      data: {
        promotionId,
        userId,
        appliedRefId,
      },
    });

    // 7. If promotion is FREE, create entitlements to grant actual access
    if (promotion.type === 'FREE' && appliedRefId) {
      await this.createEntitlementsFromPromotion(userId, promotion, appliedRefId);
    }

    return {
      success: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type as PromotionType,
        value: promotion.value,
      },
      message: `Promotion "${promotion.name}" applied successfully!`,
    };
  }

  private async createEntitlementsFromPromotion(
    userId: string,
    promotion: any,
    refId: string
  ): Promise<void> {
    try {
      // Determine versionScope based on promotion scope
      // POV scopes grant PROTAGONIST access (versionScope: 'ALL')
      // Regular scopes grant NARRATOR access (versionScope: 'BASE')
      const isPOVPromotion = promotion.scope?.includes('POV');
      const versionScope = isPOVPromotion ? 'ALL' : 'BASE';

      if (promotion.scope === 'VOLUME' || promotion.scope === 'POV_VOLUME') {
        // Format: "chapterId:volumeNumber"
        const [chapterId, volumeNumberStr] = refId.split(':');
        const volumeNumber = parseInt(volumeNumberStr);

        // Check if entitlement already exists for this volume
        const existingEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId,
            chapterId,
            volumeFrom: { lte: volumeNumber },
            volumeTo: { gte: volumeNumber },
          },
        });

        if (!existingEntitlement) {
          console.log(
            `[Promotions] Creating FREE entitlement for user ${userId}, chapter ${chapterId}, volume ${volumeNumber} (scope: ${promotion.scope}, versionScope: ${versionScope})`
          );
          await prisma.entitlement.create({
            data: {
              userId,
              chapterId,
              volumeFrom: volumeNumber,
              volumeTo: volumeNumber,
              source: 'PROMOTION',
              versionScope,
            },
          });
        }
      } else if (promotion.scope === 'CHAPTER' || promotion.scope === 'POV_CHAPTER') {
        // Get all volumes in this chapter
        const chapter = await prisma.chapter.findUnique({
          where: { id: refId },
          include: {
            volumes: {
              select: { volumeNumber: true },
            },
          },
        });

        if (chapter && chapter.volumes.length > 0) {
          const minVolume = Math.min(...chapter.volumes.map((v) => v.volumeNumber));
          const maxVolume = Math.max(...chapter.volumes.map((v) => v.volumeNumber));

          // Check if entitlement already exists
          const existingEntitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              chapterId: refId,
            },
          });

          if (!existingEntitlement) {
            console.log(
              `[Promotions] Creating FREE entitlement for user ${userId}, chapter ${refId}, volumes ${minVolume}-${maxVolume} (scope: ${promotion.scope}, versionScope: ${versionScope})`
            );
            await prisma.entitlement.create({
              data: {
                userId,
                chapterId: refId,
                volumeFrom: minVolume,
                volumeTo: maxVolume,
                source: 'PROMOTION',
                versionScope,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('[Promotions] Error creating entitlements from promotion:', error);
      // Don't throw - the promotion is already recorded, this is just to grant access
    }
  }

  async getUserApplicablePromotions(userId: string): Promise<ApplicablePromotion[]> {
    // 1. Query active promotions within validity date
    const now = new Date();
    const activePromotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        applied: true,
      },
    });

    if (activePromotions.length === 0) {
      return [];
    }

    // 2. Get user's entitlements (for ownership check)
    const userEntitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            coverAssetId: true,
            coverAsset: {
              select: {
                thumbnailObjectKey: true,
                objectKey: true,
              },
            },
          },
        },
      },
    });

    // 3. Get user's order history for targeting criteria
    const userOrders = await prisma.order.findMany({
      where: { userId },
      select: {
        type: true,
        amountTotal: true,
        createdAt: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, createdAt: true },
    });

    if (!user) {
      return [];
    }

    // 4. Get applied promotions for this user (for per-user limit check)
    const appliedPromotions = await prisma.appliedPromotion.findMany({
      where: { userId },
      select: { promotionId: true },
    });

    const appliedPromotionIds = new Set(appliedPromotions.map((ap: any) => ap.promotionId));

    // 5. Filter and enrich promotions
    const applicablePromotions: ApplicablePromotion[] = [];

    for (const promo of activePromotions) {
      // Check targeting eligibility
      if (!this.isUserEligibleForTargeting(promo, userId, userOrders, user)) {
        continue;
      }

      // Check global usage limit (maxUses) - only for non-targeted promotions
      // For SPECIFIC_USERS promotions, ignore maxUses and only check perUserLimit
      if (promo.targetType !== 'SPECIFIC_USERS') {
        if (promo.maxUses !== null && promo.maxUses > 0) {
          if (promo.applied.length >= promo.maxUses) {
            continue;
          }
        }
      }

      // Check per-user limit (perUserLimit)
      if (promo.perUserLimit !== null && promo.perUserLimit > 0) {
        const userUsageCount = promo.applied.filter((ap: any) => ap.userId === userId).length;
        if (userUsageCount >= promo.perUserLimit) {
          continue;
        }
      }

      // Check ownership (filter out if user already owns the content)
      if (promo.refId) {
        const owns = await this.accessControl.userOwnsContent(
          userId,
          promo.scope as 'CHAPTER' | 'VOLUME',
          promo.refId
        );
        if (owns) {
          continue;
        }
      }

      // Enrich with content details (may be null for general promotions)
      const enrichedPromo = await this.enrichPromotionContent(promo, userEntitlements);

      // Calculate remaining uses
      // For SPECIFIC_USERS promotions, ignore maxUses and only show perUserLimit
      const remainingUses =
        promo.targetType === 'SPECIFIC_USERS'
          ? null
          : (promo.maxUses === null || promo.maxUses === 0 ? null : promo.maxUses - promo.applied.length);

      const userRemainingUses =
        promo.perUserLimit === null || promo.perUserLimit === 0
          ? null
          : promo.perUserLimit - promo.applied.filter((ap: any) => ap.userId === userId).length;

      applicablePromotions.push({
        id: promo.id,
        name: promo.name,
        description: promo.description,
        scope: promo.scope as PriceScope,
        type: promo.type as PromotionType,
        value: promo.value,
        startsAt: promo.startsAt,
        endsAt: promo.endsAt,
        code: promo.code,
        content: enrichedPromo,
        remainingUses,
        userRemainingUses,
      });
    }

    return applicablePromotions;
  }

  async getUserAppliedPromotions(userId: string): Promise<any[]> {
    const appliedPromotions = await prisma.appliedPromotion.findMany({
      where: { userId },
      include: {
        promotion: true,
      },
    });

    return appliedPromotions.map((ap) => ({
      promotionId: ap.promotionId,
      appliedRefId: ap.appliedRefId,
      appliedAt: ap.appliedAt,
      promotion: {
        id: ap.promotion.id,
        name: ap.promotion.name,
        refId: ap.promotion.refId,
      },
    }));
  }

  private isUserEligibleForTargeting(
    promo: any,
    userId: string,
    userOrders: any[],
    user: any
  ): boolean {
    if (promo.targetType === 'ALL_USERS') {
      return true;
    }

    if (promo.targetType === 'SPECIFIC_USERS') {
      const targetUserIds = (promo.targetUserIds as string[]) || [];
      return targetUserIds.includes(userId);
    }

    if (promo.targetType === 'CRITERIA_BASED') {
      const criteria = promo.targetCriteria as any;
      if (!criteria) return false;

      // Check order count
      if (criteria.minOrders !== undefined && userOrders.length < criteria.minOrders) {
        return false;
      }
      if (criteria.maxOrders !== undefined && userOrders.length > criteria.maxOrders) {
        return false;
      }

      // Check total spent
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.amountTotal || 0), 0);
      if (criteria.minTotalSpent !== undefined && totalSpent < criteria.minTotalSpent) {
        return false;
      }
      if (criteria.maxTotalSpent !== undefined && totalSpent > criteria.maxTotalSpent) {
        return false;
      }

      // Check registration date
      if (criteria.registeredAfter !== undefined) {
        const registeredAfter = new Date(criteria.registeredAfter);
        if (user.createdAt < registeredAfter) {
          return false;
        }
      }
      if (criteria.registeredBefore !== undefined) {
        const registeredBefore = new Date(criteria.registeredBefore);
        if (user.createdAt > registeredBefore) {
          return false;
        }
      }

      // Check order types
      if (criteria.hasOrderType && Array.isArray(criteria.hasOrderType) && criteria.hasOrderType.length > 0) {
        const userOrderTypes = new Set(userOrders.map((order) => order.type));
        const hasRequiredType = criteria.hasOrderType.some((type: string) => userOrderTypes.has(type));
        if (!hasRequiredType) {
          return false;
        }
      }

      // Check roles
      if (criteria.roles && Array.isArray(criteria.roles) && criteria.roles.length > 0) {
        if (!criteria.roles.includes(user.role)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private async enrichPromotionContent(
    promo: any,
    entitlements: any[]
  ): Promise<{
    chapterId: string;
    chapterTitle: string;
    chapterCoverUrl: string | null;
    volumeNumber?: number;
    volumeTitle?: string;
  } | null> {
    // Return null for general promotions without specific content
    if (!promo.refId) {
      return null;
    }

    if (promo.scope === 'VOLUME') {
      // Format: "chapterId:volumeNumber"
      const [chapterId, volumeNumberStr] = promo.refId.split(':');
      const volumeNumber = parseInt(volumeNumberStr);

      const chapter = entitlements.find((ent) => ent.chapterId === chapterId)?.chapter;
      if (!chapter) {
        // Try to fetch chapter if not in entitlements
        const fetchedChapter = await prisma.chapter.findUnique({
          where: { id: chapterId },
          select: {
            id: true,
            title: true,
            coverAsset: {
              select: {
                thumbnailObjectKey: true,
                objectKey: true,
              },
            },
          },
        });

        if (!fetchedChapter) {
          return null;
        }

        const volume = await prisma.volume.findFirst({
          where: { chapterId, volumeNumber },
          select: { id: true, title: true },
        });

        return {
          chapterId,
          chapterTitle: fetchedChapter.title,
          chapterCoverUrl: this.getAssetUrl(fetchedChapter.coverAsset),
          volumeNumber,
          volumeTitle: volume?.title || undefined,
        };
      }

      const volume = await prisma.volume.findFirst({
        where: { chapterId, volumeNumber },
        select: { id: true, title: true },
      });

      return {
        chapterId,
        chapterTitle: chapter.title,
        chapterCoverUrl: this.getAssetUrl(chapter.coverAsset),
        volumeNumber,
        volumeTitle: volume?.title || undefined,
      };
    }

    if (promo.scope === 'CHAPTER') {
      const chapter = entitlements.find((ent) => ent.chapterId === promo.refId)?.chapter;
      if (!chapter) {
        // Fetch chapter if not in entitlements
        const fetchedChapter = await prisma.chapter.findUnique({
          where: { id: promo.refId },
          select: {
            id: true,
            title: true,
            coverAsset: {
              select: {
                thumbnailObjectKey: true,
                objectKey: true,
              },
            },
          },
        });

        if (!fetchedChapter) {
          return null;
        }

        return {
          chapterId: fetchedChapter.id,
          chapterTitle: fetchedChapter.title,
          chapterCoverUrl: this.getAssetUrl(fetchedChapter.coverAsset),
        };
      }

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterCoverUrl: this.getAssetUrl(chapter.coverAsset),
      };
    }

    return null;
  }

  private getAssetUrl(asset: any): string | null {
    if (!asset) {
      return null;
    }

    // Return thumbnail if available, otherwise original
    const key = asset.thumbnailObjectKey || asset.objectKey;
    if (!key) {
      return null;
    }

    return `/uploads/${key}`;
  }
}
