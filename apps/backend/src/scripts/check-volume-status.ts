import prisma from "../lib/prisma.js";

async function checkVolumeStatus() {
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

    // Get volume statuses
    const volumes = await prisma.volume.findMany({
      where: { chapterId: chapter.id },
      select: {
        volumeNumber: true,
        title: true,
        status: true,
        publishedAt: true,
        scheduledFor: true,
      },
      orderBy: { volumeNumber: "asc" },
      take: 5,
    });

    console.log(`\n📖 Volume Statuses:`);
    volumes.forEach((v) => {
      console.log(`\n  Vol ${v.volumeNumber}: ${v.title}`);
      console.log(`    Status: ${v.status}`);
      console.log(`    Published: ${v.publishedAt}`);
      console.log(`    Scheduled: ${v.scheduledFor}`);
    });

    // Count by status
    const statuses = await prisma.volume.groupBy({
      by: ["status"],
      where: { chapterId: chapter.id },
      _count: true,
    });

    console.log(`\n📊 Status Summary:`);
    statuses.forEach((s: any) => {
      console.log(`   ${s.status}: ${s._count}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVolumeStatus();
