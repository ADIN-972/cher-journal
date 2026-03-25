import prisma from './prisma';
import { Perspective, OrderStatus, SubscriptionStatus } from '@prisma/client';

/** Default discount rate for Club Privé subscribers on Protagoniste purchases */
export const SUBSCRIBER_PROTAGONIST_DISCOUNT = 0; // 0% fallback

/** Get discount rate from system config (async), falls back to constant */
export async function getSubscriberDiscount(): Promise<number> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'subscription.protagonist_discount_percent' },
    });
    if (config?.value) {
      return parseInt(config.value, 10) / 100; // e.g. 30 → 0.30
    }
  } catch { /* fallback */ }
  return SUBSCRIBER_PROTAGONIST_DISCOUNT;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  reason?: 'NO_ENTITLEMENT' | 'LOCKED_BY_WAIT' | 'FINAL_PAYWALL' | 'WRONG_PERSPECTIVE' | 'VOLUME_NOT_FOUND';
  blockedUntil?: Date;
}

export interface VolumeAccessInfo {
  isAccessible: boolean;
  blockageType: 'WAIT_OR_PAY' | 'PAYWALL' | 'EPILOGUE' | null;
  blockageInfo: any;
  canStartWait: boolean;
}

/**
 * Centralized access control service for volume and chapter permissions.
 *
 * This service consolidates all access verification logic that was previously
 * scattered across reader, catalog, library, pricing, wait, and other services.
 *
 * Single source of truth for:
 * - Volume 1 always accessible
 * - isFree volumes accessible
 * - Entitlement checks (PURCHASE vs SUBSCRIPTION)
 * - Wait-to-read timer validation
 * - isFinalPaywall blocking
 * - Perspective/versionScope validation
 * - Blockage type determination (WAIT_OR_PAY, PAYWALL, EPILOGUE)
 */
