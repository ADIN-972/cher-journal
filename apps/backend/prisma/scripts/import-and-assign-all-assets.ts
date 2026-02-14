import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductionData {
  chapters: any[];
  chapterAssets: any[];
}

async function importAndAssignAssets() {
  console.log("🖼️  Importing ALL assets and assigning to protagonists...\n");

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

    console.log(`📦 Importing ${data.chapterAssets.length} assets...`);

    // Import ALL chapter assets
    let imported = 0;
    let skipped = 0;

    // Import base assets first
    const baseAssets = data.chapterAssets.filter((a) => !a.originalAssetId);
    for (const asset of baseAssets) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });
      if (!existing) {
        try {
          await prisma.chapterAsset.create({ data: asset });
          imported++;
        } catch (e) {
          skipped++;
        }
      }
    }

    console.log(`✅ Base assets: ${imported} imported, ${skipped} skipped`);

    // Import asset versions
    imported = 0;
    skipped = 0;
    const assetVersions = data.chapterAssets.filter((a) => a.originalAssetId);
    for (const asset of assetVersions) {
      const existing = await prisma.chapterAsset.findUnique({
        where: { id: asset.id },
      });
      if (!existing) {
        try {
          await prisma.chapterAsset.create({ data: asset });
          imported++;
        } catch (e) {
          skipped++;
        }
      }
    }

    console.log(`✅ Asset versions: ${imported} imported, ${skipped} skipped\n`);

    // Now assign cover assets based on label matching
    console.log("🎭 Assigning cover assets by protagonist name...");

    const chapters = await prisma.chapter.findMany({
      select: { id: true, title: true, protagonistName: true, coverAssetId: true },
    });

    let assigned = 0;
    let alreadySet = 0;
    let notFound = 0;

    for (const chapter of chapters) {
      if (chapter.coverAssetId) {
        alreadySet++;
        continue;
      }

      // Find assets matching this protagonist
      const matchingAssets = data.chapterAssets.filter((asset) =>
        asset.label
          .toLowerCase()
          .includes(chapter.protagonistName.toLowerCase())
      );

      if (matchingAssets.length === 0) {
        console.log(`   ⚠️  ${chapter.protagonistName}: No matching assets`);
        notFound++;
        continue;
      }

      // Pick the first asset (preferably one without originalAssetId - the base asset)
      const baseAsset = matchingAssets.find((a) => !a.originalAssetId) ||
        matchingAssets[0];
      const existingAsset = await prisma.chapterAsset.findUnique({
        where: { id: baseAsset.id },
      });

      if (existingAsset) {
        try {
          await prisma.chapter.update({
            where: { id: chapter.id },
            data: { coverAssetId: baseAsset.id },
          });
          console.log(`   ✅ ${chapter.protagonistName}: Assigned (${matchingAssets.length} assets available)`);
          assigned++;
        } catch (e) {
          console.log(`   ❌ ${chapter.protagonistName}: Failed to assign`);
        }
      } else {
        console.log(`   ⚠️  ${chapter.protagonistName}: Asset not imported`);
      }
    }

    console.log(`\n✨ Asset assignment completed!`);
    console.log(`   ✅ Assigned: ${assigned}`);
    console.log(`   ℹ️  Already set: ${alreadySet}`);
    console.log(`   ⚠️  Not found: ${notFound}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importAndAssignAssets();
