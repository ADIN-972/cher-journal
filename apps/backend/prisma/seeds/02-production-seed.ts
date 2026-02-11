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

    // Restore chapters (without asset references for now due to complex dependencies)
    console.log(`📝 Restoring ${data.chapters.length} chapters...`);
    for (const chapter of data.chapters) {
      const existing = await prisma.chapter.findUnique({
        where: { id: chapter.id },
      });

      if (!existing) {
        // Remove asset references to avoid foreign key issues
        const { coverAssetId, ...chapterData } = chapter;

        await prisma.chapter.create({
          data: chapterData,
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

    // Restore volumes (removing asset references to avoid foreign key issues)
    console.log(`📚 Restoring ${data.volumes.length} volumes...`);
    for (const volume of data.volumes) {
      const { versions, chapter, illustrationAssetId, ...volumeData } = volume;

      const existing = await prisma.volume.findUnique({
        where: { id: volume.id },
      });

      if (!existing) {
        await prisma.volume.create({
          data: {
            ...volumeData,
            id: volume.id,
          },
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
