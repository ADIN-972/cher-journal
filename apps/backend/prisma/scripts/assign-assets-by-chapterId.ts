import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductionData {
  chapters: any[];
  chapterAssets: any[];
}

async function assignAssetsByChapterId() {
  console.log("🎯 Assigning assets using chapterId...\n");

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

    const chapters = await prisma.chapter.findMany({
      select: { id: true, title: true, protagonistName: true, coverAssetId: true },
    });

    console.log(`📚 Processing ${chapters.length} chapters...\n`);

    let assigned = 0;
    let skipped = 0;

    for (const chapter of chapters) {
      if (chapter.coverAssetId) {
        console.log(`   ✅ ${chapter.protagonistName}: Already has cover asset`);
        skipped++;
        continue;
      }

      // Find assets by chapterId
      const assetsForChapter = data.chapterAssets.filter(
        (a) => a.chapterId === chapter.id
      );

      if (assetsForChapter.length === 0) {
        console.log(`   ⚠️  ${chapter.protagonistName}: No assets found by chapterId`);
        continue;
      }

      // Pick first base asset (no originalAssetId)
      const baseAsset = assetsForChapter.find((a) => !a.originalAssetId) ||
        assetsForChapter[0];

      // Check if asset was imported
      const existingAsset = await prisma.chapterAsset.findUnique({
        where: { id: baseAsset.id },
      });

      if (!existingAsset) {
        console.log(
          `   ⚠️  ${chapter.protagonistName}: Asset exists but not imported yet`
        );
        continue;
      }

      // Assign the cover asset
      try {
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { coverAssetId: baseAsset.id },
        });
        console.log(
          `   ✅ ${chapter.protagonistName}: Assigned ${assetsForChapter.length} assets`
        );
        assigned++;
      } catch (e) {
        console.log(`   ❌ ${chapter.protagonistName}: Failed to assign`);
      }
    }

    console.log(`\n✨ Assignment by chapterId completed!`);
    console.log(`   ✅ Newly assigned: ${assigned}`);
    console.log(`   ⏭️  Already had cover: ${skipped}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignAssetsByChapterId();
