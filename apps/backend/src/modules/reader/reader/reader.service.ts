import prisma from "../../../lib/prisma";
import { decryptBlob } from "../../../lib/crypto";
import { AccessControlService } from "../../../lib/accessControl";
// TODO: Install canvas dependencies for Windows
// import { createCanvas, registerFont } from 'canvas';
import { Perspective } from "@prisma/client";

export class ReaderService {
  private accessControl = new AccessControlService();
  /**
   * Check if user can access a specific volume.
   * Delegated to centralized AccessControlService.
   */
  async canAccessVolume(
    userId: string,
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): Promise<boolean> {
    const result = await this.accessControl.canAccessVolume(
      userId,
      chapterId,
      volumeNumber,
      perspective
    );
    return result.hasAccess;
  }

  async renderVolumeText(
    versionId: string,
    options: {
      fontSize?: number;
      fontFamily?: string;
      width?: number;
      lineHeight?: number;
    } = {}
  ): Promise<Buffer> {
    // Fetch version with textBlob relation
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: {
        textBlob: true,
      },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // Get plaintext from encrypted blob
    let plaintext: string;

    if (version.textBlob) {
      // Decrypt the blob
      plaintext = decryptBlob({
        cipherText: version.textBlob.cipherText,
        iv: version.textBlob.iv,
        tag: version.textBlob.tag,
        wrappedDek: version.textBlob.wrappedDek,
        alg: version.textBlob.alg,
        version: version.textBlob.version,
      });
    } else if (version.text) {
      // Fallback for legacy plain text (if exists)
      plaintext = version.text;
    } else {
      throw new Error("NO_TEXT");
    }

    // Render options with defaults
    const fontSize = options.fontSize || 18;
    const fontFamily = options.fontFamily || "Arial";
    const width = options.width || 800;
    const padding = 40;

    // Word wrap text (simplified without canvas measurement)
    const words = plaintext.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    // Approximate character width for text wrapping
    const avgCharWidth = fontSize * 0.6;
    const maxCharsPerLine = Math.floor((width - padding * 2) / avgCharWidth);

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;

      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // TODO: Implement canvas rendering when canvas is installed
    throw new Error(
      "Canvas rendering not available on Windows yet. Please install GTK dependencies or use Docker."
    );

    /* 
    // Calculate canvas height
    const height = Math.max(600, padding * 2 + lines.length * lineHeight);

    // Create final canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';

    let y = padding;
    for (const line of lines) {
      ctx.fillText(line, padding, y);
      y += lineHeight;
    }

    // Return as PNG buffer
    return canvas.toBuffer('image/png');
    */
  }

