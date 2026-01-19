import prisma from "../../../lib/prisma";

export class AssetTagsService {
  /**
   * List all tags
   */
  async listTags() {
    return prisma.assetTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    });
  }

  /**
   * Create a new tag
   */
  async createTag(data: {
    name: string;
    description?: string;
    color?: string;
  }) {
    // Check if tag with same name exists
    const existing = await prisma.assetTag.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error("TAG_ALREADY_EXISTS");
    }

    return prisma.assetTag.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });
  }

  /**
   * Update a tag
   */
  async updateTag(
    id: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
    }
  ) {
    // If updating name, check for duplicates
    if (data.name) {
      const existing = await prisma.assetTag.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error("TAG_ALREADY_EXISTS");
      }
    }

    return prisma.assetTag.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a tag (will also remove all taggings)
   */
  async deleteTag(id: string) {
    return prisma.assetTag.delete({
      where: { id },
    });
  }

  /**
   * Add tag to asset
   */
  async tagAsset(assetId: string, tagId: string) {
    // Check if already tagged
    const existing = await prisma.assetTagging.findFirst({
      where: {
        assetId,
        tagId,
      },
    });

    if (existing) {
      return existing; // Already tagged, return existing
    }

    return prisma.assetTagging.create({
      data: {
        assetId,
        tagId,
      },
    });
  }

  /**
   * Remove tag from asset
   */
  async untagAsset(assetId: string, tagId: string) {
    return prisma.assetTagging.deleteMany({
      where: {
        assetId,
        tagId,
      },
    });
  }

  /**
   * Get all tags for an asset
   */
  async getAssetTags(assetId: string) {
    const taggings = await prisma.assetTagging.findMany({
      where: { assetId },
      include: {
        tag: true,
      },
    });

    return taggings.map((t) => t.tag);
  }

  /**
   * Get all assets with a specific tag
   */
  async getAssetsByTag(tagId: string) {
    const taggings = await prisma.assetTagging.findMany({
      where: { tagId },
      include: {
        asset: true,
      },
    });

    return taggings.map((t) => t.asset);
  }

  /**
   * Bulk tag multiple assets
   */
  async bulkTagAssets(assetIds: string[], tagIds: string[]) {
    const operations = [];

    for (const assetId of assetIds) {
      for (const tagId of tagIds) {
        // Check if already exists
        const existing = await prisma.assetTagging.findFirst({
          where: { assetId, tagId },
        });

        if (!existing) {
          operations.push(
            prisma.assetTagging.create({
              data: { assetId, tagId },
            })
          );
        }
      }
    }

    return Promise.all(operations);
  }

  /**
   * Bulk untag multiple assets
   */
  async bulkUntagAssets(assetIds: string[], tagIds: string[]) {
    return prisma.assetTagging.deleteMany({
      where: {
        assetId: { in: assetIds },
        tagId: { in: tagIds },
      },
    });
  }
}

export const assetTagsService = new AssetTagsService();
