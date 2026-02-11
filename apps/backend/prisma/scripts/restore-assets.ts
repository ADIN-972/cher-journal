import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as tar from "tar";
import { config } from "@cher-journal/config";

const prisma = new PrismaClient();

interface AssetMetadata {
  chapterAssets: any[];
  versionAssets: any[];
  manifestVersion: string;
  backupDate: string;
}

async function restoreAssets() {
  try {
    console.log("📷 Starting assets restore...");

    const backupPath = path.join(
      __dirname,
      "../seeds/data/assets-backup.tar.gz"
    );

    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      console.log(`ℹ️  Assets backup not found at ${backupPath}`);
      console.log(
        `💡 Run: npm run backup:assets to create an assets backup`
      );
      return;
    }

    // Extract archive
    console.log(`📦 Extracting archive...`);
    await tar.extract({
      gzip: true,
      file: backupPath,
      cwd: config.uploadDir,
    });

    // Read and restore metadata
    const manifestPath = path.join(config.uploadDir, "assets-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      console.log(`⚠️  Assets manifest not found, skipping metadata restore`);
      return;
    }

    const manifest: AssetMetadata = JSON.parse(
      fs.readFileSync(manifestPath, "utf-8")
    );

    console.log(`🗄️  Restoring metadata...`);

    // Restore chapter assets metadata
    console.log(
      `📝 Restoring ${manifest.chapterAssets.length} chapter assets...`
    );
    for (const asset of manifest.chapterAssets) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.chapterAsset.create({
          data: asset,
        });
      }
    }

    // Restore version assets metadata
    console.log(`📝 Restoring ${manifest.versionAssets.length} version assets...`);
    for (const asset of manifest.versionAssets) {
      const existing = await prisma.versionAsset.findUnique({
        where: { id: asset.id },
      });

      if (!existing) {
        await prisma.versionAsset.create({
          data: asset,
        });
      }
    }

    // Cleanup manifest
    fs.unlinkSync(manifestPath);

    console.log(`✅ Assets restored successfully!`);
    console.log(`📁 Images extracted to: ${config.uploadDir}`);
    console.log(`   - Chapter Assets: ${manifest.chapterAssets.length}`);
    console.log(`   - Version Assets: ${manifest.versionAssets.length}`);
    console.log(`   - Backup date: ${manifest.backupDate}`);
  } catch (error) {
    console.error("❌ Assets restore failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAssets();