  async getVolumeVersion(
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ) {
    const volume = await prisma.volume.findFirst({
      where: {
        chapterId,
        volumeNumber,
        // Volume must be published
        status: 'PUBLISHED',
        // AND either no scheduled date OR scheduled date has passed
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lte: new Date() } }
        ]
      },
      include: {
        versions: {
          where: { perspective },
          include: {
            assets: {
              include: { chapterAsset: true },
              orderBy: { assetOrder: "asc" },
            },
            textBlob: true,
          },
        },
      },
    });

    if (!volume || volume.versions.length === 0) {
      throw new Error("VOLUME_NOT_AVAILABLE");
    }

    return volume.versions[0];
  }

  async getVolumeVersionById(versionId: string) {
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: {
        volume: true,
        textBlob: true,
        assets: {
          include: { chapterAsset: true },
          orderBy: { assetOrder: "asc" },
        },
      },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    return version;
  }

  /**
   * Get volume text by volumeId (automatically finds the right version based on perspective)
   */
  async getVolumeTextByVolumeId(
    volumeId: string,
    userId: string,
    perspective: Perspective = Perspective.NARRATOR
  ): Promise<{
    id: string;
    volumeId: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    volumeNumber: number;
    perspective: Perspective;
    content: string;
    illustrationUrl: string | null;
  }> {
    // Find the volume with its versions
    const volume = await prisma.volume.findUnique({
      where: { id: volumeId },
      include: {
        chapter: true,
        versions: {
          where: { perspective },
          include: { textBlob: true },
        },
      },
    });

    if (!volume) {
      throw new Error("VOLUME_NOT_FOUND");
    }

    if (volume.versions.length === 0) {
      throw new Error("VERSION_NOT_FOUND");
    }

    const version = volume.versions[0];

    // Use the existing getVolumeText method with the versionId
    return this.getVolumeText(version.id, userId);
  }

  /**
   * Get decrypted text content for a volume version
   */
  async getVolumeText(
    versionId: string,
    userId: string
  ): Promise<{
    id: string;
    volumeId: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    volumeNumber: number;
    perspective: Perspective;
    content: string;
    illustrationUrl: string | null;
  }> {
    // Fetch version with full details
    const version = await prisma.volumeVersion.findUnique({
      where: { id: versionId },
      include: {
        volume: {
          include: {
            chapter: true,
            illustrationAsset: true,
          },
        },
        textBlob: true,
        illustrationAsset: true,
      },
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    // Check access
    const hasAccess = await this.canAccessVolume(
      userId,
      version.volume.chapterId,
      version.volume.volumeNumber,
      version.perspective
    );

    if (!hasAccess) {
      throw new Error("NO_ACCESS");
    }

    // Track that user is reading this volume (create VolumeRead if first time)
    // Use try-catch to handle race condition where another request creates the record concurrently
    try {
      await prisma.volumeRead.create({
        data: {
          userId,
          chapterId: version.volume.chapterId,
          volumeNumber: version.volume.volumeNumber,
          firstOpenedAt: new Date(),
        },
      });
    } catch (error: any) {
      // If unique constraint violation (record already exists), that's fine - ignore it
      if (error.code !== 'P2002') {
        throw error;
      }
    }

    // Get plaintext from encrypted blob
    let plaintext: string;

    if (version.textBlob) {
      // Decrypt the blob
      plaintext = decryptBlob({
        cipherText: version.textBlob.cipherText,
        iv: version.textBlob.iv,
        tag: version.textBlob.tag,
        wrappedDek: version.textBlob.wrappedDek,
        alg: version.textBlob.alg,
        version: version.textBlob.version,
      });
    } else if (version.text) {
      // Fallback for legacy plain text (if exists)
      plaintext = version.text;
    } else {
      throw new Error("NO_TEXT");
    }

    // Get illustration URL (prioritize version illustration, fallback to volume illustration)
    const illustrationAsset = version.illustrationAsset || version.volume.illustrationAsset;
    const illustrationUrl = illustrationAsset
      ? `/uploads/${illustrationAsset.objectKey}`
      : null;

    return {
      id: version.id,
      volumeId: version.volumeId,
      title: version.volume.title,
      chapterId: version.volume.chapterId,
      chapterTitle: version.volume.chapter.title,
      volumeNumber: version.volume.volumeNumber,
      perspective: version.perspective,
      content: plaintext,
      illustrationUrl,
    };
  }

  /**
   * Tracks when a user reads a volume
   * NOTE: This no longer automatically creates unlocks for the next volume.
   * Users must manually trigger the wait-to-read timer for each volume.
   */
  async trackVolumeRead(
    userId: string,
    chapterId: string,
    volumeNumber: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Check if this is the first time reading this volume
    const existingRead = await prisma.volumeRead.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId,
          volumeNumber,
        },
      },
    });

    // Create VolumeRead record if first time
    if (!existingRead) {
      await prisma.volumeRead.create({
        data: {
          userId,
          chapterId,
          volumeNumber,
        },
      });
    }

    // No automatic unlock creation - user must manually trigger wait for next volume
    return { success: true };
  }

  /**
   * Mark that user reached 65% scroll on a volume (enables canStartWait for next volume)
   * This is a security-critical method - validates timing to prevent hacks
   */
  async markCanStartWait(
    userId: string,
    chapterId: string,
    volumeNumber: number
  ): Promise<void> {
    // Sécurité : Vérifier que l'utilisateur a bien lu le volume
    const volumeRead = await prisma.volumeRead.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId,
          volumeNumber
        }
      }
    });

    if (!volumeRead) {
      throw new Error('VOLUME_NOT_READ');
    }

    // Sécurité : Vérifier timing (au moins 2 minutes de lecture)
    const timeSinceOpen = Date.now() - volumeRead.firstOpenedAt.getTime();
    const MIN_READ_TIME = 2 * 60 * 1000; // 2 minutes

    if (timeSinceOpen < MIN_READ_TIME) {
      throw new Error('READ_TOO_FAST');
    }

    // Sécurité : Volumes 1-7 uniquement (pour débloquer 2-8)
    if (volumeNumber < 1 || volumeNumber > 7) {
      throw new Error('INVALID_VOLUME_FOR_WAIT');
    }

    // Marquer canStartWaitFrom sur le volume SUIVANT
    const nextVolumeNumber = volumeNumber + 1;

    await prisma.volumeRead.upsert({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId,
          volumeNumber: nextVolumeNumber
        }
      },
      create: {
        userId,
        chapterId,
        volumeNumber: nextVolumeNumber,
        canStartWaitFrom: new Date()
      },
      update: {
        canStartWaitFrom: new Date()
      }
    });
  }

  /**
   * Update reading progress for a volume (0-100%)
   * Only updates if new progress is higher than current progress
   */
  async updateProgress(
    userId: string,
    chapterId: string,
    volumeNumber: number,
    progress: number
  ): Promise<{ success: boolean; progress: number }> {
    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      throw new Error('INVALID_PROGRESS');
    }

    // Get current volume read
    const volumeRead = await prisma.volumeRead.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId,
          volumeNumber
        }
      }
    });

    if (!volumeRead) {
      // Create new volume read with progress
      const newRead = await prisma.volumeRead.create({
        data: {
          userId,
          chapterId,
          volumeNumber,
          progress
        }
      });
      return { success: true, progress: newRead.progress };
    }

    // Only update if new progress is higher
    if (progress > volumeRead.progress) {
      const updated = await prisma.volumeRead.update({
        where: {
          userId_chapterId_volumeNumber: {
            userId,
            chapterId,
            volumeNumber
          }
        },
        data: {
          progress
        }
      });
      return { success: true, progress: updated.progress };
    }

    // Return current progress if new progress is not higher
    return { success: true, progress: volumeRead.progress };
  }
}
