import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductionData {
  chapters: any[];
  volumes: any[];
  chapterAssets: any[];
  versionAssets: any[];
  volumeVersions: any[];
}

async function importAllAssets() {
  console.log("🖼️  Importing ALL assets for all protagonists...\n");

  try {
    const backupPath = path.join(
      __dirname,
      "../seeds/data/production-data.json"
    );

    if (!fs.existsSync(backupPath)) {
      console.error("❌ production-data.json not found");
      process.exit(1);
    }

    const data: ProductionData = JSON.parse(
      fs.readFileSync(backupPath, "utf-8")
    );

    // Get all chapters currently in DB
    const chapters = await prisma.chapter.findMany({
      select: { id: true, title: true, protagonistName: true },
    });

    console.log(`📚 Found ${chapters.length} chapters in database\n`);

    let assetCount = 0;
    let versionCount = 0;
    let attachCount = 0;

    for (const chapter of chapters) {
      console.log(`\n🎭 ${chapter.protagonistName} - ${chapter.title}`);

      // Find the original chapter data in production-data.json
      const originalChapter = data.chapters.find((c) => c.id === chapter.id);
      if (!originalChapter) {
        console.log(`   ⚠️  No data found in production`);
        continue;
      }

      const coverAssetId = originalChapter.coverAssetId;
      if (!coverAssetId) {
        console.log(`   ⚠️  No cover asset ID`);
        continue;
      }

      // Find all assets related to this cover asset (including versions)
      const neededAssets = new Set<string>();
      neededAssets.add(coverAssetId);

      // Find all asset versions that reference this asset
      for (const asset of data.chapterAssets) {
        if (asset.id === coverAssetId || asset.originalAssetId === coverAssetId) {
          neededAssets.add(asset.id);
        }
      }

      // Recursively find version chains
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        for (const asset of data.chapterAssets) {
          if (asset.originalAssetId && neededAssets.has(asset.originalAssetId) && !neededAssets.has(asset.id)) {
            neededAssets.add(asset.id);
            foundNew = true;
          }
        }
      }

      const chapterAssets = data.chapterAssets.filter((a) =>
        neededAssets.has(a.id)
      );

      if (chapterAssets.length === 0) {
        console.log(`   ⚠️  No assets found`);
        continue;
      }

      console.log(`   Found ${chapterAssets.length} assets`);

      // Import base assets first (no originalAssetId)
      const baseAssets = chapterAssets.filter((a) => !a.originalAssetId);
      for (const asset of baseAssets) {
        const existing = await prisma.chapterAsset.findUnique({
          where: { id: asset.id },
        });
        if (!existing) {
          try {
            await prisma.chapterAsset.create({ data: asset });
            assetCount++;
          } catch (e) {
            // Skip if FK constraint fails
          }
        }
      }

      // Import asset versions (with originalAssetId references)
      const assetVersions = chapterAssets.filter((a) => a.originalAssetId);
      for (const asset of assetVersions) {
        const existing = await prisma.chapterAsset.findUnique({
          where: { id: asset.id },
        });
        if (!existing) {
          try {
            await prisma.chapterAsset.create({ data: asset });
            versionCount++;
          } catch (e) {
            // Skip if FK constraint fails
          }
        }
      }

      // Attach cover asset if available
      const assetExists = await prisma.chapterAsset.findUnique({
        where: { id: coverAssetId },
      });

      if (assetExists) {
        const currentChapter = await prisma.chapter.findUnique({
          where: { id: chapter.id },
          select: { coverAssetId: true },
        });

        if (!currentChapter?.coverAssetId) {
          try {
            await prisma.chapter.update({
              where: { id: chapter.id },
              data: { coverAssetId },
            });
            attachCount++;
            console.log(`   ✅ Cover asset attached`);
          } catch (e) {
            console.log(`   ⚠️  Could not attach cover asset`);
          }
        } else {
          console.log(`   ℹ️  Cover asset already attached`);
        }
      }
    }

    // Import volume assets
    console.log(`\n\n🎨 Importing volume assets...`);
    const volumes = await prisma.volume.findMany({
      select: { id: true, chapterId: true },
    });

    let volumeAssetCount = 0;

    for (const volume of volumes) {
      // Find volume versions for this volume
      const versions = data.volumeVersions.filter(
        (v) => v.volumeId === volume.id
      );

      // Find version assets for these versions
      const versionAssets = data.versionAssets.filter((va) =>
        versions.some((v) => v.id === va.volumeVersionId)
      );

      for (const asset of versionAssets) {
        const existing = await prisma.versionAsset.findUnique({
          where: { id: asset.id },
        });
        if (!existing) {
          try {
            await prisma.versionAsset.create({ data: asset });
            volumeAssetCount++;
          } catch (e) {
            // Skip if FK constraint fails
          }
        }
      }
    }

    console.log(`\n✨ Asset import completed!`);
    console.log(`   🖼️  Chapter assets: ${assetCount} (base) + ${versionCount} (versions)`);
    console.log(`   🎨 Volume assets: ${volumeAssetCount}`);
    console.log(`   📎 Cover attachments: ${attachCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing assets:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importAllAssets();
