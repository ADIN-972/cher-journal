import { PrismaClient } from "@prisma/client";
import type { PriceScope, PromotionType } from "@cher-journal/types";
import { targetingService } from "./targeting.service.js";
import { priceHistoryService } from "../prices/price-history.service.js";

const prisma = new PrismaClient();

interface CreatePromotionDto {
  name: string;
  description?: string;
  scope: PriceScope;
  refId?: string;
  type: PromotionType;
  value?: number;
  startsAt: Date;
  endsAt: Date;
  maxUses?: number;
  perUserLimit?: number;
  isActive?: boolean;
  code?: string;
  targetType?: string;
  targetUserIds?: string[];
  targetCriteria?: any;
  priceId?: string;
}

interface UpdatePromotionDto {
  name?: string;
  description?: string;
  type?: PromotionType;
  value?: number;
  startsAt?: Date;
  endsAt?: Date;
  maxUses?: number;
  perUserLimit?: number;
  isActive?: boolean;
  code?: string;
  targetType?: string;
  targetUserIds?: string[];
  targetCriteria?: any;
}

interface ListPromotionsQuery {
  scope?: PriceScope;
  refId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface CreatePriceDto {
  scope: PriceScope;
  refId?: string;
  amountCents: number;
  currency?: string;
}

export const promotionsService = {
  // Promotions
  async createPromotion(data: CreatePromotionDto) {
    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description,
        scope: data.scope,
        refId: data.refId,
        type: data.type,
        value: data.value,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        maxUses: data.maxUses,
        perUserLimit: data.perUserLimit,
        isActive: data.isActive ?? true,
        targetType: data.targetType as any,
        targetUserIds: data.targetUserIds || [],
        targetCriteria: data.targetCriteria,
        priceId: data.priceId,
      },
      include: {
        price: true,
        _count: {
          select: { applied: true },
        },
      },
    });

    // Calculate targetedUsersCount
    const targetedUsersCount = await targetingService.calculateTargetedUsersCount({
      targetType: promotion.targetType as any,
      targetUserIds: promotion.targetUserIds,
      targetCriteria: promotion.targetCriteria as any,
    });

    return {
      ...promotion,
      targetedUsersCount,
    };
  },

  async listPromotions(query: ListPromotionsQuery = {}) {
    try {
      console.log("[listPromotions] Query received:", query);
      const { scope, refId, isActive, page = 1, limit = 20 } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (scope) where.scope = scope;
      if (refId) where.refId = refId;
      if (isActive !== undefined) where.isActive = isActive;

      console.log("[listPromotions] Where clause:", where);

      const [promotions, total] = await Promise.all([
        prisma.promotion.findMany({
          where,
          include: {
            price: true,
            _count: {
              select: { applied: true },
            },
          },
          orderBy: { startsAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.promotion.count({ where }),
      ]);

      console.log("[listPromotions] Found promotions:", promotions.length);

      // Calculate targetedUsersCount for each promotion
      const promotionsWithTargeting = await Promise.all(
        promotions.map(async (promo) => {
          const targetedUsersCount = await targetingService.calculateTargetedUsersCount({
            targetType: promo.targetType as any,
            targetUserIds: promo.targetUserIds,
            targetCriteria: promo.targetCriteria as any,
          });

          return {
            ...promo,
            targetedUsersCount,
          };
        })
      );

      return {
        promotions: promotionsWithTargeting,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("[listPromotions] Error:", error);
      throw error;
    }
  },

  async getPromotionById(id: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        price: true,
        _count: {
          select: { applied: true },
        },
      },
    });

    if (!promotion) {
      return null;
    }

    // Calculate targetedUsersCount
    const targetedUsersCount = await targetingService.calculateTargetedUsersCount({
      targetType: promotion.targetType as any,
      targetUserIds: promotion.targetUserIds,
      targetCriteria: promotion.targetCriteria as any,
    });

    return {
      ...promotion,
      targetedUsersCount,
    };
  },

  async updatePromotion(id: string, data: UpdatePromotionDto) {
    const promotion = await prisma.promotion.update({
      where: { id },
      data: data as any,
      include: {
        price: true,
        _count: {
          select: { applied: true },
        },
      },
    });

    // Calculate targetedUsersCount
    const targetedUsersCount = await targetingService.calculateTargetedUsersCount({
      targetType: promotion.targetType as any,
      targetUserIds: promotion.targetUserIds,
      targetCriteria: promotion.targetCriteria as any,
    });

    return {
      ...promotion,
      targetedUsersCount,
    };
  },

  async deletePromotion(id: string) {
    return prisma.promotion.delete({
      where: { id },
    });
  },

  // Get active promotions for a specific scope and ref
  async getActivePromotions(scope: PriceScope, refId?: string) {
    const now = new Date();
    return prisma.promotion.findMany({
      where: {
        scope,
        refId: refId || null,
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        price: true,
      },
    });
  },

  // Apply promotion to user
  async applyPromotion(promotionId: string, userId: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        _count: {
          select: {
            applied: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new Error("Promotion not found");
    }

    if (!promotion.isActive) {
      throw new Error("Promotion is not active");
    }

    const now = new Date();
    if (now < promotion.startsAt || now > promotion.endsAt) {
      throw new Error("Promotion is not valid at this time");
    }

    // Check max uses
    if (promotion.maxUses && promotion._count.applied >= promotion.maxUses) {
      throw new Error("Promotion has reached maximum uses");
    }

    // Check per-user limit
    if (promotion.perUserLimit) {
      const userUsage = await prisma.appliedPromotion.count({
        where: {
          promotionId,
          userId,
        },
      });

      if (userUsage >= promotion.perUserLimit) {
        throw new Error("User has reached promotion usage limit");
      }
    }

    return prisma.appliedPromotion.create({
      data: {
        promotionId,
        userId,
      },
      include: {
        promotion: {
          include: {
            price: true,
          },
        },
      },
    });
  },

  // Prices
  async createPrice(data: CreatePriceDto) {
    return prisma.price.create({
      data: {
        scope: data.scope,
        refId: data.refId,
        amountCents: data.amountCents,
        currency: data.currency || "EUR",
      },
    });
  },

  async listPrices(scope?: PriceScope, refId?: string) {
    const where: any = {};
    if (scope) where.scope = scope;
    if (refId) where.refId = refId;

    return prisma.price.findMany({
      where,
      include: {
        promotions: {
          where: {
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPriceById(id: string) {
    return prisma.price.findUnique({
      where: { id },
      include: {
        promotions: true,
      },
    });
  },

  async updatePrice(
    id: string,
    data: { amountCents?: number; currency?: string },
    changedBy?: string,
    reason?: string
  ) {
    // Get current price before update
    const currentPrice = await prisma.price.findUnique({
      where: { id },
    });

    if (!currentPrice) {
      throw new Error("Price not found");
    }

    const updateData: any = {};
    if (data.amountCents !== undefined)
      updateData.amountCents = data.amountCents;
    if (data.currency !== undefined) updateData.currency = data.currency;

    // Update price
    const updatedPrice = await prisma.price.update({
      where: { id },
      data: updateData,
      include: {
        promotions: true,
      },
    });

    // Record history if amount changed
    if (
      data.amountCents !== undefined &&
      data.amountCents !== currentPrice.amountCents
    ) {
      await priceHistoryService.createHistoryEntry({
        priceId: id,
        oldAmountCents: currentPrice.amountCents,
        newAmountCents: data.amountCents,
        currency: updatedPrice.currency,
        changedBy,
        reason,
      });
    }

    return updatedPrice;
  },

  async deletePrice(id: string) {
    return prisma.price.delete({
      where: { id },
    });
  },

  // Calculate final price with promotions
  async calculateFinalPrice(priceId: string, userId?: string): Promise<number> {
    const price = await prisma.price.findUnique({
      where: { id: priceId },
      include: {
        promotions: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!price) {
      throw new Error("Price not found");
    }

    let finalPrice = price.amountCents;
    const now = new Date();

    // Find best applicable promotion
    let bestDiscount = 0;

    for (const promo of price.promotions) {
      if (now < promo.startsAt || now > promo.endsAt) continue;

      // Check if user can use this promotion
      if (userId && promo.perUserLimit) {
        const userUsage = await prisma.appliedPromotion.count({
          where: {
            promotionId: promo.id,
            userId,
          },
        });
        if (userUsage >= promo.perUserLimit) continue;
      }

      let discount = 0;
      if (promo.type === "PERCENT" && promo.value) {
        discount = Math.floor((price.amountCents * promo.value) / 100);
      } else if (promo.type === "FIXED" && promo.value) {
        discount = promo.value;
      } else if (promo.type === "FREE") {
        discount = price.amountCents;
      }

      if (discount > bestDiscount) {
        bestDiscount = discount;
      }
    }

    if (bestDiscount > 0) {
      finalPrice = Math.max(0, finalPrice - bestDiscount);
    }

    return finalPrice;
  },

  // Promo codes methods
  generatePromoCode(length: number = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  async isCodeUnique(code: string): Promise<boolean> {
    const existing = await prisma.promotion.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
    });
    return !existing;
  },

  async generateUniqueCode(
    length: number = 8,
    maxAttempts: number = 10
  ): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const code = this.generatePromoCode(length);
      if (await this.isCodeUnique(code)) {
        return code;
      }
    }
    throw new Error("Failed to generate unique promo code");
  },

  async validatePromoCode(code: string): Promise<any | null> {
    const promotion = await prisma.promotion.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
        isActive: true,
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      include: {
        price: true,
      },
    });

    if (!promotion) {
      return null;
    }

    // Check if max uses reached
    if (promotion.maxUses) {
      const usageCount = await prisma.appliedPromotion.count({
        where: {
          promotionId: promotion.id,
        },
      });
      if (usageCount >= promotion.maxUses) {
        return null;
      }
    }

    return promotion;
  },

  async getPromotionByCode(code: string): Promise<any | null> {
    return await prisma.promotion.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
      include: {
        price: true,
        applied: true,
      },
    });
  },
};
