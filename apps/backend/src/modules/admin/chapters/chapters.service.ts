import prisma from "../../../lib/prisma";
import {
  CreateChapterInput,
  UpdateChapterInput,
  BootstrapVolumesInput,
  BulkUpdateChaptersInput,
} from "./chapters.schemas";
import { Perspective } from "@prisma/client";
import { generateVolumeText } from "../../../lib/lorem";
import { encrypt } from "../../../lib/crypto";
import { config } from "@cher-journal/config";

export class ChaptersService {
  // Helper to convert BigInt to Number for JSON serialization
  private serializeVolume(volume: any) {
    return {
      ...volume,
      waitDuration: Number(volume.waitDuration),
    };
  }

  private serializeChapter(chapter: any) {
    if (!chapter) return chapter;

    return {
      ...chapter,
      volumes:
        chapter.volumes?.map((v: any) => {
          // Ensure both perspectives are represented for each volume
          const versionMap: Map<"NARRATOR" | "PROTAGONIST", any> = new Map(
            (v.versions || []).map((ver: any) => [
              ver.perspective as "NARRATOR" | "PROTAGONIST",
              ver as any,
            ])
          );
          const allPerspectives: Array<"NARRATOR" | "PROTAGONIST"> = [
            "NARRATOR",
            "PROTAGONIST",
          ];

          const completeVersions = allPerspectives.map((perspective) => {
            const ver: any = versionMap.get(perspective);
            if (!ver) {
              // Return a placeholder for non-existent perspectives
              return {
                id: `placeholder-${v.id}-${perspective}`,
                volumeId: v.id,
                perspective,
                title: null,
                illustrationAssetId: null,
                illustrationAsset: null,
                hasText: false,
                // SECURITY: Never expose text or textBlobId
              };
            }
            return {
              id: ver.id,
              volumeId: ver.volumeId,
              perspective: ver.perspective,
              title: ver.title,
              illustrationAssetId: ver.illustrationAssetId,
              illustrationAsset: ver.illustrationAsset,
              hasText: !!ver.textBlobId,
              // SECURITY: Explicitly NOT including 'text' or 'textBlobId'
            };
          });

          return {
            ...this.serializeVolume(v),
            versions: completeVersions,
          };
        }) || [],
    };
  }

