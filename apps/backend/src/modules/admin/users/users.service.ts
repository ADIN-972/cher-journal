import prisma from "../../../lib/prisma";
import { VolumeStatus } from "@prisma/client";
import type { CreateEntitlementInput } from "./users.schemas";
import { AccessControlService } from "../../../lib/accessControl";
import { resolveAssetUrl } from "../../../lib/assetUtils";

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
        firstName: true,
        lastName: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            orders: true,
            entitlements: true,
          },
        },
        entitlements: {
          select: {
            chapterId: true,
          },
        },
        sessions: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" as const },
          take: 1,
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

    // Remove orders/entitlements/sessions from response, add computed fields
    return users.map(({ orders, entitlements, sessions, ...user }) => ({
      ...user,
      chaptersCount: new Set(entitlements.map((e) => e.chapterId)).size,
      lastActivity: sessions[0]?.createdAt || null,
    }));
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
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
        subscription: true,
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

  async update(id: string, data: { status?: string; role?: string; firstName?: string; lastName?: string; username?: string; email?: string }) {
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
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.username !== undefined && { username: data.username || null }),
        },
        select: {
          id: true,
          publicId: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
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

  /**
   * Get daily connection stats for the last N days.
   */
  async getConnectionStats(days: number = 15) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // LOGIN events from activity logs
    const loginEvents = await prisma.userActivityLog.findMany({
      where: { eventType: 'LOGIN', createdAt: { gte: since } },
      select: { createdAt: true, userId: true },
    });

    // Active sessions
    const activeSessions = await prisma.session.findMany({
      where: { lastActiveAt: { gte: since } },
      select: { lastActiveAt: true, userId: true },
    });

    // Build map: date → unique user IDs
    const dailyUsers: Record<string, Set<string>> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyUsers[d.toISOString().split('T')[0]] = new Set();
    }

    for (const e of loginEvents) {
      const key = e.createdAt.toISOString().split('T')[0];
      if (dailyUsers[key]) dailyUsers[key].add(e.userId);
    }

    for (const s of activeSessions) {
      if (s.lastActiveAt) {
        const key = s.lastActiveAt.toISOString().split('T')[0];
        if (dailyUsers[key]) dailyUsers[key].add(s.userId);
      }
    }

    const result = Object.entries(dailyUsers)
      .map(([date, users]) => ({
        date,
        count: users.size,
        label: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const total = result.reduce((sum, d) => sum + d.count, 0);

    return {
      days: result,
      average: days > 0 ? Math.round((total / days) * 10) / 10 : 0,
      total,
    };
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

  async grantClubMembership(
    userId: string,
    data: { startDate: string; endDate: string | null; reason?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const startDate = new Date(data.startDate);
    // null endDate = infinite → set to year 2099
    const endDate = data.endDate ? new Date(data.endDate) : new Date('2099-12-31T23:59:59Z');

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: 'ACTIVE',
        planName: data.reason || 'Club Prive (manuel)',
        priceAmountCents: 0,
        currency: 'EUR',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
      update: {
        status: 'ACTIVE',
        planName: data.reason || 'Club Prive (manuel)',
        priceAmountCents: 0,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    return subscription;
  }

  async revokeClubMembership(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new Error("NO_SUBSCRIPTION");

    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return updated;
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

  /**
   * Get all chapters with volume-level access details for a specific user.
   * Admin-only endpoint that shows what the user can access.
   */
  async getUserChapters(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const accessControl = new AccessControlService();
    const now = new Date();

    const chapters = await prisma.chapter.findMany({
      where: { isArchived: false },
      include: {
        coverAsset: true,
        volumes: {
          include: {
            illustrationAsset: true,
          },
          orderBy: { volumeNumber: "asc" },
        },
        _count: { select: { volumes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user reads for progress info
    const [userReads, readingSessions] = await Promise.all([
      prisma.volumeRead.findMany({
        where: { userId },
        select: {
          chapterId: true,
          volumeNumber: true,
          perspective: true,
          progress: true,
          firstOpenedAt: true,
          completedAt: true,
        },
      }),
      prisma.readingSession.groupBy({
        by: ['chapterId', 'volumeNumber', 'perspective'],
        where: { userId },
        _sum: { totalSeconds: true },
      }),
    ]);

    // Build a lookup: chapterId-volumeNumber-perspective -> totalSeconds
    const timeSpentLookup = new Map<string, number>();
    readingSessions.forEach((s) => {
      const key = `${s.chapterId}-${s.volumeNumber}-${s.perspective}`;
      timeSpentLookup.set(key, s._sum.totalSeconds || 0);
    });

    const result = await Promise.all(
      chapters.map(async (chapter) => {
        const coverUrl = await resolveAssetUrl(chapter.coverAsset);

        // Process each published volume with access info
        const volumesWithAccess = await Promise.all(
          chapter.volumes
            .filter(
              (v) =>
                v.status === VolumeStatus.PUBLISHED &&
                (v.scheduledFor === null || v.scheduledFor <= now)
            )
            .map(async (volume) => {
              const narratorAccess = await accessControl.getVolumeAccessInfo(
                userId,
                chapter.id,
                volume.volumeNumber,
                "NARRATOR" as any
              );
              const protagonistAccess = await accessControl.getVolumeAccessInfo(
                userId,
                chapter.id,
                volume.volumeNumber,
                "PROTAGONIST" as any
              );

              // Reading progress
              const reads = userReads.filter(
                (r) =>
                  r.chapterId === chapter.id &&
                  r.volumeNumber === volume.volumeNumber
              );
              const progressByPerspective: Record<string, number> = {};
              const timeSpentByPerspective: Record<string, number> = {};
              reads.forEach((r) => {
                progressByPerspective[r.perspective] = r.progress;
                const key = `${chapter.id}-${volume.volumeNumber}-${r.perspective}`;
                timeSpentByPerspective[r.perspective] = timeSpentLookup.get(key) || 0;
              });

              const illustrationUrl = await resolveAssetUrl(
                volume.illustrationAsset
              );

              return {
                id: volume.id,
                volumeNumber: volume.volumeNumber,
                title: volume.title,
                isFree: volume.isFree,
                illustrationAsset: volume.illustrationAsset
                  ? { id: volume.illustrationAsset.id, url: illustrationUrl }
                  : null,
                accessByPerspective: {
                  NARRATOR: narratorAccess,
                  PROTAGONIST: protagonistAccess,
                },
                progressByPerspective,
                timeSpentByPerspective,
                completedAt: reads.find((r) => r.completedAt)?.completedAt || null,
              };
            })
        );

        return {
          id: chapter.id,
          title: chapter.title,
          protagonistName: chapter.protagonistName,
          status: chapter.status,
          coverAsset: chapter.coverAsset
            ? { id: chapter.coverAsset.id, url: coverUrl }
            : null,
          totalVolumes: volumesWithAccess.length,
          volumes: volumesWithAccess,
        };
      })
    );

    return JSON.parse(JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v));
  }
}
