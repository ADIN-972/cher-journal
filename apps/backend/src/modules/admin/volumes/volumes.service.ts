import prisma from "../../../lib/prisma";
import {
  CreateVolumeInput,
  UpdateVolumeInput,
  UpdateVolumeVersionInput,
  BulkUpdateVolumesInput,
  BulkImportVolumeInput,
} from "./volumes.schemas";
import { Perspective } from "@prisma/client";
import { config } from "@cher-journal/config";
import { encrypt, decryptBlob } from "../../../lib/crypto";
import { ConfigService } from "../config/config.service";

export class VolumesService {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }
  // Helper to convert BigInt to Number for JSON serialization
  private serializeVolume(volume: any) {
    const serialized: any = {
      ...volume,
      waitDuration: Number(volume.waitDuration),
      status: volume.status, // Ensure status is included
    };

    // Add hasText flag to each version if versions are included
    if (volume.versions && Array.isArray(volume.versions)) {
      serialized.versions = volume.versions.map((version: any) => {
        const hasText = config.encryptionEnabled
          ? version.textBlobId !== null
          : version.text !== null;

        return {
          ...version,
          hasText,
          // characterCount is already in the database
          // Remove sensitive fields
          text: undefined,
          textBlobId: undefined,
        };
      });
    }

    return serialized;
  }

  private serializeVolumes(volumes: any[]) {
    return volumes.map((v) => this.serializeVolume(v));
  }

  async listByChapter(chapterId: string) {
    const volumes = await prisma.volume.findMany({
      where: { chapterId },
      include: {
        illustrationAsset: true,
        versions: {
          include: {
            illustrationAsset: true,
          },
        },
      },
      orderBy: { volumeNumber: "asc" },
    });

    return this.serializeVolumes(volumes);
  }

  async create(chapterId: string, data: CreateVolumeInput) {
    // Get the next volume number
    const lastVolume = await prisma.volume.findFirst({
      where: { chapterId },
      orderBy: { volumeNumber: "desc" },
    });

    const volumeNumber = (lastVolume?.volumeNumber || 0) + 1;

    // Create volume with both versions
    const volume = await prisma.volume.create({
      data: {
        chapterId,
        volumeNumber,
        title: data.title,
        waitDuration: data.waitDuration,
        isFinalPaywall: data.isFinalPaywall || false,
        isFree: data.isFree || false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        versions: {
          create: [
            {
              perspective: Perspective.NARRATOR,
            },
            {
              perspective: Perspective.PROTAGONIST,
            },
          ],
        },
      },
      include: {
        versions: true,
        illustrationAsset: true,
      },
    });

    return this.serializeVolume(volume);
  }

  async getById(id: string) {
    const volume = await prisma.volume.findUnique({
      where: { id },
      include: {
        chapter: true,
        illustrationAsset: true,
        versions: {
          include: {
            illustrationAsset: true,
          },
        },
      },
    });

    if (!volume) {
      throw new Error("VOLUME_NOT_FOUND");
    }

    return this.serializeVolume(volume);
  }

  async update(id: string, data: UpdateVolumeInput) {
    const updateData: any = { ...data };

    // Convert publishedAt string to Date if provided
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : null;
    }

    const volume = await prisma.volume.update({
      where: { id },
      data: updateData,
    });

    return this.serializeVolume(volume);
  }

  async delete(id: string) {
    const volume = await prisma.volume.findUnique({
      where: { id },
    });

    if (!volume) {
      throw new Error("VOLUME_NOT_FOUND");
    }

    // Delete volume (cascade will delete versions)
    // Text is now stored directly in volume_versions table
    await prisma.volume.delete({
      where: { id },
    });
  }

  async createVersion(
    volumeId: string,
    data: {
      perspective: "NARRATOR" | "PROTAGONIST";
      title?: string;
      text?: string;
    }
  ) {
    // Check if volume exists
    const volume = await prisma.volume.findUnique({
      where: { id: volumeId },
    });

    if (!volume) {
      throw new Error("VOLUME_NOT_FOUND");
    }

    // SECURITY: Reject plaintext input ONLY if encryption is enabled
    if (config.encryptionEnabled && data.text) {
      throw new Error("PLAINTEXT_NOT_ALLOWED_IN_PRODUCTION");
    }

    // Check if version already exists
    const existingVersion = await prisma.volumeVersion.findFirst({
      where: {
        volumeId,
        perspective: data.perspective,
      },
    });

    if (existingVersion) {
      throw new Error("VERSION_ALREADY_EXISTS");
    }

    // Create the version
    return prisma.volumeVersion.create({
      data: {
        volumeId,
        perspective: data.perspective,
        text: config.encryptionEnabled ? null : data.text || null, // Allow plaintext only if encryption disabled
        // NOTE: In production (encryption enabled), use /api/volumes/{id}/versions/{versionId}/text endpoint to set encrypted text
      },
    });
  }

  async getVersions(volumeId: string) {
    const versions = await prisma.volumeVersion.findMany({
      where: { volumeId },
      include: {
        illustrationAsset: true,
      },
      orderBy: { perspective: "asc" },
    });

    // Ensure both perspectives exist in database
    const versionMap = new Map(versions.map((v) => [v.perspective, v]));
    const allPerspectives: Array<"NARRATOR" | "PROTAGONIST"> = [
      "NARRATOR",
      "PROTAGONIST",
    ];

    // Create missing versions automatically
    const completeVersions = await Promise.all(
      allPerspectives.map(async (perspective) => {
        let version = versionMap.get(perspective);

        if (!version) {
          // Create the missing version in database
          version = await prisma.volumeVersion.create({
            data: {
              volumeId,
              perspective,
            },
            include: {
              illustrationAsset: true,
            },
          });
        }

        // Determine if version has text
        const hasText = config.encryptionEnabled
          ? version.textBlobId !== null
          : version.text !== null;

        // SECURITY: Exclude text and textBlobId from response
        return {
          id: version.id,
          volumeId: version.volumeId,
          perspective: version.perspective,
          illustrationAssetId: version.illustrationAssetId,
          illustrationAsset: version.illustrationAsset,
          hasText,
          characterCount: version.characterCount,
          createdAt: version.createdAt,
          // NOT including: text, textBlobId
        };
      })
    );

    return completeVersions;
  }

  async updateVersion(versionId: string, data: UpdateVolumeVersionInput) {
    // SECURITY: Reject plaintext input ONLY if encryption is enabled
    if (
      config.encryptionEnabled &&
      data.text !== undefined &&
      data.text !== null
    ) {
      throw new Error("PLAINTEXT_NOT_ALLOWED_IN_PRODUCTION");
    }

    const updateData: any = {};

    if (data.illustrationAssetId !== undefined) {
      updateData.illustrationAssetId = data.illustrationAssetId;
    }

    // Allow text updates only if encryption is disabled (dev mode)
    if (!config.encryptionEnabled && data.text !== undefined) {
      updateData.text = data.text;
      updateData.characterCount = data.text ? data.text.length : 0;
    }

    // NOTE: In production (encryption enabled), use dedicated /text endpoint for updates

    return prisma.volumeVersion.update({
      where: { id: versionId },
      data: updateData,
      include: {
        illustrationAsset: true,
      },
    });
  }

  async deleteVersion(versionId: string) {
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // Delete the version (text is stored directly, no blob to clean up)
    await prisma.volumeVersion.delete({
      where: { id: versionId },
    });
  }

  async bulkUpdate(data: BulkUpdateVolumesInput) {
    const { volumeIds, updates } = data;

    // Build update data
    const updateData: any = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }

    if (updates.waitDuration !== undefined) {
      updateData.waitDuration = updates.waitDuration;
    }

    if (updates.isFinalPaywall !== undefined) {
      updateData.isFinalPaywall = updates.isFinalPaywall;
    }

    if (updates.isFree !== undefined) {
      updateData.isFree = updates.isFree;
    }

    if (updates.publishedAt !== undefined) {
      updateData.publishedAt = updates.publishedAt
        ? new Date(updates.publishedAt)
        : null;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    // Update all volumes
    await prisma.volume.updateMany({
      where: {
        id: { in: volumeIds },
      },
      data: updateData,
    });

    // Return updated volumes
    const volumes = await prisma.volume.findMany({
      where: { id: { in: volumeIds } },
      include: {
        illustrationAsset: true,
        versions: {
          include: {
            illustrationAsset: true,
          },
        },
      },
    });

    return this.serializeVolumes(volumes);
  }

  async getVersionText(versionId: string): Promise<string> {
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: {
        textBlob: true,
      },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // If encryption is disabled, return plaintext (including empty strings)
    if (!config.encryptionEnabled && version.text !== null) {
      return version.text;
    }

    // If encryption is enabled, decrypt from blob
    if (config.encryptionEnabled && version.textBlob) {
      return decryptBlob(version.textBlob);
    }

    // No text available - return empty string instead of error
    return "";
  }

  async updateVersionText(versionId: string, data: { text: string }) {
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: {
        textBlob: true,
      },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    const updateData: any = {};

    // Calculate character count
    const characterCount = data.text ? data.text.length : 0;
    updateData.characterCount = characterCount;

    // Handle text update based on encryption mode
    if (config.encryptionEnabled) {
      // Encrypt and store in blob
      const encrypted = encrypt(data.text);

      // Delete old blob if exists
      if (version.textBlobId) {
        await prisma.encryptedBlob.delete({
          where: { id: version.textBlobId },
        });
      }

      // Create new blob
      const newBlob = await prisma.encryptedBlob.create({
        data: {
          ownerId: versionId,
          purpose: "volume_text",
          cipherText: encrypted.cipherText,
          iv: encrypted.iv,
          tag: encrypted.tag,
          wrappedDek: encrypted.wrappedDek,
          alg: encrypted.alg,
          version: encrypted.version,
        },
      });

      updateData.textBlobId = newBlob.id;
    } else {
      // Store plaintext directly (dev mode only)
      updateData.text = data.text;
    }

    // Mark as non-auto text when manually updated
    updateData.isAutoText = false;

    return prisma.volumeVersion.update({
      where: { id: versionId },
      data: updateData,
      include: {
        illustrationAsset: true,
      },
    });
  }

  async bulkImportVolume(
    chapterId: string,
    data: BulkImportVolumeInput
  ): Promise<{ success: boolean; volume?: any; error?: string }> {
    try {
      // Get default wait duration from config
      const waitConfig = await this.configService.getWaitConfig();
      const defaultWaitDurationMs = waitConfig.defaultDurationHours * 60 * 60 * 1000;

      // Find or create volume
      let volume = await prisma.volume.findFirst({
        where: {
          chapterId,
          volumeNumber: data.volumeNumber,
        },
        include: {
          versions: true,
        },
      });

      if (!volume) {
        // Create new volume with both versions
        volume = await prisma.volume.create({
          data: {
            chapterId,
            volumeNumber: data.volumeNumber,
            title: data.title,
            waitDuration: defaultWaitDurationMs,
            isFinalPaywall: false,
            isFree: data.isFree || false,
            versions: {
              create: [
                { perspective: Perspective.NARRATOR },
                { perspective: Perspective.PROTAGONIST },
              ],
            },
          },
          include: {
            versions: true,
          },
        });
      } else {
        // Update existing volume title and isFree status
        await prisma.volume.update({
          where: { id: volume.id },
          data: {
            title: data.title,
            isFree: data.isFree || false,
          },
        });
      }

      // Ensure both versions exist (create if missing)
      let narratorVersion = volume.versions.find(
        (v) => v.perspective === Perspective.NARRATOR
      );
      if (!narratorVersion) {
        narratorVersion = await prisma.volumeVersion.create({
          data: {
            volumeId: volume.id,
            perspective: Perspective.NARRATOR,
          },
        });
      }

      let protagonistVersion = volume.versions.find(
        (v) => v.perspective === Perspective.PROTAGONIST
      );
      if (!protagonistVersion) {
        protagonistVersion = await prisma.volumeVersion.create({
          data: {
            volumeId: volume.id,
            perspective: Perspective.PROTAGONIST,
          },
        });
      }

      // Update narrator version text
      await this.updateVersionText(narratorVersion.id, {
        text: data.narratorText,
      });

      // Update protagonist version text if provided (including empty strings)
      if (data.protagonistText !== undefined) {
        await this.updateVersionText(protagonistVersion.id, {
          text: data.protagonistText,
        });
      }

      return {
        success: true,
        volume: this.serializeVolume(volume),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }
}