  async list(includeArchived: boolean = false) {
    const where: any = includeArchived ? undefined : { isArchived: false };
    const chapters = await prisma.chapter.findMany({
      where,
      include: {
        coverAsset: true,
        volumes: {
          include: {
            illustrationAsset: true,
            versions: {
              select: {
                id: true,
                volumeId: true,
                perspective: true,
                textBlobId: true,
                text: true,
                isAutoText: true,
              },
            },
          },
        },
        assets: {
          select: {
            kind: true,
          },
        },
        _count: {
          select: {
            volumes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats for each chapter
    return chapters.map((chapter) => {
      const totalVolumes = chapter.volumes.length;
      const volumesWithText = chapter.volumes.filter((vol) =>
        vol.versions.some(
          (ver) => (ver.textBlobId || ver.text) && !ver.isAutoText
        )
      ).length;
      const volumesWithIllustration = chapter.volumes.filter(
        (vol) => vol.illustrationAssetId
      ).length;
      const volumesWithProtagonist = chapter.volumes.filter((vol) =>
        vol.versions.some((ver) => ver.perspective === "PROTAGONIST")
      ).length;
      const coloringPagesCount = chapter.assets.filter(
        (asset) => asset.kind === "COLORING_PAGE"
      ).length;

      return {
        ...chapter,
        stats: {
          totalVolumes,
          volumesWithText,
          volumesWithIllustration,
          volumesWithProtagonist,
          coloringPagesCount,
        },
        // Serialize BigInt waitDuration and remove versions from response
        volumes: chapter.volumes.map((vol) => ({
          ...vol,
          waitDuration: Number(vol.waitDuration),
          versions: undefined,
        })),
      };
    });
  }

  async getById(id: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        coverAsset: true,
        volumes: {
          include: {
            illustrationAsset: true,
            versions: {
              include: {
                illustrationAsset: true,
              },
            },
          },
          orderBy: { volumeNumber: "asc" },
        },
        assets: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    return this.serializeChapter(chapter);
  }

  async create(data: CreateChapterInput) {
    const createData: any = { ...data };

    // Convert publishedAt string to Date if provided
    if (data.publishedAt !== undefined) {
      createData.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : null;
    }

    // Create chapter with initial data
    const chapter = await prisma.chapter.create({
      data: createData,
      include: {
        coverAsset: true,
      },
    });

    // Automatically create 10 volumes with both perspectives
    // Wrapped in a transaction to ensure all-or-nothing atomicity
    await prisma.$transaction(async (tx) => {
      for (let i = 1; i <= 10; i++) {
        const volume = await tx.volume.create({
          data: {
            chapterId: chapter.id,
            volumeNumber: i,
            title: `Volume ${i}`,
            isFinalPaywall: i > 8, // Last 2 volumes are paywall
          },
        });

        // Generate volume text with "Cher journal" header and Lorem ipsum
        const narratorText = generateVolumeText(5);
        const protagonistText = generateVolumeText(5);

        if ((config as any).encryptionEnabled) {
          // PRODUCTION MODE: Encrypt texts and store in EncryptedBlob
          const narratorEncrypted = encrypt(narratorText);
          const protagonistEncrypted = encrypt(protagonistText);

          // Create encrypted blobs
          const narratorBlob = await tx.encryptedBlob.create({
            data: {
              ownerId: volume.id,
              purpose: "volume_text",
              cipherText: narratorEncrypted.cipherText,
              iv: narratorEncrypted.iv,
              tag: narratorEncrypted.tag,
              wrappedDek: narratorEncrypted.wrappedDek,
              alg: narratorEncrypted.alg,
              version: narratorEncrypted.version,
            },
          });

          const protagonistBlob = await tx.encryptedBlob.create({
            data: {
              ownerId: volume.id,
              purpose: "volume_text",
              cipherText: protagonistEncrypted.cipherText,
              iv: protagonistEncrypted.iv,
              tag: protagonistEncrypted.tag,
              wrappedDek: protagonistEncrypted.wrappedDek,
              alg: protagonistEncrypted.alg,
              version: protagonistEncrypted.version,
            },
          });

          // Create versions with textBlobId references
          await Promise.all([
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.NARRATOR,
                textBlobId: narratorBlob.id,
              },
            }),
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.PROTAGONIST,
                textBlobId: protagonistBlob.id,
              },
            }),
          ]);
        } else {
          // DEVELOPMENT MODE: Store plaintext directly (no encryption)
          await Promise.all([
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.NARRATOR,
                text: narratorText, // Plaintext for dev/demo
              },
            }),
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.PROTAGONIST,
                text: protagonistText, // Plaintext for dev/demo
              },
            }),
          ]);
        }
      }
    });

    return chapter;
  }

  async update(id: string, data: UpdateChapterInput) {
    const updateData: any = { ...data };

    // Convert publishedAt string to Date if provided
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : null;
    }

    return prisma.chapter.update({
      where: { id },
      data: updateData,
      include: {
        coverAsset: true,
      },
    });
  }

  async delete(id: string): Promise<{ isArchived: boolean }> {
    // First check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    // Check for payment history (Entitlements)
    const hasPaymentHistory = await prisma.entitlement.findFirst({
      where: { chapterId: id },
    });

    // If payment history exists, archive instead of delete
    if (hasPaymentHistory) {
      const updateData: any = { isArchived: true };
      await prisma.chapter.update({
        where: { id },
        data: updateData,
      });
      return { isArchived: true };
    }

    // No payment history - safe to delete permanently
    await prisma.$transaction(async (tx) => {
      // Get all volumes for this chapter
      const volumes = await tx.volume.findMany({
        where: { chapterId: id },
        select: { id: true },
      });

      if (volumes.length > 0) {
        const volumeIds = volumes.map((v) => v.id);

        // Gather all version IDs for these volumes
        const versionIds = await tx.volumeVersion.findMany({
          where: { volumeId: { in: volumeIds } },
          select: { id: true },
        });

        // Delete EncryptedBlobs whose ownerId matches version IDs (purpose: volume_text)
        if (versionIds.length > 0) {
          await tx.encryptedBlob.deleteMany({
            where: {
              ownerId: { in: versionIds.map((v) => v.id) },
              purpose: "volume_text",
            },
          });
        }

        // Delete all VolumeVersions
        await tx.volumeVersion.deleteMany({
          where: {
            volumeId: { in: volumeIds },
          },
        });

        // Delete all Unlocks (by chapterId)
        await tx.unlock.deleteMany({
          where: { chapterId: id },
        });

        // Delete all VolumeReads (by chapterId)
        await tx.volumeRead.deleteMany({
          where: { chapterId: id },
        });

        // Delete all Volumes
        await tx.volume.deleteMany({
          where: { chapterId: id },
        });
      }

      // Delete all Entitlements (should be empty, but clean up)
      await tx.entitlement.deleteMany({
        where: { chapterId: id },
      });

      // Delete all ChapterAssets
      await tx.chapterAsset.deleteMany({
        where: { chapterId: id },
      });

      // Finally, delete the chapter itself
      await tx.chapter.delete({
        where: { id },
      });
    });
    return { isArchived: false };
  }

  async bootstrapVolumes(chapterId: string, data: BootstrapVolumesInput) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    const totalVolumes = data.count + (data.extraVolumes || 0);
    const volumes: any[] = [];

    // Wrapped in transaction for atomicity
    await prisma.$transaction(async (tx) => {
      for (let i = 1; i <= totalVolumes; i++) {
        const isExtra = i > data.count;
        const volume = await tx.volume.create({
          data: {
            chapterId,
            volumeNumber: i,
            title: `Volume ${i}${isExtra ? " (Extra)" : ""}`,
            isFinalPaywall: i > data.count - 2 && !isExtra, // Last 2 volumes are paywall
          },
        });

        // Generate volume text with "Cher journal" header and Lorem ipsum
        const narratorText = generateVolumeText(5);
        const protagonistText = generateVolumeText(5);

        if ((config as any).encryptionEnabled) {
          // PRODUCTION MODE: Encrypt texts and store in EncryptedBlob
          const narratorEncrypted = encrypt(narratorText);
          const protagonistEncrypted = encrypt(protagonistText);

          // Create encrypted blobs
          const narratorBlob = await tx.encryptedBlob.create({
            data: {
              ownerId: volume.id,
              purpose: "volume_text",
              cipherText: narratorEncrypted.cipherText,
              iv: narratorEncrypted.iv,
              tag: narratorEncrypted.tag,
              wrappedDek: narratorEncrypted.wrappedDek,
              alg: narratorEncrypted.alg,
              version: narratorEncrypted.version,
            },
          });

          const protagonistBlob = await tx.encryptedBlob.create({
            data: {
              ownerId: volume.id,
              purpose: "volume_text",
              cipherText: protagonistEncrypted.cipherText,
              iv: protagonistEncrypted.iv,
              tag: protagonistEncrypted.tag,
              wrappedDek: protagonistEncrypted.wrappedDek,
              alg: protagonistEncrypted.alg,
              version: protagonistEncrypted.version,
            },
          });

          // Create both narrator and protagonist versions with encrypted blobs
          await Promise.all([
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.NARRATOR,
                textBlobId: narratorBlob.id,
              },
            }),
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.PROTAGONIST,
                textBlobId: protagonistBlob.id,
              },
            }),
          ]);
        } else {
          // DEVELOPMENT MODE: Store plaintext directly (no encryption)
          await Promise.all([
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.NARRATOR,
                text: narratorText,
              },
            }),
            tx.volumeVersion.create({
              data: {
                volumeId: volume.id,
                perspective: Perspective.PROTAGONIST,
                text: protagonistText,
              },
            }),
          ]);
        }

        volumes.push(volume);
      }
    });

    return volumes;
  }

  async bulkUpdate(data: BulkUpdateChaptersInput) {
    const { chapterIds, updates } = data;

    // Build update data
    const updateData: any = {};

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.priceFreeToRead !== undefined) {
      updateData.priceFreeToRead = updates.priceFreeToRead;
    }

    if (updates.pricePaywall !== undefined) {
      updateData.pricePaywall = updates.pricePaywall;
    }

    if (updates.priceEpilogue !== undefined) {
      updateData.priceEpilogue = updates.priceEpilogue;
    }

    if (updates.publishedAt !== undefined) {
      updateData.publishedAt = updates.publishedAt
        ? new Date(updates.publishedAt)
        : null;
    }

    // Update all chapters
    await prisma.chapter.updateMany({
      where: {
        id: { in: chapterIds },
      },
      data: updateData,
    });

    // Return updated chapters
    const chapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      include: {
        coverAsset: true,
        _count: {
          select: {
            volumes: true,
            assets: true,
          },
        },
      },
    });

    return chapters;
  }

  async duplicate(chapterId: string) {
    // Get the original chapter with all its relations
    const originalChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        volumes: {
          include: {
            versions: {
              include: {
                textBlob: true,
                illustrationAsset: true,
              },
            },
          },
        },
        assets: true,
      },
    });

    if (!originalChapter) {
      throw new Error("CHAPTER_NOT_FOUND");
    }

    // Smart title duplication with number increment
    let baseTitle = originalChapter.title;
    let currentNumber = 2; // Default starting number

    // Check if the title already ends with " - [number]"
    const numberMatch = originalChapter.title.match(/^(.+?)\s*-\s*(\d+)$/);
    if (numberMatch) {
      baseTitle = numberMatch[1].trim();
      currentNumber = parseInt(numberMatch[2], 10) + 1;
    }

    // Find all chapters with similar titles to get the highest number
    const similarChapters = await prisma.chapter.findMany({
      where: {
        title: {
          startsWith: baseTitle,
        },
      },
      select: {
        title: true,
      },
    });

    // Extract all numbers from similar titles and find the max
    const existingNumbers = similarChapters
      .map((ch) => {
        const match = ch.title.match(/^.+?\s*-\s*(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => num > 0);

    if (existingNumbers.length > 0) {
      const maxNumber = Math.max(...existingNumbers);
      currentNumber = Math.max(currentNumber, maxNumber + 1);
    }

    const newTitle = `${baseTitle} - ${currentNumber}`;

    // Create the duplicated chapter
    const duplicatedChapter = await prisma.chapter.create({
      data: {
        title: newTitle,
        protagonistName: originalChapter.protagonistName,
        status: "DRAFT", // Always create as draft
        coverAssetId: originalChapter.coverAssetId,
        isArchived: false,
        publishedAt: null, // Don't copy publish date
      },
      include: {
        coverAsset: true,
        _count: {
          select: {
            volumes: true,
            assets: true,
          },
        },
      },
    });

    // Duplicate volumes and their versions (without text content for safety)
    for (const originalVolume of originalChapter.volumes) {
      const duplicatedVolume = await prisma.volume.create({
        data: {
          chapterId: duplicatedChapter.id,
          volumeNumber: originalVolume.volumeNumber,
          title: originalVolume.title,
          isFree: originalVolume.isFree,
          waitDuration: originalVolume.waitDuration,
          isFinalPaywall: originalVolume.isFinalPaywall,
          illustrationAssetId: originalVolume.illustrationAssetId,
          publishedAt: originalVolume.publishedAt,
        },
      });

      // Duplicate versions (narrator and protagonist)
      for (const originalVersion of originalVolume.versions) {
        await prisma.volumeVersion.create({
          data: {
            volumeId: duplicatedVolume.id,
            perspective: originalVersion.perspective,
            illustrationAssetId: originalVersion.illustrationAssetId,
            // Note: We don't duplicate textBlob for security/data reasons
            // Admin will need to add text manually or via bootstrap
          },
        });
      }
    }

    return duplicatedChapter;
  }
}