export class AccessControlService {
  /**
   * PRIMARY: Check if user can access a specific volume.
   *
   * This is the definitive source for volume access verification.
   * Used by: Reader (content loading), Catalog (display), Library (filtering)
   */
  async canAccessVolume(
    userId: string,
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective = Perspective.NARRATOR
  ): Promise<AccessCheckResult> {
    console.log(
      `[AccessControlService.canAccessVolume] Checking access: userId=${userId}, chapterId=${chapterId}, volumeNumber=${volumeNumber}, perspective=${perspective}`
    );

    // Get volume info to check isFree and isFinalPaywall
    const volume = await prisma.volume.findFirst({
      where: {
        chapterId,
        volumeNumber,
      },
    });

    if (!volume) {
      console.log(`[AccessControlService] Volume not found for chapterId=${chapterId}, volumeNumber=${volumeNumber}`);
      return { hasAccess: false, reason: 'VOLUME_NOT_FOUND' };
    }

    // Volume 1 is always accessible immediately for NARRATOR
    // PROTAGONIST requires entitlement even for volume 1
    if (volumeNumber === 1 && perspective === Perspective.NARRATOR) {
      console.log(`[AccessControlService] Volume 1 is always accessible for NARRATOR perspective`);
      return { hasAccess: true };
    }

    // Free volumes only apply to NARRATOR perspective
    // PROTAGONIST always requires payment/entitlement even if volume is free for NARRATOR
    if (volume.isFree && perspective === Perspective.NARRATOR) {
      console.log(`[AccessControlService] Volume ${volumeNumber} is free for NARRATOR perspective`);
      return { hasAccess: true };
    }

    // Club Privé subscribers get immediate NARRATOR access to all volumes (no wait timer)
    // but NOT PROTAGONIST access — that remains a separate purchase (with -30% discount)
    if (perspective === Perspective.NARRATOR) {
      const isSubscriber = await this.hasActiveSubscription(userId);
      if (isSubscriber) {
        console.log(`[AccessControlService] Active subscriber — NARRATOR access GRANTED for volume ${volumeNumber}`);
        return { hasAccess: true };
      }
    }

    // For non-free volumes, check entitlement.
    // For PROTAGONIST we query specifically for ALL versionScope so that a BASE
    // entitlement (narrator) never shadows an existing ALL entitlement (protagonist).
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
        volumeFrom: { lte: volumeNumber },
        volumeTo: { gte: volumeNumber },
        ...(perspective === Perspective.PROTAGONIST ? { scopes: { has: 'POV' } } : {}),
      },
    });

    if (!entitlement) {
      // For PROTAGONIST: distinguish between "has narrator only" vs "no entitlement at all"
      if (perspective === Perspective.PROTAGONIST) {
        const narratorEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId,
            chapterId,
            volumeFrom: { lte: volumeNumber },
            volumeTo: { gte: volumeNumber },
          },
        });
        if (narratorEntitlement) {
          console.log(
            `[AccessControlService] Perspective PROTAGONIST denied: only BASE entitlement exists for userId=${userId}, chapterId=${chapterId}, volumeNumber=${volumeNumber}`
          );
          return { hasAccess: false, reason: 'WRONG_PERSPECTIVE' };
        }
      }
      console.log(
        `[AccessControlService] No entitlement found for userId=${userId}, chapterId=${chapterId}, volumeNumber=${volumeNumber}`
      );
      return { hasAccess: false, reason: 'NO_ENTITLEMENT' };
    }

    console.log(
      `[AccessControlService] Found entitlement: source=${entitlement.source}, volumeFrom=${entitlement.volumeFrom}, volumeTo=${entitlement.volumeTo}, scopes=${entitlement.scopes.join(',')}`
    );

    // Final paywall volumes are blocked (need upgrade)
    if (volume.isFinalPaywall) {
      console.log(`[AccessControlService] Volume ${volumeNumber} is final paywall`);
      return { hasAccess: false, reason: 'FINAL_PAYWALL' };
    }

    // PURCHASE, BUNDLE, and SUBSCRIPTION entitlements bypass wait-to-read timers completely
    // Only PREORDER requires the wait-to-read timer
    if (entitlement.source !== 'PREORDER') {
      console.log(
        `[AccessControlService] User has ${entitlement.source} entitlement, bypassing wait-to-read timers`
      );
      console.log(
        `[AccessControlService] Access GRANTED for userId=${userId}, volume=${volumeNumber}`
      );
      return { hasAccess: true };
    }

    // Check if locked by wait (only for non-PURCHASE entitlements like free wait-to-read)
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
      console.log(
        `[AccessControlService] Volume ${volumeNumber} locked by wait until ${unlock.unlocksAt}`
      );
      return { hasAccess: false, reason: 'LOCKED_BY_WAIT', blockedUntil: unlock.unlocksAt };
    }

    console.log(`[AccessControlService] Access GRANTED for userId=${userId}, volume=${volumeNumber}`);
    return { hasAccess: true };
  }

  /**
   * Check if user can access entire chapter (has any valid entitlement).
   * Used by: Reviews (gate review creation), Library (show chapter)
   */
  async canAccessChapter(userId: string, chapterId: string): Promise<boolean> {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
      },
    });

    return !!entitlement;
  }

  /**
   * Get detailed volume access info with blockage type.
   * Used by: Catalog (calculate isAccessible + blockageType)
   *
   * This replaces the inline access logic in catalog.service.ts
   */
  async getVolumeAccessInfo(
    userId: string | undefined,
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective = Perspective.NARRATOR
  ): Promise<VolumeAccessInfo> {
    const volume = await prisma.volume.findFirst({
      where: {
        chapterId,
        volumeNumber,
      },
    });

    if (!volume) {
      return {
        isAccessible: false,
        blockageType: null,
        blockageInfo: null,
        canStartWait: false,
      };
    }

    // If no user logged in, only volume 1 and free volumes are accessible
    if (!userId) {
      const isAccessible = volumeNumber === 1 || volume.isFree;
      return {
        isAccessible,
        blockageType: isAccessible ? null : 'WAIT_OR_PAY',
        blockageInfo: isAccessible ? null : { waitDuration: volume.waitDuration },
        canStartWait: false,
      };
    }

    // Check full access (PURCHASE or BUNDLE entitlement)
    const hasFullAccess = await this.checkFullAccess(userId, chapterId, volumeNumber, perspective);
    if (hasFullAccess) {
      return {
        isAccessible: true,
        blockageType: null,
        blockageInfo: null,
        canStartWait: false,
      };
    }

    // Club Privé subscribers get immediate NARRATOR access (but not PROTAGONIST)
    if (perspective === Perspective.NARRATOR) {
      const isSubscriber = await this.hasActiveSubscription(userId);
      if (isSubscriber) {
        return {
          isAccessible: true,
          blockageType: null,
          blockageInfo: null,
          canStartWait: false,
        };
      }
    }

    // Volume 1 is always accessible for NARRATOR, but PROTAGONIST needs entitlement
    if (volumeNumber === 1 && perspective === Perspective.NARRATOR) {
      return {
        isAccessible: true,
        blockageType: null,
        blockageInfo: null,
        canStartWait: false,
      };
    }

    // Free volumes only apply to NARRATOR perspective
    // PROTAGONIST always requires payment/entitlement even if volume is free for NARRATOR
    if (volume.isFree && perspective === Perspective.NARRATOR) {
      return {
        isAccessible: true,
        blockageType: null,
        blockageInfo: null,
        canStartWait: false,
      };
    }

    // Check perspective access: volume 1 is always accessible for NARRATOR, but other perspectives need ALL versionScope
    if (perspective !== Perspective.NARRATOR && volumeNumber === 1) {
      // For PROTAGONIST perspective on volume 1, need POV scope entitlement
      const hasAllAccess = await this.checkEntitlementWithScope(userId, chapterId, 'POV');
      if (!hasAllAccess) {
        return {
          isAccessible: false,
          blockageType: 'WAIT_OR_PAY',
          blockageInfo: { waitDuration: volume.waitDuration },
          canStartWait: false,
        };
      }
    }

    // For non-free volumes, determine blockage type and access
    if (volumeNumber <= 8) {
      // Volumes 1-8: Wait-to-Read System
      const hasPaidFreeToRead = await this.checkPaidFreeToRead(userId, volume.id);
      if (hasPaidFreeToRead) {
        return {
          isAccessible: true,
          blockageType: null,
          blockageInfo: null,
          canStartWait: false,
        };
      }

      // Check wait unlock
      const unlock = await prisma.unlock.findFirst({
        where: {
          userId,
          chapterId,
          volumeNumber,
        },
      });

      const isAccessible = unlock && unlock.unlocksAt <= new Date();
      const canStartWait = volumeNumber >= 2 && volumeNumber <= 8 && !isAccessible;

      if (isAccessible) {
        return {
          isAccessible: true,
          blockageType: null,
          blockageInfo: null,
          canStartWait: false,
        };
      }

      return {
        isAccessible: false,
        blockageType: 'WAIT_OR_PAY',
        blockageInfo: {
          waitRemaining: unlock ? Math.max(0, unlock.unlocksAt.getTime() - new Date().getTime()) : null,
          priceFreeToRead: await this.getPriceFreeToRead(chapterId),
        },
        canStartWait,
      };
    } else if (volumeNumber <= 10) {
      // Volumes 9-10: Paywall
      const hasPaidPaywall = await this.checkPaidPaywall(userId, chapterId);
      if (hasPaidPaywall) {
        return {
          isAccessible: true,
          blockageType: null,
          blockageInfo: null,
          canStartWait: false,
        };
      }

      return {
        isAccessible: false,
        blockageType: 'PAYWALL',
        blockageInfo: {
          pricePaywall: await this.getPricePaywall(chapterId),
        },
        canStartWait: false,
      };
    } else {
      // Volumes 11+: Epilogues
      const hasPaidEpilogue = await this.checkPaidEpilogue(userId, chapterId);
      if (hasPaidEpilogue) {
        return {
          isAccessible: true,
          blockageType: null,
          blockageInfo: null,
          canStartWait: false,
        };
      }

      return {
        isAccessible: false,
        blockageType: 'EPILOGUE',
        blockageInfo: {
          priceEpilogue: await this.getPriceEpilogue(chapterId),
        },
        canStartWait: false,
      };
    }
  }

  /**
   * Check if user owns specific content (for promotion filtering).
   * Used by: Promotions (filter already-owned content)
   */
  async userOwnsContent(userId: string, scope: 'CHAPTER' | 'VOLUME', refId: string): Promise<boolean> {
    if (scope === 'CHAPTER') {
      const entitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId: refId,
        },
      });
      return !!entitlement;
    } else if (scope === 'VOLUME') {
      // refId format: "chapterId:volumeNumber"
      const [chapterId, volumeStr] = refId.split(':');
      const volumeNumber = parseInt(volumeStr, 10);

      const entitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId,
          volumeFrom: { lte: volumeNumber },
          volumeTo: { gte: volumeNumber },
        },
      });

      return !!entitlement;
    }

    return false;
  }

  /**
   * Get user's entitlement for a chapter.
   * Used by: Multiple services needing entitlement data
   */
  async getUserEntitlement(userId: string, chapterId: string) {
    return await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
      },
    });
  }

  /**
   * Check if user has an active Club Privé subscription.
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) return false;

    return (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.currentPeriodEnd > new Date()
    );
  }

  /**
   * Check if user can access a private chapter.
   * Private chapters are accessible to: the Muse, Club subscribers.
   * They are VISIBLE to everyone (with filigrane cover + padlock).
   */
  async canAccessPrivateChapter(
    userId: string,
    chapterId: string
  ): Promise<boolean> {
    const muse = await prisma.chapterMuse.findUnique({
      where: { chapterId },
    });
    if (muse && muse.userId === userId) return true;

    return this.hasActiveSubscription(userId);
  }

  // --- Private Helper Methods ---

  /**
   * Check if user has full access via PURCHASE or BUNDLE entitlement
   * (but NOT SUBSCRIPTION which is free wait-to-read)
   */
  private async checkFullAccess(userId: string, chapterId: string, volumeNumber: number, perspective: Perspective = Perspective.NARRATOR): Promise<boolean> {
    // For PROTAGONIST, look specifically for entitlements with 'POV' in scopes so a BASE-only
    // entitlement does not shadow an existing POV entitlement and incorrectly deny access.
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
        volumeFrom: { lte: volumeNumber },
        volumeTo: { gte: volumeNumber },
        ...(perspective === Perspective.PROTAGONIST ? { scopes: { has: 'POV' } } : {}),
      },
    });

    if (!entitlement) {
      return false;
    }

    // PURCHASE, BUNDLE, and SUBSCRIPTION entitlements all grant full access
    // Only PREORDER does not grant full access (it requires wait-to-read)
    return entitlement.source !== 'PREORDER';
  }

  /**
   * Check if user has an entitlement containing a specific scope for this chapter
   */
  private async checkEntitlementWithScope(userId: string, chapterId: string, scope: string): Promise<boolean> {
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
        scopes: { has: scope },
      },
    });

    return !!entitlement;
  }

  /**
   * Check if user paid for freeToRead version of a specific volume
   * Note: This is a simplified check - may need adjustment based on actual Order structure
   */
  private async checkPaidFreeToRead(userId: string, volumeId: string): Promise<boolean> {
    // For now, returning false as freeToRead is typically handled via wait-to-read timers
    // This method can be enhanced if needed
    return false;
  }

  /**
   * Check if user paid for paywall access to a chapter
   */
  private async checkPaidPaywall(userId: string, chapterId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        refId: chapterId,
        status: OrderStatus.PAID,
        appliedPricePaywall: { gt: 0 },
      },
    });

    return !!order;
  }

  /**
   * Check if user paid for epilogue access to a chapter
   */
  private async checkPaidEpilogue(userId: string, chapterId: string): Promise<boolean> {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        refId: chapterId,
        status: OrderStatus.PAID,
        appliedPriceEpilogue: { gt: 0 },
      },
    });

    return !!order;
  }

  /**
   * Get freeToRead price for a chapter
   */
  private async getPriceFreeToRead(chapterId: string): Promise<number> {
    // Try chapter-specific override first
    const override = await prisma.chapterPriceOverride.findFirst({
      where: {
        chapterId,
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
    });

    if (override) {
      return override.priceFreeToRead ?? 199;
    }

    // Fall back to active price schema
    const schema = await prisma.priceSchema.findFirst({
      where: {
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
      orderBy: { appliedFrom: 'desc' },
    });

    return schema?.priceFreeToRead ?? 199;
  }

  /**
   * Get paywall price for a chapter
   */
  private async getPricePaywall(chapterId: string): Promise<number> {
    const override = await prisma.chapterPriceOverride.findFirst({
      where: {
        chapterId,
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
    });

    if (override) {
      return override.pricePaywall ?? 299;
    }

    const schema = await prisma.priceSchema.findFirst({
      where: {
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
      orderBy: { appliedFrom: 'desc' },
    });

    return schema?.pricePaywall ?? 299;
  }

  /**
   * Get epilogue price for a chapter
   */
  private async getPriceEpilogue(chapterId: string): Promise<number> {
    const override = await prisma.chapterPriceOverride.findFirst({
      where: {
        chapterId,
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
    });

    if (override) {
      return override.priceEpilogue ?? 399;
    }

    const schema = await prisma.priceSchema.findFirst({
      where: {
        isActive: true,
        appliedFrom: { lte: new Date() },
        OR: [
          { appliedTo: null },
          { appliedTo: { gte: new Date() } },
        ],
      },
      orderBy: { appliedFrom: 'desc' },
    });

    return schema?.priceEpilogue ?? 399;
  }
}
