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

async function restoreDatabase() {
  try {
    console.log("📥 Starting database restore from backup...");

    const backupPath = path.join(
      __dirname,
      "../seeds/data/production-data.json"
    );

    if (!fs.existsSync(backupPath)) {
      console.error(
        `❌ Backup file not found at ${backupPath}`
      );
      process.exit(1);
    }

    const data: ProductionData = JSON.parse(
      fs.readFileSync(backupPath, "utf-8")
    );

    // Clean related tables first (order matters due to foreign keys)
    console.log("🧹 Cleaning tables...");
    await prisma.versionAsset.deleteMany();
    await prisma.volumeVersion.deleteMany();
    await prisma.chapterGenreTag.deleteMany();
    await prisma.chapterAsset.deleteMany();
    await prisma.volume.deleteMany();
    await prisma.chapter.deleteMany();

    // Restore chapters
    console.log(`📝 Restoring ${data.chapters.length} chapters...`);
    for (const chapter of data.chapters) {
      await prisma.chapter.create({
        data: chapter,
      });
    }

    // Restore chapters genre tags
    console.log(
      `🏷️  Restoring ${data.chapterGenreTags.length} genre tags...`
    );
    for (const tag of data.chapterGenreTags) {
      await prisma.chapterGenreTag.create({
        data: tag,
      });
    }

    // Restore volumes
    console.log(`📚 Restoring ${data.volumes.length} volumes...`);
    for (const volume of data.volumes) {
      await prisma.volume.create({
        data: volume,
      });
    }

    // Restore volume versions
    console.log(
      `🔄 Restoring ${data.volumeVersions.length} volume versions...`
    );
    for (const version of data.volumeVersions) {
      await prisma.volumeVersion.create({
        data: version,
      });
    }

    // Restore chapter assets
    console.log(`🖼️  Restoring ${data.chapterAssets.length} chapter assets...`);
    for (const asset of data.chapterAssets) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.chapterAsset.create({
          data: asset,
        });
      }
    }

    // Restore version assets
    console.log(`🎨 Restoring ${data.versionAssets.length} version assets...`);
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

    console.log(`✅ Database restored successfully from backup!`);
  } catch (error) {
    console.error("❌ Restore failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreDatabase();
