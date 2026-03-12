import prisma from "../lib/prisma.js";

async function testChapterAPI() {
  try {
    // Get julia's ID
    const user = await prisma.user.findUnique({
      where: { email: "julia@dev.com" },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Get first chapter from julia's entitlements
    const entitlement = await prisma.entitlement.findFirst({
      where: { userId: user.id },
      include: { chapter: true },
    });

    if (!entitlement) {
      console.log("❌ No entitlements found");
      return;
    }

    const chapterId = entitlement.chapterId;
    console.log(`\n📖 Testing chapter: ${entitlement.chapter.protagonistName} - ${entitlement.chapter.title}`);
    console.log(`   Chapter ID: ${chapterId}`);

    // Get chapter with volumes (simulating the API call)
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        coverAsset: true,
        genres: {
          select: { genre: true },
        },
        volumes: {
          include: {
            illustrationAsset: true,
            versions: {
              select: {
                id: true,
                perspective: true,
                characterCount: true,
              },
            },
          },
          orderBy: { volumeNumber: "asc" },
        },
      },
    });

    if (!chapter) {
      console.log("❌ Chapter not found");
      return;
    }

    console.log(`\n✅ Chapter retrieved from DB:`);
    console.log(`   Total volumes in DB: ${chapter.volumes.length}`);
    console.log(`   Volumes returned:`);
    chapter.volumes.slice(0, 3).forEach((v) => {
      console.log(`     - Vol ${v.volumeNumber}: ${v.title} (Status: ${v.status})`);
    });
    if (chapter.volumes.length > 3) {
      console.log(`     ... and ${chapter.volumes.length - 3} more`);
    }

    // Check user entitlements for this chapter
    const userEntitlements = await prisma.entitlement.findMany({
      where: { userId: user.id, chapterId },
    });

    console.log(`\n✅ User entitlements for this chapter:`);
    userEntitlements.forEach((e) => {
      console.log(`   - Volumes ${e.volumeFrom} to ${e.volumeTo}: ${e.scopes.join(", ")}`);
    });

    // Count accessible volumes based on entitlements
    let accessibleCount = 0;
    chapter.volumes.forEach((v) => {
      const isAccessible = userEntitlements.some(
        (e) => v.volumeNumber >= e.volumeFrom && v.volumeNumber <= e.volumeTo
      );
      if (isAccessible) accessibleCount++;
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total volumes: ${chapter.volumes.length}`);
    console.log(`   Accessible volumes: ${accessibleCount}`);
    console.log(`   Scopes: ${[...new Set(userEntitlements.flatMap((e) => e.scopes))].join(", ")}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testChapterAPI();
