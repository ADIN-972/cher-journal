import prisma from "../lib/prisma.js";

async function checkVolumes() {
  try {
    // Get a chapter from julia's entitlements
    const chapter = await prisma.chapter.findFirst({
      where: {
        title: "Neuf semaines d'éternité",
      },
    });

    if (!chapter) {
      console.log("❌ Chapter not found");
      return;
    }

    console.log(`✅ Found chapter: ${chapter.protagonistName} - ${chapter.title}`);
    console.log(`   Chapter ID: ${chapter.id}`);

    // Get volumes for this chapter
    const volumes = await prisma.volume.findMany({
      where: { chapterId: chapter.id },
      include: {
        versions: true,
      },
      orderBy: { volumeNumber: "asc" },
    });

    console.log(`\n📖 Volumes (${volumes.length}):`);
    if (volumes.length === 0) {
      console.log("   ❌ No volumes found for this chapter!");
    } else {
      volumes.slice(0, 5).forEach((vol) => {
        console.log(`\n   Vol ${vol.volumeNumber}: ${vol.title}`);
        console.log(`      Status: ${vol.status}`);
        console.log(`      isFree: ${vol.isFree}`);
        console.log(`      Published: ${vol.publishedAt}`);
        console.log(`      Versions: ${vol.versions.length}`);
        vol.versions.forEach((v) => {
          console.log(`         - ${v.perspective}`);
        });
      });
      if (volumes.length > 5) {
        console.log(`\n   ... and ${volumes.length - 5} more volumes`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVolumes();
