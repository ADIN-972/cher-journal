import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreatePriceHistoryDto {
  priceId: string;
  oldAmountCents: number;
  newAmountCents: number;
  currency?: string;
  changedBy?: string;
  reason?: string;
}

interface ListPriceHistoryQuery {
  priceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export const priceHistoryService = {
  async createHistoryEntry(data: CreatePriceHistoryDto) {
    return await prisma.priceHistory.create({
      data: {
        priceId: data.priceId,
        oldAmountCents: data.oldAmountCents,
        newAmountCents: data.newAmountCents,
        currency: data.currency || "EUR",
        changedBy: data.changedBy,
        reason: data.reason,
      },
      include: {
        price: {
          include: {
            promotions: true,
          },
        },
      },
    });
  },

  async getHistoryByPriceId(priceId: string) {
    return await prisma.priceHistory.findMany({
      where: {
        priceId,
      },
      orderBy: {
        changedAt: "desc",
      },
      include: {
        price: true,
      },
    });
  },

  async listHistory(query: ListPriceHistoryQuery) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.priceId) {
      where.priceId = query.priceId;
    }

    if (query.startDate || query.endDate) {
      where.changedAt = {};
      if (query.startDate) {
        where.changedAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.changedAt.lte = query.endDate;
      }
    }

    const [items, total] = await Promise.all([
      prisma.priceHistory.findMany({
        where,
        orderBy: {
          changedAt: "desc",
        },
        skip,
        take: limit,
        include: {
          price: true,
        },
      }),
      prisma.priceHistory.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStatistics(priceId?: string) {
    const where: any = priceId ? { priceId } : {};

    const totalChanges = await prisma.priceHistory.count({ where });

    const avgChange = await prisma.priceHistory.aggregate({
      where,
      _avg: {
        newAmountCents: true,
        oldAmountCents: true,
      },
    });

    const maxIncrease = await prisma.priceHistory.findFirst({
      where: {
        ...where,
        newAmountCents: {
          gt: prisma.priceHistory.fields.oldAmountCents,
        },
      },
      orderBy: {
        newAmountCents: "desc",
      },
      include: {
        price: true,
      },
    });

    const maxDecrease = await prisma.priceHistory.findFirst({
      where: {
        ...where,
        newAmountCents: {
          lt: prisma.priceHistory.fields.oldAmountCents,
        },
      },
      orderBy: {
        newAmountCents: "asc",
      },
      include: {
        price: true,
      },
    });

    return {
      totalChanges,
      averageOldPrice: avgChange._avg.oldAmountCents,
      averageNewPrice: avgChange._avg.newAmountCents,
      maxIncrease,
      maxDecrease,
    };
  },

  async getRecentChanges(limit: number = 10) {
    return await prisma.priceHistory.findMany({
      orderBy: {
        changedAt: "desc",
      },
      take: limit,
      include: {
        price: true,
      },
    });
  },
};
