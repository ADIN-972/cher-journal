import prisma from "../../../lib/prisma.js";

interface CreatePriceSchemaDto {
  name: string;
  description?: string;
  priceFreeToRead?: number;
  pricePaywall?: number;
  priceEpilogue?: number;
  createdBy: string;
}

interface UpdatePriceSchemaDto {
  name?: string;
  description?: string;
  priceFreeToRead?: number;
  pricePaywall?: number;
  priceEpilogue?: number;
  appliedFrom?: Date;
  isActive?: boolean;
}

interface CreateChapterPriceOverrideDto {
  schemaId: string;
  priceFreeToRead?: number | null;
  pricePaywall?: number | null;
  priceEpilogue?: number | null;
  reason?: string;
}

export const priceSchemaService = {
  // ============= PRICE SCHEMAS =============

  async createSchema(data: CreatePriceSchemaDto) {
    return prisma.priceSchema.create({
      data: {
        name: data.name,
        description: data.description,
        priceFreeToRead: data.priceFreeToRead || 199,
        pricePaywall: data.pricePaywall || 299,
        priceEpilogue: data.priceEpilogue || 399,
        createdBy: data.createdBy,
      },
    });
  },

  async listSchemas() {
    return prisma.priceSchema.findMany({
      include: {
        chapterOverrides: {
          include: { chapter: { select: { id: true, title: true } } },
        },
        _count: { select: { chapterOverrides: true } },
      },
      orderBy: { appliedFrom: "desc" },
    });
  },

  async getSchemaById(id: string) {
    return prisma.priceSchema.findUnique({
      where: { id },
      include: {
        chapterOverrides: {
          include: { chapter: { select: { id: true, title: true } } },
        },
      },
    });
  },

  async updateSchema(
    id: string,
    data: UpdatePriceSchemaDto,
    changedBy: string
  ) {
    const oldSchema = await prisma.priceSchema.findUnique({ where: { id } });

    if (!oldSchema) {
      throw new Error("SCHEMA_NOT_FOUND");
    }

    // Update schema first
    const result = await prisma.priceSchema.update({
      where: { id },
      data,
    });

    // Create history AFTER update for any relevant field
    const changes = [];
    if (
      data.priceFreeToRead !== undefined ||
      data.pricePaywall !== undefined ||
      data.priceEpilogue !== undefined
    ) {
      changes.push({
        previousValues: {
          priceFreeToRead: oldSchema.priceFreeToRead,
          pricePaywall: oldSchema.pricePaywall,
          priceEpilogue: oldSchema.priceEpilogue,
        },
        newValues: {
          priceFreeToRead: result.priceFreeToRead,
          pricePaywall: result.pricePaywall,
          priceEpilogue: result.priceEpilogue,
        },
        changeReason: "Price changed",
      });
    }
    if (
      data.appliedFrom !== undefined &&
      data.appliedFrom !== oldSchema.appliedFrom
    ) {
      changes.push({
        previousValues: { appliedFrom: oldSchema.appliedFrom },
        newValues: { appliedFrom: result.appliedFrom },
        changeReason: "AppliedFrom changed",
      });
    }
    if (data.isActive !== undefined && data.isActive !== oldSchema.isActive) {
      changes.push({
        previousValues: { isActive: oldSchema.isActive },
        newValues: { isActive: result.isActive },
        changeReason: "isActive changed",
      });
    }
    for (const change of changes) {
      await prisma.priceHistory.create({
        data: {
          // @ts-ignore - entityType field not in Prisma schema
          entityType: "SCHEMA",
          entityId: id,
          previousValues: change.previousValues,
          newValues: change.newValues,
          changeReason: change.changeReason,
          changedBy,
        },
      });
    }
    return result;
  },

  async deactivateSchema(id: string) {
    // Fetch old values
    const oldSchema = await prisma.priceSchema.findUnique({ where: { id } });
    const result = await prisma.priceSchema.update({
      where: { id },
      data: {
        isActive: false,
        appliedTo: new Date(),
      },
    });
    // Record history
    await prisma.priceHistory.create({
      data: {
        // @ts-ignore - entityType field not in Prisma schema
        entityType: "SCHEMA",
        entityId: id,
        previousValues: {
          isActive: oldSchema?.isActive,
          appliedTo: oldSchema?.appliedTo,
        },
        newValues: { isActive: result.isActive, appliedTo: result.appliedTo },
        changeReason: "Deactivated",
        changedBy: oldSchema?.createdBy || "system",
      },
    });
    return result;
  },

  async activateSchema(id: string) {
    // Désactive tous les autres schémas actifs
    await prisma.priceSchema.updateMany({
      where: { isActive: true, id: { not: id } },
      data: { isActive: false },
    });
    // Fetch old values
    const oldSchema = await prisma.priceSchema.findUnique({ where: { id } });
    const result = await prisma.priceSchema.update({
      where: { id },
      data: {
        isActive: true,
        appliedTo: null,
      },
    });
    // Record history
    await prisma.priceHistory.create({
      data: {
        // @ts-ignore - entityType field not in Prisma schema
        entityType: "SCHEMA",
        entityId: id,
        previousValues: {
          isActive: oldSchema?.isActive,
          appliedTo: oldSchema?.appliedTo,
        },
        newValues: { isActive: result.isActive, appliedTo: result.appliedTo },
        changeReason: "Activated",
        changedBy: oldSchema?.createdBy || "system",
      },
    });
    return result;
  },

  async getActiveSchema() {
    const now = new Date();
    return prisma.priceSchema.findFirst({
      where: {
        isActive: true,
        appliedFrom: { lte: now },
        OR: [{ appliedTo: null }, { appliedTo: { gte: now } }],
      },
      orderBy: { appliedFrom: "desc" },
    });
  },

  // ============= CHAPTER PRICE OVERRIDES =============

  async createChapterOverride(
    chapterId: string,
    data: CreateChapterPriceOverrideDto,
    changedBy: string
  ) {
    const oldOverride = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
    });

    let result;

    if (oldOverride) {
      // Update existing override
      result = await prisma.chapterPriceOverride.update({
        where: { chapterId },
        data: {
          priceFreeToRead: data.priceFreeToRead ?? oldOverride.priceFreeToRead,
          pricePaywall: data.pricePaywall ?? oldOverride.pricePaywall,
          priceEpilogue: data.priceEpilogue ?? oldOverride.priceEpilogue,
          reason: data.reason,
        },
        include: { schema: true, chapter: true },
      });

      // Record history AFTER update
      await prisma.priceHistory.create({
        data: {
          // @ts-ignore - entityType field not in Prisma schema
          // @ts-ignore - entityType field not in Prisma schema
        entityType: "OVERRIDE",
          entityId: result.id,
          previousValues: {
            priceFreeToRead: oldOverride.priceFreeToRead,
            pricePaywall: oldOverride.pricePaywall,
            priceEpilogue: oldOverride.priceEpilogue,
            reason: oldOverride.reason,
          },
          newValues: {
            priceFreeToRead: result.priceFreeToRead,
            pricePaywall: result.pricePaywall,
            priceEpilogue: result.priceEpilogue,
            reason: result.reason,
          },
          changeReason: data.reason || null,
          changedBy,
        },
      });
    } else {
      // Create new override
      result = await prisma.chapterPriceOverride.create({
        data: {
          chapterId,
          schemaId: data.schemaId,
          priceFreeToRead: data.priceFreeToRead ?? null,
          pricePaywall: data.pricePaywall ?? null,
          priceEpilogue: data.priceEpilogue ?? null,
          reason: data.reason,
        },
        include: { schema: true, chapter: true },
      });

      // Record history AFTER creation
      await prisma.priceHistory.create({
        data: {
          // @ts-ignore - entityType field not in Prisma schema
          // @ts-ignore - entityType field not in Prisma schema
        entityType: "OVERRIDE",
          entityId: result.id,
          previousValues: undefined,
          newValues: {
            priceFreeToRead: result.priceFreeToRead,
            pricePaywall: result.pricePaywall,
            priceEpilogue: result.priceEpilogue,
            reason: result.reason,
          },
          changeReason: data.reason || null,
          changedBy,
        },
      });
    }

    return result;
  },

  async deleteChapterOverride(chapterId: string, changedBy: string) {
    const override = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
    });

    if (!override) {
      throw new Error("OVERRIDE_NOT_FOUND");
    }

    // Créer historique
    await prisma.priceHistory.create({
      data: {
        // @ts-ignore - entityType field not in Prisma schema
        entityType: "OVERRIDE",
        entityId: override.id,
        previousValues: {
          priceFreeToRead: override.priceFreeToRead,
          pricePaywall: override.pricePaywall,
          priceEpilogue: override.priceEpilogue,
        },
        newValues: undefined,
        changeReason: "Override deleted",
        changedBy,
      },
    });

    return prisma.chapterPriceOverride.delete({
      where: { chapterId },
    });
  },

  async updateChapterOverride(
    chapterId: string,
    data: Partial<CreateChapterPriceOverrideDto>,
    changedBy: string
  ) {
    const oldOverride = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
    });

    if (!oldOverride) {
      throw new Error("OVERRIDE_NOT_FOUND");
    }

    // Update only provided fields
    const updateData: any = {};
    if (data.priceFreeToRead !== undefined)
      updateData.priceFreeToRead = data.priceFreeToRead;
    if (data.pricePaywall !== undefined)
      updateData.pricePaywall = data.pricePaywall;
    if (data.priceEpilogue !== undefined)
      updateData.priceEpilogue = data.priceEpilogue;
    if (data.reason !== undefined) updateData.reason = data.reason;

    const result = await prisma.chapterPriceOverride.update({
      where: { chapterId },
      data: updateData,
      include: { schema: true, chapter: true },
    });

    // Record history AFTER update
    await prisma.priceHistory.create({
      data: {
        // @ts-ignore - entityType field not in Prisma schema
        entityType: "OVERRIDE",
        entityId: result.id,
        previousValues: {
          priceFreeToRead: oldOverride.priceFreeToRead,
          pricePaywall: oldOverride.pricePaywall,
          priceEpilogue: oldOverride.priceEpilogue,
          reason: oldOverride.reason,
        },
        newValues: {
          priceFreeToRead: result.priceFreeToRead,
          pricePaywall: result.pricePaywall,
          priceEpilogue: result.priceEpilogue,
          reason: result.reason,
        },
        changeReason: data.reason || null,
        changedBy,
      },
    });

    return result;
  },

  async listChapterOverrides() {
    return prisma.chapterPriceOverride.findMany({
      include: {
        chapter: { select: { id: true, title: true } },
        schema: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getChapterOverride(chapterId: string) {
    return prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
      include: { chapter: true, schema: true },
    });
  },

  // ============= PRICING LOGIC =============

  async getChapterPrices(chapterId: string) {
    // Chercher l'override du chapitre
    const override = await prisma.chapterPriceOverride.findUnique({
      where: { chapterId },
      include: { schema: true },
    });

    if (override && override.isActive) {
      const schema = override.schema;
      return {
        priceFreeToRead: override.priceFreeToRead ?? schema.priceFreeToRead,
        pricePaywall: override.pricePaywall ?? schema.pricePaywall,
        priceEpilogue: override.priceEpilogue ?? schema.priceEpilogue,
        schemaId: schema.id,
        overrideId: override.id,
        isOverride: true,
      };
    }

    // Sinon, utiliser le schéma actif
    const activeSchema = await this.getActiveSchema();
    if (!activeSchema) {
      throw new Error("NO_ACTIVE_PRICE_SCHEMA");
    }

    return {
      priceFreeToRead: activeSchema.priceFreeToRead,
      pricePaywall: activeSchema.pricePaywall,
      priceEpilogue: activeSchema.priceEpilogue,
      schemaId: activeSchema.id,
      overrideId: null,
      isOverride: false,
    };
  },

  // ============= PRICE HISTORY / AUDIT =============

  async getPriceHistory(chapterId?: string) {
    const where: any = {};

    if (chapterId) {
      const override = await prisma.chapterPriceOverride.findUnique({
        where: { chapterId },
      });
      if (override) {
        where.entityId = override.id;
      }
    }

    return prisma.priceHistory.findMany({
      where,
      orderBy: { changedAt: "desc" },
    });
  },

  async getPriceHistoryDetail(entityId: string) {
    return prisma.priceHistory.findMany({
      // @ts-ignore - entityId field not in Prisma schema
      where: { entityId },
      orderBy: { changedAt: "desc" },
    });
  },
};
