import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductionData {
  chapters: any[];
  volumes: any[];
  volumeVersions: any[];
  chapterGenreTags: any[];
  chapterAssets: any[];
  versionAssets: any[];
}

/**
 * Production seed: Imports real production data from JSON backup
 * This seed is kept separate from generated/test data to avoid mixing concerns
 *
 * Data flow:
 * 1. Script modifies production data (chapters, volumes, etc.)
 * 2. backup-database.ts exports to production-data.json
 * 3. This seed imports from production-data.json
 * 4. Syncs production data to all environments before deployment
 */
export async function seedProductionData() {
  console.log("🎬 Seeding production data...");

  try {
    const backupPath = path.join(__dirname, "./data/production-data.json");

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      console.log(
        "ℹ️  No production data backup found. Skipping production seed."
      );
      console.log(
        "💡 Run: npm run backup:db to create a backup from current database"
      );
      return;
    }

    const data: ProductionData = JSON.parse(
      fs.readFileSync(backupPath, "utf-8")
    );

    // Skip if no chapters (empty backup)
    if (!data.chapters || data.chapters.length === 0) {
      console.log(
        "ℹ️  Production data backup is empty. Skipping production seed."
      );
      console.log(
        "💡 Run: npm run backup:db to create a backup from current database"
      );
      return;
    }

    // CRITICAL ORDER: Chapters FIRST (without coverAssetId to avoid circular FK),
    // then assets, then update chapters with coverAssetId
    console.log(`📝 Restoring ${data.chapters.length} chapters...`);
    const chaptersWithCover: { id: string; coverAssetId: string }[] = [];
    for (const chapter of data.chapters) {
      const existing = await prisma.chapter.findUnique({
        where: { id: chapter.id },
      });

      if (!existing) {
        const { coverAssetId, ...chapterData } = chapter;
        if (coverAssetId) {
          chaptersWithCover.push({ id: chapter.id, coverAssetId });
        }
        await prisma.chapter.create({
          data: chapterData,
        });
      }
    }

    // Now restore chapter assets (they reference chapters via chapterId FK)
    // Build set of valid chapter IDs to skip orphaned assets
    const existingChapterIds = new Set(
      (await prisma.chapter.findMany({ select: { id: true } })).map(c => c.id)
    );

    const validAssets = data.chapterAssets.filter(a => existingChapterIds.has(a.chapterId));
    const skippedAssets = data.chapterAssets.length - validAssets.length;
    if (skippedAssets > 0) {
      console.log(`⚠️  Skipping ${skippedAssets} assets with missing chapters`);
    }
    console.log(`🖼️  Restoring ${validAssets.length} chapter assets...`);

    // Step 1: Restore base assets (originalAssetId = null)
    const baseAssets = validAssets.filter(a => !a.originalAssetId);
    for (const asset of baseAssets) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.chapterAsset.create({
          data: asset,
        });
      }
    }

    // Step 2: Restore asset versions (originalAssetId != null)
    const assetVersions = validAssets.filter(a => a.originalAssetId);
    for (const asset of assetVersions) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.chapterAsset.create({
          data: asset,
        });
      }
    }

    // Restore version assets (for POV/coloring pages)
    console.log(`🎨 Restoring version assets...`);
    for (const asset of data.versionAssets) {
      const existing = await prisma.versionAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.versionAsset.create({
          data: asset,
        });
      }
    }

    // Update chapters with coverAssetId now that assets exist
    if (chaptersWithCover.length > 0) {
      console.log(`🔗 Linking ${chaptersWithCover.length} chapter cover(s)...`);
      for (const { id, coverAssetId } of chaptersWithCover) {
        await prisma.chapter.update({
          where: { id },
          data: { coverAssetId },
        });
      }
    }

    // Restore chapters genre tags
    console.log(
      `🏷️  Restoring ${data.chapterGenreTags.length} genre tags...`
    );
    for (const tag of data.chapterGenreTags) {
      const existing = await prisma.chapterGenreTag.findFirst({
        where: {
          chapterId: tag.chapterId,
          genre: tag.genre,
        },
      });

      if (!existing) {
        await prisma.chapterGenreTag.create({
          data: tag,
        });
      }
    }

    // NOW restore volumes with asset references
    console.log(`📚 Restoring ${data.volumes.length} volumes...`);
    for (const volume of data.volumes) {
      const { versions, chapter, ...volumeData } = volume;

      const existing = await prisma.volume.findUnique({
        where: { id: volume.id },
      });

      if (!existing) {
        await prisma.volume.create({
          data: volumeData,
        });
      }
    }

    // Restore volume versions
    console.log(
      `🔄 Restoring ${data.volumeVersions.length} volume versions...`
    );
    for (const version of data.volumeVersions) {
      const existing = await prisma.volumeVersion.findUnique({
        where: { id: version.id },
      });

      if (!existing) {
        await prisma.volumeVersion.create({
          data: version,
        });
      }
    }

    console.log(`✅ Production data restored successfully!`);
  } catch (error) {
    console.error("❌ Error seeding production data:", error);
    throw error;
  }
}
