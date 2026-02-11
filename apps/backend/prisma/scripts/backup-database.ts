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

async function backupDatabase() {
  try {
    console.log("📦 Starting database backup...");

    // Export all production-related data
    const [chapters, volumes, volumeVersions, chapterGenreTags, chapterAssets, versionAssets] = await Promise.all([
      prisma.chapter.findMany(),
      prisma.volume.findMany(),
      prisma.volumeVersion.findMany(),
      prisma.chapterGenreTag.findMany(),
      prisma.chapterAsset.findMany(),
      prisma.versionAsset.findMany(),
    ]);

    const productionData: ProductionData = {
      chapters,
      volumes,
      volumeVersions,
      chapterGenreTags,
      chapterAssets,
      versionAssets,
    };

    // Create backup file
    const backupPath = path.join(
      __dirname,
      "../seeds/data/production-data.json"
    );

    // Ensure directory exists
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write backup with formatting for Git-friendly diffs
    // Custom replacer to handle BigInt
    const json = JSON.stringify(
      productionData,
      (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      },
      2
    );
    fs.writeFileSync(backupPath, json, "utf-8");

    console.log(`✅ Database backed up successfully`);
    console.log(`📁 Location: ${backupPath}`);
    console.log(`   - Chapters: ${chapters.length}`);
    console.log(`   - Volumes: ${volumes.length}`);
    console.log(`   - Chapter Assets: ${chapterAssets.length}`);
    console.log(`   - Version Assets: ${versionAssets.length}`);
  } catch (error) {
    console.error("❌ Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
