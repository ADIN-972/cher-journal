import { PrismaClient } from "@prisma/client";
import type { PriceScope, PromotionType } from "@cher-journal/types";

const prisma = new PrismaClient();

interface CreatePromotionDto {
  scope: PriceScope;
  refId?: string;
  type: PromotionType;
  value?: number;
  startsAt: Date;
  endsAt: Date;
  maxUses?: number;
  perUserLimit?: number;
  priceId?: string;
}

interface UpdatePromotionDto {
  type?: PromotionType;
  value?: number;
  startsAt?: Date;
  endsAt?: Date;
  maxUses?: number;
  perUserLimit?: number;
  isActive?: boolean;
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
    return prisma.promotion.create({
      data: {
        scope: data.scope,
        refId: data.refId,
        type: data.type,
        value: data.value,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        maxUses: data.maxUses,
        perUserLimit: data.perUserLimit,
        priceId: data.priceId,
      },
      include: {
        price: true,
      },
    });
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

      return {
        promotions,
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
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        price: true,
        _count: {
          select: { applied: true },
        },
      },
    });
  },

  async updatePromotion(id: string, data: UpdatePromotionDto) {
    return prisma.promotion.update({
      where: { id },
      data,
      include: {
        price: true,
      },
    });
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
    data: { amountCents?: number; currency?: string }
  ) {
    const updateData: any = {};
    if (data.amountCents !== undefined)
      updateData.amountCents = data.amountCents;
    if (data.currency !== undefined) updateData.currency = data.currency;

    return prisma.price.update({
      where: { id },
      data: updateData,
      include: {
        promotions: true,
      },
    });
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
};
