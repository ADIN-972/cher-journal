import { PrismaClient } from "@prisma/client";
import { priceSchemaService } from "../price-schemas/price-schemas.service.js";

const prisma = new PrismaClient();

export interface BundleItemInput {
  type: "CHAPTER" | "VOLUME";
  chapterId?: string;
  volumeFrom?: number;
  volumeTo?: number;
  displayOrder?: number;
}

export interface CreateBundleInput {
  name: string;
  description?: string;
  slug: string;
  amountCents: number;
  originalAmountCents: number;
  currency?: string;
  isActive?: boolean;
  displayOrder?: number;
  imageUrl?: string;
  validFrom?: Date;
  validUntil?: Date;
  maxPurchases?: number;
  createdBy?: string;
  items: BundleItemInput[];
}

export interface UpdateBundleInput {
  name?: string;
  description?: string;
  slug?: string;
  amountCents?: number;
  originalAmountCents?: number;
  currency?: string;
  isActive?: boolean;
  displayOrder?: number;
  imageUrl?: string;
  validFrom?: Date;
  validUntil?: Date;
  maxPurchases?: number;
  items?: BundleItemInput[];
}

export interface ListBundlesQuery {
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export class BundlesService {
  /**
   * Create a new bundle with its items
   */
  async createBundle(input: CreateBundleInput) {
    // Validate slug uniqueness
    const existingBundle = await prisma.bundle.findUnique({
      where: { slug: input.slug },
    });

    if (existingBundle) {
      throw new Error(`Bundle with slug "${input.slug}" already exists`);
    }

    // Validate bundle items
    await this.validateBundleItems(input.items);

    // Create bundle with items
    const bundle = await prisma.bundle.create({
      data: {
        name: input.name,
        description: input.description,
        slug: input.slug,
        amountCents: input.amountCents,
        originalAmountCents: input.originalAmountCents,
        currency: input.currency || "EUR",
        isActive: input.isActive ?? true,
        displayOrder: input.displayOrder,
        imageUrl: input.imageUrl,
        validFrom: input.validFrom,
        validUntil: input.validUntil,
        maxPurchases: input.maxPurchases,
        createdBy: input.createdBy,
        items: {
          create: input.items.map((item, index) => ({
            type: item.type,
            chapterId: item.chapterId,
            volumeFrom: item.volumeFrom,
            volumeTo: item.volumeTo,
            displayOrder: item.displayOrder ?? index,
          })),
        },
      },
      include: {
        items: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return bundle;
  }

  /**
   * Update an existing bundle
   */
  async updateBundle(id: string, input: UpdateBundleInput) {
    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
    });

    if (!existingBundle) {
      throw new Error(`Bundle with id "${id}" not found`);
    }

    // Validate slug uniqueness if changed
    if (input.slug && input.slug !== existingBundle.slug) {
      const slugExists = await prisma.bundle.findUnique({
        where: { slug: input.slug },
      });

      if (slugExists) {
        throw new Error(`Bundle with slug "${input.slug}" already exists`);
      }
    }

    // Validate bundle items if provided
    if (input.items) {
      await this.validateBundleItems(input.items);
    }

    // Update bundle
    const updateData: any = {
      name: input.name,
      description: input.description,
      slug: input.slug,
      amountCents: input.amountCents,
      originalAmountCents: input.originalAmountCents,
      currency: input.currency,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
      imageUrl: input.imageUrl,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      maxPurchases: input.maxPurchases,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // If items are provided, replace them
    if (input.items) {
      // Delete existing items
      await prisma.bundleItem.deleteMany({
        where: { bundleId: id },
      });

      updateData.items = {
        create: input.items.map((item, index) => ({
          type: item.type,
          chapterId: item.chapterId,
          volumeFrom: item.volumeFrom,
          volumeTo: item.volumeTo,
          displayOrder: item.displayOrder ?? index,
        })),
      };
    }

    const bundle = await prisma.bundle.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return bundle;
  }

  /**
   * List bundles with pagination and filters
   */
  async listBundles(query: ListBundlesQuery = {}) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        include: {
          items: {
            include: {
              chapter: {
                select: {
                  id: true,
                  title: true,
                  protagonistName: true,
                },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
        },
      }),
      prisma.bundle.count({ where }),
    ]);

    return {
      bundles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a bundle by ID
   */
  async getBundleById(id: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!bundle) {
      throw new Error(`Bundle with id "${id}" not found`);
    }

    return bundle;
  }

  /**
   * Get a bundle by slug
   */
  async getBundleBySlug(slug: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!bundle) {
      throw new Error(`Bundle with slug "${slug}" not found`);
    }

    return bundle;
  }

  /**
   * Delete a bundle
   */
  async deleteBundle(id: string) {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      throw new Error(`Bundle with id "${id}" not found`);
    }

    // Delete bundle (items will be cascade deleted)
    await prisma.bundle.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Increment purchase count
   */
  async incrementPurchaseCount(id: string) {
    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        purchaseCount: {
          increment: 1,
        },
      },
    });

    return bundle;
  }

  /**
   * Check if bundle is available for purchase
   */
  async isBundleAvailable(id: string): Promise<boolean> {
    const bundle = await prisma.bundle.findUnique({
      where: { id },
      select: {
        isActive: true,
        validFrom: true,
        validUntil: true,
        maxPurchases: true,
        purchaseCount: true,
      },
    });

    if (!bundle) {
      return false;
    }

    // Check if active
    if (!bundle.isActive) {
      return false;
    }

    const now = new Date();

    // Check validity dates
    if (bundle.validFrom && bundle.validFrom > now) {
      return false;
    }

    if (bundle.validUntil && bundle.validUntil < now) {
      return false;
    }

    // Check max purchases
    if (bundle.maxPurchases && bundle.purchaseCount >= bundle.maxPurchases) {
      return false;
    }

    return true;
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount(bundle: {
    amountCents: number;
    originalAmountCents: number;
  }): number {
    if (bundle.originalAmountCents === 0) {
      return 0;
    }

    const discount =
      ((bundle.originalAmountCents - bundle.amountCents) /
        bundle.originalAmountCents) *
      100;

    return Math.round(discount);
  }

  /**
   * Validate bundle items
   */
  private async validateBundleItems(items: BundleItemInput[]) {
    if (!items || items.length === 0) {
      throw new Error("Bundle must contain at least one item");
    }

    for (const item of items) {
      if (item.type === "CHAPTER") {
        if (!item.chapterId) {
          throw new Error("Chapter items must have a chapterId");
        }

        // Check if chapter exists
        const chapter = await prisma.chapter.findUnique({
          where: { id: item.chapterId },
        });

        if (!chapter) {
          throw new Error(`Chapter with id "${item.chapterId}" not found`);
        }
      } else if (item.type === "VOLUME") {
        if (!item.chapterId) {
          throw new Error("Volume items must have a chapterId");
        }

        if (item.volumeFrom === undefined || item.volumeFrom < 1) {
          throw new Error("Volume items must have a valid volumeFrom");
        }

        // Check if chapter exists
        const chapter = await prisma.chapter.findUnique({
          where: { id: item.chapterId },
        });

        if (!chapter) {
          throw new Error(`Chapter with id "${item.chapterId}" not found`);
        }

        // Note: We don't validate if volumes exist yet, as bundles can reference future volumes
        // This allows creating bundles for content that will be published later
      } else {
        throw new Error(`Invalid item type: ${item.type}`);
      }
    }
  }

  /**
   * Calculate the original price of a bundle based on its items
   * This sums up the individual prices of all included content
   * Uses theoretical/default pricing values from the active price schema
   */
  async calculateOriginalPrice(items: BundleItemInput[]): Promise<number> {
    let totalPrice = 0;

    // Get default pricing values from the active price schema
    // This uses theoretical values, not database Price records
    const activeSchema = await priceSchemaService.getActiveSchema();

    if (!activeSchema) {
      throw new Error("No active price schema found");
    }

    const freeToReadPrice = activeSchema.priceFreeToRead;
    const paywallPriceAmount = activeSchema.pricePaywall;

    for (const item of items) {
      if (item.type === "CHAPTER") {
        if (!item.chapterId) {
          continue;
        }

        // Get chapter-specific pricing (may have overrides)
        const chapterPrices = await priceSchemaService.getChapterPrices(item.chapterId);

        // For a full chapter, we need to count all its volumes
        const volumeCount = await prisma.volume.count({
          where: {
            chapterId: item.chapterId,
          },
        });

        if (volumeCount > 0) {
          // Volumes 1-7 are freeToRead price
          const freeToReadVolumes = Math.min(volumeCount, 7);
          // Volumes 8+ are paywall price
          const paywallVolumes = Math.max(0, volumeCount - 7);

          totalPrice += freeToReadVolumes * chapterPrices.priceFreeToRead;
          totalPrice += paywallVolumes * chapterPrices.pricePaywall;
        }
      } else if (item.type === "VOLUME") {
        if (!item.chapterId) {
          continue;
        }

        // Get chapter-specific pricing (may have overrides)
        const chapterPrices = await priceSchemaService.getChapterPrices(item.chapterId);

        const volumeFrom = item.volumeFrom || 1;
        const volumeTo = item.volumeTo || volumeFrom;

        // Calculate how many volumes are in freeToRead (1-7) and paywall (8+) range
        let freeToReadCount = 0;
        let paywallCount = 0;

        for (let vol = volumeFrom; vol <= volumeTo; vol++) {
          if (vol <= 7) {
            freeToReadCount++;
          } else {
            paywallCount++;
          }
        }

        totalPrice += freeToReadCount * chapterPrices.priceFreeToRead;
        totalPrice += paywallCount * chapterPrices.pricePaywall;
      }
    }

    return totalPrice;
  }

  /**
   * Generate slug from name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-"); // Replace multiple - with single -
  }
}

export const bundlesService = new BundlesService();
