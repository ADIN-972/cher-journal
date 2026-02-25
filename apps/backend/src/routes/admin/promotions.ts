import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../../lib/prisma";

const PromotionCriteriaSchema = z.object({
  minOrders: z.number().optional(),
  maxOrders: z.number().optional(),
  minTotalSpent: z.number().optional(), // en centimes
  maxTotalSpent: z.number().optional(),
  registeredAfter: z.string().datetime().optional(),
  registeredBefore: z.string().datetime().optional(),
  hasOrderType: z.array(z.string()).optional(), // CHAPTER, BUNDLE, etc.
  roles: z.array(z.enum(["USER", "ADMIN"])).optional(),
});

const CreatePromotionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  scope: z.enum([
    "VOLUME",
    "CHAPTER",
    "EPILOGUE",
    "POV_CHAPTER",
    "POV_VOLUME",
    "COLORING",
    "BUNDLE",
    "SUBSCRIPTION",
  ]),
  refId: z.string().optional(),
  type: z.enum(["PERCENT", "FIXED", "FREE"]),
  value: z.number().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  maxUses: z.number().optional(),
  perUserLimit: z.number().optional(),
  isActive: z.boolean().default(true),
  targetType: z.enum(["ALL_USERS", "SPECIFIC_USERS", "CRITERIA_BASED"]),
  targetUserIds: z.array(z.string()).optional(),
  targetCriteria: PromotionCriteriaSchema.optional(),
});

export default async function promotionsRoutes(fastify: FastifyInstance) {
  // Liste toutes les promotions
  fastify.get("/admin/promotions", async (request, reply) => {
    const promotions = await prisma.promotion.findMany({
      include: {
        _count: {
          select: {
            applied: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculer le nombre d'utilisateurs ciblés pour chaque promo
    const promotionsWithCounts = await Promise.all(
      promotions.map(async (promo: any) => {
        const targetedCount = await calculateTargetedUsersCount(promo);
        return {
          ...promo,
          targetedUsersCount: targetedCount,
        };
      })
    );

    return promotionsWithCounts;
  });

  // Récupère une promotion par ID
  fastify.get<{ Params: { id: string } }>(
    "/admin/promotions/:id",
    async (request, reply) => {
      const { id } = request.params;

      const promotion = await prisma.promotion.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              applied: true,
            },
          },
        },
      });

      if (!promotion) {
        return reply.status(404).send({ error: "Promotion not found" });
      }

      const targetedCount = await calculateTargetedUsersCount(promotion);

      return {
        ...promotion,
        targetedUsersCount: targetedCount,
      };
    }
  );

  // Créer une nouvelle promotion
  fastify.post("/admin/promotions", async (request, reply) => {
    const body = CreatePromotionSchema.parse(request.body);

    // Vérifier que les dates sont cohérentes
    if (new Date(body.startsAt) >= new Date(body.endsAt)) {
      return reply
        .status(400)
        .send({ error: "End date must be after start date" });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: body.name,
        description: body.description,
        scope: body.scope,
        refId: body.refId,
        type: body.type,
        value: body.value,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        maxUses: body.maxUses,
        perUserLimit: body.perUserLimit,
        isActive: body.isActive,
        targetType: body.targetType,
        targetUserIds: body.targetUserIds || [],
        targetCriteria: body.targetCriteria || undefined,
        createdBy: request.user?.id, // Assuming auth middleware sets request.user
      },
    });

    const targetedCount = await calculateTargetedUsersCount(promotion);

    return {
      ...promotion,
      targetedUsersCount: targetedCount,
    };
  });

  // Mettre à jour une promotion
  fastify.patch<{ Params: { id: string } }>(
    "/admin/promotions/:id",
    async (request, reply) => {
      const { id } = request.params;
      const body = CreatePromotionSchema.partial().parse(request.body);

      const existingPromo = await prisma.promotion.findUnique({
        where: { id },
      });

      if (!existingPromo) {
        return reply.status(404).send({ error: "Promotion not found" });
      }

      // Vérifier les dates si modifiées
      const startsAt = body.startsAt
        ? new Date(body.startsAt)
        : existingPromo.startsAt;
      const endsAt = body.endsAt ? new Date(body.endsAt) : existingPromo.endsAt;

      if (startsAt >= endsAt) {
        return reply
          .status(400)
          .send({ error: "End date must be after start date" });
      }

      const promotion = await prisma.promotion.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description !== undefined && {
            description: body.description,
          }),
          ...(body.scope && { scope: body.scope }),
          ...(body.refId !== undefined && { refId: body.refId }),
          ...(body.type && { type: body.type }),
          ...(body.value !== undefined && { value: body.value }),
          ...(body.startsAt && { startsAt: new Date(body.startsAt) }),
          ...(body.endsAt && { endsAt: new Date(body.endsAt) }),
          ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
          ...(body.perUserLimit !== undefined && {
            perUserLimit: body.perUserLimit,
          }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
          ...(body.targetType && { targetType: body.targetType }),
          ...(body.targetUserIds !== undefined && {
            targetUserIds: body.targetUserIds,
          }),
          ...(body.targetCriteria !== undefined && {
            targetCriteria: body.targetCriteria,
          }),
        },
      });

      const targetedCount = await calculateTargetedUsersCount(promotion);

      return {
        ...promotion,
        targetedUsersCount: targetedCount,
      };
    }
  );

  // Supprimer une promotion
  fastify.delete<{ Params: { id: string } }>(
    "/admin/promotions/:id",
    async (request, reply) => {
      const { id } = request.params;

      const existingPromo = await prisma.promotion.findUnique({
        where: { id },
      });

      if (!existingPromo) {
        return reply.status(404).send({ error: "Promotion not found" });
      }

      await prisma.promotion.delete({
        where: { id },
      });

      return { success: true };
    }
  );

  // Calculer le nombre d'utilisateurs ciblés (preview)
  fastify.post("/admin/promotions/preview-targeting", async (request, reply) => {
    const body = z
      .object({
        targetType: z.enum(["ALL_USERS", "SPECIFIC_USERS", "CRITERIA_BASED"]),
        targetUserIds: z.array(z.string()).optional(),
        targetCriteria: PromotionCriteriaSchema.optional(),
      })
      .parse(request.body);

    const count = await calculateTargetedUsersCount({
      targetType: body.targetType,
      targetUserIds: body.targetUserIds || [],
      targetCriteria: body.targetCriteria,
    } as any);

    return { targetedUsersCount: count };
  });
}

