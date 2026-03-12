import prisma from "../lib/prisma.js";

async function checkChapterVolumes() {
  try {
    // Get first chapter
    const chapter = await prisma.chapter.findFirst({
      where: { protagonistName: "Ursula" },
    });

    if (!chapter) {
      console.log("❌ Chapter not found");
      return;
    }

    console.log(`✅ Chapter: ${chapter.protagonistName} - ${chapter.title}`);
    console.log(`   ID: ${chapter.id}`);

    // Count volumes
    const volumeCount = await prisma.volume.count({
      where: { chapterId: chapter.id },
    });

    console.log(`\n📊 Volumes: ${volumeCount}`);

    if (volumeCount === 0) {
      console.log("❌ NO VOLUMES FOUND!");
      console.log("\n⚠️  This chapter has no volumes. That's why they're not visible.");
    } else {
      // Show first few volumes
      const volumes = await prisma.volume.findMany({
        where: { chapterId: chapter.id },
        take: 3,
        orderBy: { volumeNumber: "asc" },
      });

      volumes.forEach((v) => {
        console.log(`  - Vol ${v.volumeNumber}: ${v.title}`);
      });

      if (volumeCount > 3) {
        console.log(`  ... and ${volumeCount - 3} more`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChapterVolumes();
