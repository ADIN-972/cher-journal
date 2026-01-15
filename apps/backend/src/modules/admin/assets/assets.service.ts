import prisma from "../../../lib/prisma";
import { AssetKind } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { config } from "@cher-journal/config";
import sharp from "sharp";
import crypto from "crypto";

export class AssetsService {
  async list(chapterId: string) {
    const assets = await prisma.chapterAsset.findMany({
      where: { chapterId },
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
      },
    });

    return assets.map((asset) => ({
      ...asset,
      isChapterCover: asset.coverFor.length > 0,
      usedByVolumes: asset.illustrationFor.map((v) => v.id),
      usedByVersions: asset.versionIllustrationFor.map((v) => v.id),
    }));
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
