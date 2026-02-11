import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as tar from "tar";
import { config } from "@cher-journal/config";

const prisma = new PrismaClient();

interface AssetMetadata {
  chapterAssets: any[];
  versionAssets: any[];
  manifestVersion: string;
  backupDate: string;
}

async function backupAssets() {
  try {
    console.log("📷 Starting assets backup...");

    // Check if upload directory exists
    const uploadDirPath = path.resolve(config.uploadDir);
    if (!fs.existsSync(uploadDirPath)) {
      console.log(`ℹ️  Upload directory not found at ${uploadDirPath}`);
      console.log(`ℹ️  Skipping assets backup (no images to backup)`);
      return;
    }

    // Get all assets metadata
    const [chapterAssets, versionAssets] = await Promise.all([
      prisma.chapterAsset.findMany(),
      prisma.versionAsset.findMany(),
    ]);

    // Create metadata file
    const metadata: AssetMetadata = {
      chapterAssets,
      versionAssets,
      manifestVersion: "1.0.0",
      backupDate: new Date().toISOString(),
    };

    // Create tar.gz archive
    const backupPath = path.join(
      __dirname,
      "../seeds/data/assets-backup.tar.gz"
    );

    // Get list of files to include (all subdirectories)
    const filesToArchive = fs
      .readdirSync(uploadDirPath)
      .filter((f) => {
        const fullPath = path.join(uploadDirPath, f);
        const stat = fs.statSync(fullPath);
        // Include all directories except hidden ones
        return stat.isDirectory() && !f.startsWith(".");
      });

    console.log(
      `📦 Creating archive with ${filesToArchive.length} chapter directories...`
    );

    // Create archive with all image files
    if (filesToArchive.length > 0) {
      await tar.create(
        {
          gzip: true,
          file: backupPath,
          cwd: uploadDirPath,
        },
        filesToArchive
      );

      const archiveSize = fs.statSync(backupPath).size / (1024 * 1024);
      console.log(`✅ Assets backed up successfully`);
      console.log(`📁 Location: ${backupPath}`);
      console.log(`   - Chapter Directories: ${filesToArchive.length}`);
      console.log(`   - Chapter Assets (metadata): ${chapterAssets.length}`);
      console.log(`   - Version Assets (metadata): ${versionAssets.length}`);
      console.log(`💾 Archive size: ${archiveSize.toFixed(2)} MB`);
    } else {
      console.log(`ℹ️  No image directories found to backup`);
    }
  } catch (error) {
    console.error("❌ Assets backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupAssets();