// Fonction helper pour calculer le nombre d'utilisateurs ciblés
async function calculateTargetedUsersCount(promotion: {
  targetType: string;
  targetUserIds: string[];
  targetCriteria?: any;
}): Promise<number> {
  if (promotion.targetType === "ALL_USERS") {
    return await prisma.user.count({
      where: {
        role: "USER",
        status: "ACTIVE",
      },
    });
  }

  if (promotion.targetType === "SPECIFIC_USERS") {
    return promotion.targetUserIds.length;
  }

  if (
    promotion.targetType === "CRITERIA_BASED" &&
    promotion.targetCriteria
  ) {
    const criteria = promotion.targetCriteria;

    // Construction de la requête avec les critères
    const users = await prisma.user.findMany({
      where: {
        role: criteria.roles ? { in: criteria.roles } : "USER",
        status: "ACTIVE",
        ...(criteria.registeredAfter && {
          createdAt: { gte: new Date(criteria.registeredAfter) },
        }),
        ...(criteria.registeredBefore && {
          createdAt: { lte: new Date(criteria.registeredBefore) },
        }),
      },
      include: {
        orders: {
          where: {
            status: "PAID",
          },
        },
      },
    });

    // Filtrage additionnel basé sur les commandes
    let filteredUsers = users;

    if (criteria.minOrders !== undefined || criteria.maxOrders !== undefined) {
      filteredUsers = filteredUsers.filter((user: any) => {
        const orderCount = user.orders.length;
        if (
          criteria.minOrders !== undefined &&
          orderCount < criteria.minOrders
        )
          return false;
        if (
          criteria.maxOrders !== undefined &&
          orderCount > criteria.maxOrders
        )
          return false;
        return true;
      });
    }

    if (
      criteria.minTotalSpent !== undefined ||
      criteria.maxTotalSpent !== undefined
    ) {
      filteredUsers = filteredUsers.filter((user: any) => {
        const totalSpent = user.orders.reduce(
          (sum: number, order: any) => sum + (order.amountTotal || 0),
          0
        );
        if (
          criteria.minTotalSpent !== undefined &&
          totalSpent < criteria.minTotalSpent
        )
          return false;
        if (
          criteria.maxTotalSpent !== undefined &&
          totalSpent > criteria.maxTotalSpent
        )
          return false;
        return true;
      });
    }

    if (criteria.hasOrderType && criteria.hasOrderType.length > 0) {
      filteredUsers = filteredUsers.filter((user: any) => {
        return user.orders.some((order: any) =>
          criteria.hasOrderType!.includes(order.type)
        );
      });
    }

    return filteredUsers.length;
  }

  return 0;
}
