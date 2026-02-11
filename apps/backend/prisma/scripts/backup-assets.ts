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
    if (!fs.existsSync(config.uploadDir)) {
      console.log(`ℹ️  Upload directory not found at ${config.uploadDir}`);
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

    // Create temp directory for backup
    const tempDir = path.join(config.uploadDir, ".backup");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write metadata
    const metadataPath = path.join(tempDir, "assets-manifest.json");
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

    // Create tar.gz archive
    const backupPath = path.join(
      __dirname,
      "../seeds/data/assets-backup.tar.gz"
    );

    console.log(`📦 Creating archive (${chapterAssets.length} assets)...`);

    // Create archive with all image files
    await tar.create(
      {
        gzip: true,
        file: backupPath,
        cwd: config.uploadDir,
        filter: (p) => {
          // Include only image files and metadata, exclude backup directory itself
          return !p.includes(".backup");
        },
      },
      fs.readdirSync(config.uploadDir).filter((f) => {
        // Include all chapter subdirectories (containing images)
        const fullPath = path.join(config.uploadDir, f);
        return (
          fs.statSync(fullPath).isDirectory() && !f.startsWith(".") && f !== "backup"
        );
      })
    );

    // Also copy metadata
    await tar.create(
      {
        gzip: false,
        file: backupPath,
        cwd: tempDir,
        mode: "w",
      },
      ["assets-manifest.json"]
    );

    // Cleanup temp directory
    fs.unlinkSync(metadataPath);
    fs.rmdirSync(tempDir);

    console.log(`✅ Assets backed up successfully`);
    console.log(`📁 Location: ${backupPath}`);
    console.log(`   - Chapter Assets: ${chapterAssets.length}`);
    console.log(`   - Version Assets: ${versionAssets.length}`);
    console.log(`💾 Archive size: ${fs.statSync(backupPath).size / 1024 / 1024} MB`);
  } catch (error) {
    console.error("❌ Assets backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupAssets();
