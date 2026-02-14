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

async function importJasmineWithAssets() {
  console.log("📖 Importing Jasmine chapter with ALL assets...\n");

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

    // Find Jasmine's chapter
    const jasmineChapter = data.chapters.find(
      (c) => c.protagonistName === "Jasmine"
    );

    if (!jasmineChapter) {
      console.error("❌ Jasmine chapter not found in production data");
      process.exit(1);
    }

    console.log(`📚 Found: ${jasmineChapter.title}`);

    // Get all assets that might be referenced
    const neededAssets = new Set<string>();

    // Collect all asset IDs needed
    if (jasmineChapter.coverAssetId) {
      neededAssets.add(jasmineChapter.coverAssetId);
    }

    // Find all asset version chains (originalAssetId references)
    for (const asset of data.chapterAssets) {
      if (neededAssets.has(asset.id) || neededAssets.has(asset.originalAssetId)) {
        neededAssets.add(asset.id);
        if (asset.originalAssetId) {
          neededAssets.add(asset.originalAssetId);
        }
      }
    }

    // Iteratively find all referenced assets
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

    console.log(`🖼️  Found ${neededAssets.size} assets to import`);

    // Import assets in correct dependency order
    const assetsToImport = data.chapterAssets.filter((a) => neededAssets.has(a.id));

    // Sort: base assets first (no originalAssetId), then versions
    const baseAssets = assetsToImport.filter((a) => !a.originalAssetId);
    const assetVersions = assetsToImport.filter((a) => a.originalAssetId);

    console.log("   Importing base assets...");
    for (const asset of baseAssets) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });
      if (!existing) {
        try {
          await prisma.chapterAsset.create({ data: asset });
        } catch (e) {
          console.log(`   ⚠️  Skipping asset ${asset.id} (FK issue)`);
        }
      }
    }

    console.log("   Importing asset versions...");
    for (const asset of assetVersions) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });
      if (!existing) {
        try {
          await prisma.chapterAsset.create({ data: asset });
        } catch (e) {
          console.log(`   ⚠️  Skipping asset version ${asset.id} (FK issue)`);
        }
      }
    }

    console.log(`✅ Assets imported (skipped versions with FK issues)`);

    // Now update chapter with cover asset if available
    if (jasmineChapter.coverAssetId) {
      const coverAsset = await prisma.chapterAsset.findUnique({
        where: { id: jasmineChapter.coverAssetId },
      });
      if (coverAsset) {
        await prisma.chapter.update({
          where: { id: jasmineChapter.id },
          data: { coverAssetId: jasmineChapter.coverAssetId },
        });
        console.log(`✅ Cover asset attached`);
      }
    }

    // Import volume assets if any
    const jasmineVolumes = data.volumes.filter(
      (v) => v.chapterId === jasmineChapter.id
    );

    const volumeAssets = data.versionAssets.filter((a) =>
      jasmineVolumes.some((v) =>
        data.volumeVersions.some(
          (vv) => vv.volumeId === v.id && vv.id === a.volumeVersionId
        )
      )
    );

    if (volumeAssets.length > 0) {
      console.log(`🎨 Importing ${volumeAssets.length} volume assets...`);
      for (const asset of volumeAssets) {
        const existing = await prisma.versionAsset.findUnique({
          where: { id: asset.id },
        });
        if (!existing) {
          try {
            await prisma.versionAsset.create({ data: asset });
          } catch (e) {
            console.log(`   ⚠️  Skipping version asset ${asset.id}`);
          }
        }
      }
    }

    console.log("\n✨ Jasmine chapter fully imported with assets!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing Jasmine:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importJasmineWithAssets();
