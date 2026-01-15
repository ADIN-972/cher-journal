import prisma from "../../../lib/prisma";
import type { CreateEntitlementInput } from "./users.schemas";

export class UsersService {
  async list() {
    return prisma.user.findMany({
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
      },
      orderBy: { createdAt: "desc" },
    });
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
        },
        entitlements: {
          include: { chapter: true },
          orderBy: { grantedAt: "desc" },
        },
        reads: {
          orderBy: { firstOpenedAt: "desc" },
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
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

    return {
      ...user,
      orders: enrichedOrders,
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

  async addEntitlement(userId: string, data: CreateEntitlementInput) {
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: data.chapterId },
    });
    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    // Validate volume range
    if (data.volumeTo < data.volumeFrom) {
      throw new Error("INVALID_VOLUME_RANGE");
    }

    try {
      const entitlement = await prisma.entitlement.create({
        data: {
          userId,
          chapterId: data.chapterId,
          volumeFrom: data.volumeFrom,
          volumeTo: data.volumeTo,
          versionScope: data.versionScope,
          source: data.source,
        },
        include: {
          chapter: true,
        },
      });

      return entitlement;
    } catch (error) {
      console.error("Error creating entitlement:", error);
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
