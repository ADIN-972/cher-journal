import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PromotionCriteria {
  minOrders?: number;
  maxOrders?: number;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  registeredAfter?: string;
  registeredBefore?: string;
  hasOrderType?: string[];
  roles?: ("USER" | "ADMIN")[];
}

export interface TargetingPreview {
  targetType: "ALL_USERS" | "SPECIFIC_USERS" | "CRITERIA_BASED";
  targetUserIds?: string[];
  targetCriteria?: PromotionCriteria;
}

export const targetingService = {
  async calculateTargetedUsersCount(preview: TargetingPreview): Promise<number> {
    if (preview.targetType === "ALL_USERS") {
      return await prisma.user.count({
        where: {
          role: "USER",
          status: "ACTIVE",
        },
      });
    }

    if (preview.targetType === "SPECIFIC_USERS") {
      return preview.targetUserIds?.length || 0;
    }

    if (
      preview.targetType === "CRITERIA_BASED" &&
      preview.targetCriteria
    ) {
      return await this.countUsersByCriteria(preview.targetCriteria);
    }

    return 0;
  },

  async countUsersByCriteria(criteria: PromotionCriteria): Promise<number> {
    // Construction de la requête de base
    const baseWhere: any = {
      status: "ACTIVE",
    };

    if (criteria.roles && criteria.roles.length > 0) {
      baseWhere.role = { in: criteria.roles };
    } else {
      baseWhere.role = "USER";
    }

    if (criteria.registeredAfter) {
      baseWhere.createdAt = {
        ...baseWhere.createdAt,
        gte: new Date(criteria.registeredAfter),
      };
    }

    if (criteria.registeredBefore) {
      baseWhere.createdAt = {
        ...baseWhere.createdAt,
        lte: new Date(criteria.registeredBefore),
      };
    }

    // Si pas de critères liés aux commandes, on peut compter directement
    if (
      !criteria.minOrders &&
      !criteria.maxOrders &&
      !criteria.minTotalSpent &&
      !criteria.maxTotalSpent &&
      (!criteria.hasOrderType || criteria.hasOrderType.length === 0)
    ) {
      return await prisma.user.count({ where: baseWhere });
    }

    // Sinon, on doit récupérer les utilisateurs avec leurs commandes
    const users = await prisma.user.findMany({
      where: baseWhere,
      include: {
        orders: {
          where: {
            status: "PAID",
          },
        },
      },
    });

    let filteredUsers = users;

    // Filtrage par nombre de commandes
    if (criteria.minOrders !== undefined || criteria.maxOrders !== undefined) {
      filteredUsers = filteredUsers.filter((user) => {
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

    // Filtrage par montant total dépensé
    if (
      criteria.minTotalSpent !== undefined ||
      criteria.maxTotalSpent !== undefined
    ) {
      filteredUsers = filteredUsers.filter((user) => {
        const totalSpent = user.orders.reduce(
          (sum, order) => sum + (order.amountTotal || 0),
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

    // Filtrage par type de commande
    if (criteria.hasOrderType && criteria.hasOrderType.length > 0) {
      filteredUsers = filteredUsers.filter((user) => {
        return user.orders.some((order) =>
          criteria.hasOrderType!.includes(order.type)
        );
      });
    }

    return filteredUsers.length;
  },

  async getTargetedUserIds(preview: TargetingPreview): Promise<string[]> {
    if (preview.targetType === "ALL_USERS") {
      const users = await prisma.user.findMany({
        where: {
          role: "USER",
          status: "ACTIVE",
        },
        select: { id: true },
      });
      return users.map((u) => u.id);
    }

    if (preview.targetType === "SPECIFIC_USERS") {
      return preview.targetUserIds || [];
    }

    if (
      preview.targetType === "CRITERIA_BASED" &&
      preview.targetCriteria
    ) {
      const criteria = preview.targetCriteria;

      const baseWhere: any = {
        status: "ACTIVE",
      };

      if (criteria.roles && criteria.roles.length > 0) {
        baseWhere.role = { in: criteria.roles };
      } else {
        baseWhere.role = "USER";
      }

      if (criteria.registeredAfter) {
        baseWhere.createdAt = {
          ...baseWhere.createdAt,
          gte: new Date(criteria.registeredAfter),
        };
      }

      if (criteria.registeredBefore) {
        baseWhere.createdAt = {
          ...baseWhere.createdAt,
          lte: new Date(criteria.registeredBefore),
        };
      }

      const users = await prisma.user.findMany({
        where: baseWhere,
        include: {
          orders: {
            where: {
              status: "PAID",
            },
          },
        },
      });

      let filteredUsers = users;

      // Apply same filters as countUsersByCriteria
      if (
        criteria.minOrders !== undefined ||
        criteria.maxOrders !== undefined
      ) {
        filteredUsers = filteredUsers.filter((user) => {
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
        filteredUsers = filteredUsers.filter((user) => {
          const totalSpent = user.orders.reduce(
            (sum, order) => sum + (order.amountTotal || 0),
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
        filteredUsers = filteredUsers.filter((user) => {
          return user.orders.some((order) =>
            criteria.hasOrderType!.includes(order.type)
          );
        });
      }

      return filteredUsers.map((u) => u.id);
    }

    return [];
  },
};
