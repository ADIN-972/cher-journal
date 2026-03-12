import prisma from "../../../lib/prisma";
import type { CreateEntitlementInput } from "./users.schemas";

interface UserFilterQuery {
  role?: "ALL" | "ADMIN" | "USER";
  status?: "ALL" | "ACTIVE" | "SUSPENDED";
  registeredAfter?: string;
  registeredBefore?: string;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minOrderCount?: number;
  maxOrderCount?: number;
  searchQuery?: string;
}

export class UsersService {
  async list(filters?: UserFilterQuery) {
    const where: any = {};

    // Role filter
    if (filters?.role && filters.role !== "ALL") {
      where.role = filters.role;
    }

    // Status filter
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    // Registration date filters
    if (filters?.registeredAfter || filters?.registeredBefore) {
      where.createdAt = {};
      if (filters.registeredAfter) {
        where.createdAt.gte = new Date(filters.registeredAfter);
      }
      if (filters.registeredBefore) {
        where.createdAt.lte = new Date(filters.registeredBefore);
      }
    }

    // Search query (email)
    if (filters?.searchQuery) {
      where.email = {
        contains: filters.searchQuery,
        mode: "insensitive",
      };
    }

    // Get users with basic filters
    let users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        publicId: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            entitlements: true,
          },
        },
        orders: {
          where: {
            status: "PAID",
          },
          select: {
            amountTotal: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply filters that require aggregation
    if (
      filters?.minTotalSpent !== undefined ||
      filters?.maxTotalSpent !== undefined ||
      filters?.minOrderCount !== undefined ||
      filters?.maxOrderCount !== undefined
    ) {
      users = users.filter((user) => {
        // Calculate total spent
        const totalSpent = user.orders.reduce(
          (sum, order) => sum + (order.amountTotal || 0),
          0
        );

        // Filter by total spent
        if (
          filters.minTotalSpent !== undefined &&
          totalSpent < filters.minTotalSpent
        ) {
          return false;
        }
        if (
          filters.maxTotalSpent !== undefined &&
          totalSpent > filters.maxTotalSpent
        ) {
          return false;
        }

        // Filter by order count
        const orderCount = user._count.orders;
        if (
          filters.minOrderCount !== undefined &&
          orderCount < filters.minOrderCount
        ) {
          return false;
        }
        if (
          filters.maxOrderCount !== undefined &&
          orderCount > filters.maxOrderCount
        ) {
          return false;
        }

        return true;
      });
    }

    // Remove orders from response (only needed for filtering)
    return users.map(({ orders, ...user }) => user);
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        publicId: true,
        email: true,
        status: true,
        role: true,
        createdAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            appliedPromotion: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true,
                value: true,
                scope: true,
              },
            } as any,
          } as any,
        },
        entitlements: {
          include: { chapter: true },
          orderBy: { grantedAt: "desc" },
        },
        reads: {
          orderBy: { firstOpenedAt: "desc" },
          select: {
            id: true,
            chapterId: true,
            volumeNumber: true,
            perspective: true,
            progress: true,
            firstOpenedAt: true,
            completedAt: true,
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
        },
        appliedPromotions: {
          include: {
            promotion: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true,
                value: true,
                scope: true,
                code: true,
                targetType: true,
              },
            },
          },
          orderBy: { appliedAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Enrichir les orders avec les informations des entitlements
    const enrichedOrders = await Promise.all(
      user.orders.map(async (order) => {
        // Trouver l'entitlement créé au même moment (ou juste après) que la commande
        const relatedEntitlement = user.entitlements.find(
          (ent) =>
            Math.abs(
              new Date(ent.grantedAt).getTime() -
                new Date(order.createdAt).getTime()
            ) < 10000
        );

        return {
          ...order,
          chapter: relatedEntitlement
            ? {
                id: relatedEntitlement.chapter.id,
                title: relatedEntitlement.chapter.title,
              }
            : null,
          volumeFrom: relatedEntitlement?.volumeFrom,
          volumeTo: relatedEntitlement?.volumeTo,
        };
      })
    );

    // Récupérer les promotions applicables
    const applicablePromotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
        OR: [
          { targetType: "ALL_USERS" },
          {
            targetType: "SPECIFIC_USERS",
            targetUserIds: { has: id },
          },
          { targetType: "CRITERIA_BASED" },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        scope: true,
        type: true,
        value: true,
        code: true,
        targetType: true,
        isActive: true,
        startsAt: true,
        endsAt: true,
        maxUses: true,
        perUserLimit: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      ...user,
      orders: enrichedOrders,
      applicablePromotions,
    };
  }

  async update(id: string, data: { status?: string; role?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status as any }),
          ...(data.role && { role: data.role as any }),
        },
        select: {
          id: true,
          publicId: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
        },
      });

      return updated;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("UPDATE_FAILED");
    }
  }

  async bulkSuspend(userIds: string[]) {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        status: "SUSPENDED",
      },
    });

    return { count: result.count };
  }

  async bulkActivate(userIds: string[]) {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        status: "ACTIVE",
      },
    });

    return { count: result.count };
  }

  async bulkPromote(userIds: string[]) {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        role: "ADMIN",
      },
    });

    return { count: result.count };
  }

  async bulkDemote(userIds: string[]) {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        role: "USER",
      },
    });

    return { count: result.count };
  }

  async addEntitlement(userId: string, data: CreateEntitlementInput) {
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Determine which chapters to add entitlements for
    const chapterIds = data.chapterIds && data.chapterIds.length > 0
      ? data.chapterIds
      : (data.chapterId ? [data.chapterId] : []);

    if (chapterIds.length === 0) {
      throw new Error("NO_CHAPTERS_PROVIDED");
    }

    // Verify all chapters exist
    const chapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
    });

    if (chapters.length !== chapterIds.length) {
      throw new Error("SOME_CHAPTERS_NOT_FOUND");
    }

    // Validate volume range
    if (data.volumeTo < data.volumeFrom) {
      throw new Error("INVALID_VOLUME_RANGE");
    }

    try {
      // Create entitlements for all chapters
      const createdEntitlements = await Promise.all(
        chapterIds.map((chapterId) =>
          prisma.entitlement.create({
            data: {
              userId,
              chapterId,
              volumeFrom: data.volumeFrom,
              volumeTo: data.volumeTo,
              scopes: data.scopes,
              source: data.source,
            },
            include: {
              chapter: true,
            },
          })
        )
      );

      // Return first entitlement for single chapter, array for multiple
      return chapterIds.length === 1 ? createdEntitlements[0] : createdEntitlements;
    } catch (error) {
      console.error("Error creating entitlements:", error);
      throw new Error("ENTITLEMENT_CREATE_FAILED");
    }
  }

  async removeEntitlement(userId: string, entitlementId: string) {
    const entitlement = await prisma.entitlement.findUnique({
      where: { id: entitlementId },
    });

    if (!entitlement) {
      throw new Error("ENTITLEMENT_NOT_FOUND");
    }

    if (entitlement.userId !== userId) {
      throw new Error("ENTITLEMENT_MISMATCH");
    }

    try {
      await prisma.entitlement.delete({
        where: { id: entitlementId },
      });
    } catch (error) {
      console.error("Error deleting entitlement:", error);
      throw new Error("ENTITLEMENT_DELETE_FAILED");
    }
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    if (session.userId !== userId) {
      throw new Error("SESSION_MISMATCH");
    }

    try {
      await prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      console.error("Error revoking session:", error);
      throw new Error("SESSION_REVOKE_FAILED");
    }
  }
}
