import prisma from "../../../lib/prisma";
import { decryptBlob } from "../../../lib/crypto";
// TODO: Install canvas dependencies for Windows
// import { createCanvas, registerFont } from 'canvas';
import { Perspective } from "@prisma/client";

export class ReaderService {
  async canAccessVolume(
    userId: string,
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective
  ): Promise<boolean> {
    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
        volumeFrom: { lte: volumeNumber },
        volumeTo: { gte: volumeNumber },
      },
    });

    if (!entitlement) {
      return false;
    }

    // Check perspective access
    if (
      perspective === Perspective.PROTAGONIST &&
      entitlement.versionScope !== "ALL"
    ) {
      return false;
    }

    // Check if locked by wait
    const unlock = await prisma.unlock.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId,
          volumeNumber,
        },
      },
    });

    if (unlock && unlock.unlocksAt > new Date()) {
      return false; // Still locked
    }

    return true;
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
      throw new Error("VERSION_NOT_FOUND");
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
}
