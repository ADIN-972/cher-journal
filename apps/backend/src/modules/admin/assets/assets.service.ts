import prisma from "../../../lib/prisma";
import { AssetKind } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { config } from "@cher-journal/config";
import sharp from "sharp";
import crypto from "crypto";

export class AssetsService {
  /**
   * List assets with advanced filtering
   */
  async list(
    chapterId: string,
    filters?: {
      kind?: AssetKind;
      search?: string; // Search by label
      tagIds?: string[]; // Filter by tags
      showDuplicates?: boolean; // Show only assets with SHA256 duplicates
    }
  ) {
    // Build where clause
    const where: any = { chapterId };

    // Filter by kind
    if (filters?.kind) {
      where.kind = filters.kind;
    }

    // Search by label
    if (filters?.search) {
      where.label = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    // Filter by tags
    if (filters?.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: filters.tagIds },
        },
      };
    }

    // Show only duplicates
    if (filters?.showDuplicates) {
      // Find all SHA256 hashes that appear more than once
      const duplicateHashes = await prisma.chapterAsset.groupBy({
        by: ["sha256"],
        where: {
          chapterId,
          sha256: { not: null },
        },
        having: {
          sha256: {
            _count: {
              gt: 1,
            },
          },
        },
      });

      where.sha256 = {
        in: duplicateHashes.map((d) => d.sha256).filter((h): h is string => h !== null),
      };
    }

    const assets = await prisma.chapterAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        coverFor: {
          select: { id: true },
        },
        illustrationFor: {
          select: { id: true },
        },
        versionIllustrationFor: {
          select: { id: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return assets.map((asset) => ({
      ...asset,
      isChapterCover: asset.coverFor.length > 0,
      usedByVolumes: asset.illustrationFor.map((v) => v.id),
      usedByVersions: asset.versionIllustrationFor.map((v) => v.id),
    }));
  }

  /**
   * Find duplicate assets by SHA256 hash
   */
  async findDuplicates(chapterId: string) {
    const duplicateHashes = await prisma.chapterAsset.groupBy({
      by: ["sha256"],
      where: {
        chapterId,
        sha256: { not: null },
      },
      having: {
        sha256: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const duplicateGroups = await Promise.all(
      duplicateHashes.map(async (group) => {
        const assets = await prisma.chapterAsset.findMany({
          where: {
            chapterId,
            sha256: group.sha256,
          },
          include: {
            coverFor: { select: { id: true } },
            illustrationFor: { select: { id: true } },
            versionIllustrationFor: { select: { id: true } },
          },
        });

        return {
          sha256: group.sha256,
          count: assets.length,
          assets: assets.map((asset) => ({
            ...asset,
            isChapterCover: asset.coverFor.length > 0,
            usedByVolumes: asset.illustrationFor.map((v) => v.id),
            usedByVersions: asset.versionIllustrationFor.map((v) => v.id),
          })),
        };
      })
    );

    return duplicateGroups;
  }

  async upload(
    chapterId: string,
    file: { filename: string; mimetype: string; data: Buffer },
    kind: AssetKind,
    label?: string
  ) {
    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    // Generate unique filename
    const ext = path.extname(file.filename);
    const hash = crypto.createHash("sha256").update(file.data).digest("hex");
    const objectKey = `${chapterId}/${Date.now()}-${hash.slice(0, 8)}${ext}`;
    const filePath = path.join(config.uploadDir, objectKey);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Get image dimensions using sharp
    let width: number | undefined;
    let height: number | undefined;
    let thumbnailObjectKey: string | undefined;

    try {
      const metadata = await sharp(file.data).metadata();
      width = metadata.width;
      height = metadata.height;

      // Generate thumbnail (600x600 max, preserving aspect ratio)
      const thumbnail = await sharp(file.data)
        .resize(600, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      const thumbnailKey = `${chapterId}/${Date.now()}-${hash.slice(0, 8)}-thumb${ext}`;
      const thumbnailPath = path.join(config.uploadDir, thumbnailKey);
      await fs.writeFile(thumbnailPath, thumbnail);
      thumbnailObjectKey = thumbnailKey;
    } catch (err) {
      // Not an image or unsupported format - skip thumbnail generation
    }

    // Save original file
    await fs.writeFile(filePath, file.data);

    // Create database record
    const asset = await prisma.chapterAsset.create({
      data: {
        chapterId,
        kind,
        label,
        objectKey,
        thumbnailObjectKey,
        mimeType: file.mimetype,
        sizeBytes: file.data.length,
        width,
        height,
        sha256: hash,
      },
    });

    return asset;
  }

  async delete(id: string) {
    const asset = await prisma.chapterAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // Delete original file
    const filePath = path.join(config.uploadDir, asset.objectKey);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // File might not exist, that's ok
    }

    // Delete thumbnail if it exists
    if (asset.thumbnailObjectKey) {
      const thumbnailPath = path.join(
        config.uploadDir,
        asset.thumbnailObjectKey
      );
      try {
        await fs.unlink(thumbnailPath);
      } catch (err) {
        // Thumbnail might not exist, that's ok
      }
    }

    // Delete database record
    await prisma.chapterAsset.delete({
      where: { id },
    });
  }

  async update(
    id: string,
    chapterId: string,
    updates: { kind?: AssetKind; label?: string | null }
  ) {
    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    // Verify asset exists and belongs to chapter
    const asset = await prisma.chapterAsset.findUnique({
      where: { id },
    });

    if (!asset || asset.chapterId !== chapterId) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // Update asset
    return prisma.chapterAsset.update({
      where: { id },
      data: {
        ...(updates.kind && { kind: updates.kind }),
        ...(updates.label !== undefined && { label: updates.label }),
      },
    });
  }

  async assignToVersion(
    assetId: string,
    versionId: string,
    assetOrder: number
  ) {
    // Verify asset exists
    const asset = await prisma.chapterAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // Verify version exists
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: { volume: { select: { chapterId: true } } },
    });

    if (!version || version.volume.chapterId !== asset.chapterId) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // Create version asset
    return prisma.versionAsset.create({
      data: {
        volumeVersionId: versionId,
        chapterAssetId: assetId,
        assetOrder,
      },
    });
  }

  async unassignFromVersion(assetId: string, versionId: string) {
    // Verify asset and version exist
    const asset = await prisma.chapterAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("ASSET_NOT_FOUND");
    }

    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // Delete version asset
    return prisma.versionAsset.deleteMany({
      where: {
        volumeVersionId: versionId,
        chapterAssetId: assetId,
      },
    });
  }

  async getVersions(volumeId: string) {
    return prisma.volumeVersion.findMany({
      where: { volumeId },
      orderBy: { perspective: "asc" },
    });
  }

  /**
   * Extract volume number from filename
   * Examples: "jasmine 5.png" -> 5, "Jasmine 11.png" -> 11
   */
  private extractVolumeNumberFromFilename(filename: string): number | null {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^.]+$/, "");

    // Look for a number at the end of the filename
    // Match one or more digits that might be preceded by space or other chars
    const match = nameWithoutExt.match(/\s*(\d+)\s*$/);

    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return null;
  }

  /**
   * Create a new version of an asset
   */
  async createVersion(
    originalAssetId: string,
    file: { filename: string; mimetype: string; data: Buffer },
    label?: string
  ) {
    // Get original asset
    const original = await prisma.chapterAsset.findUnique({
      where: { id: originalAssetId },
    });

    if (!original) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // Get the highest version number for this asset family
    const allVersions = await prisma.chapterAsset.findMany({
      where: {
        OR: [
          { id: originalAssetId },
          { originalAssetId: originalAssetId },
        ],
      },
      orderBy: { version: "desc" },
    });

    const maxVersion = allVersions.length > 0 ? allVersions[0].version : 0;
    const newVersion = maxVersion + 1;

    // Upload the new version using the same logic as upload
    const ext = path.extname(file.filename);
    const hash = crypto.createHash("sha256").update(file.data).digest("hex");
    const objectKey = `${original.chapterId}/${Date.now()}-${hash.slice(0, 8)}-v${newVersion}${ext}`;
    const filePath = path.join(config.uploadDir, objectKey);

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Get image dimensions and create thumbnail
    let width: number | undefined;
    let height: number | undefined;
    let thumbnailObjectKey: string | undefined;

    try {
      const metadata = await sharp(file.data).metadata();
      width = metadata.width;
      height = metadata.height;

      const thumbnail = await sharp(file.data)
        .resize(600, 600, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();

      const thumbnailKey = `${original.chapterId}/${Date.now()}-${hash.slice(0, 8)}-v${newVersion}-thumb${ext}`;
      const thumbnailPath = path.join(config.uploadDir, thumbnailKey);
      await fs.writeFile(thumbnailPath, thumbnail);
      thumbnailObjectKey = thumbnailKey;
    } catch (err) {
      // Not an image or unsupported format
    }

    await fs.writeFile(filePath, file.data);

    // Create new version asset
    const newAsset = await prisma.chapterAsset.create({
      data: {
        chapterId: original.chapterId,
        kind: original.kind,
        label: label || `${original.label} (v${newVersion})`,
        objectKey,
        thumbnailObjectKey,
        mimeType: file.mimetype,
        sizeBytes: file.data.length,
        width,
        height,
        sha256: hash,
        version: newVersion,
        originalAssetId: originalAssetId,
      },
    });

    return newAsset;
  }

  /**
   * Get all versions of an asset
   */
  async getAssetVersions(assetId: string) {
    const asset = await prisma.chapterAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // If this is a version, get the original
    const originalId = asset.originalAssetId || assetId;

    // Get all versions including the original
    const versions = await prisma.chapterAsset.findMany({
      where: {
        OR: [
          { id: originalId },
          { originalAssetId: originalId },
        ],
      },
      orderBy: { version: "asc" },
      include: {
        coverFor: { select: { id: true } },
        illustrationFor: { select: { id: true } },
        versionIllustrationFor: { select: { id: true } },
      },
    });

    return versions.map((v) => ({
      ...v,
      isChapterCover: v.coverFor.length > 0,
      usedByVolumes: v.illustrationFor.map((vol) => vol.id),
      usedByVersions: v.versionIllustrationFor.map((ver) => ver.id),
    }));
  }

  /**
   * Auto-assign images to volumes based on filename
   * e.g., "jasmine 5.png" will be assigned to volume 5
   */
  async autoAssignImageToVolume(assetId: string, chapterId: string) {
    const asset = await prisma.chapterAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("ASSET_NOT_FOUND");
    }

    // Extract volume number from the original filename
    const volumeNumber = this.extractVolumeNumberFromFilename(
      asset.label || ""
    );

    if (!volumeNumber) {
      return null; // No volume number in filename
    }

    // Find the volume
    const volume = await prisma.volume.findFirst({
      where: {
        chapterId,
        volumeNumber,
      },
    });

    if (!volume) {
      return null; // Volume doesn't exist
    }

    // Check if volume already has an illustration
    if (volume.illustrationAssetId) {
      return null; // Volume already has an illustration
    }

    // Assign the asset to the volume
    const updatedVolume = await prisma.volume.update({
      where: { id: volume.id },
      data: {
        illustrationAssetId: assetId,
      },
    });

    return updatedVolume;
  }
}
