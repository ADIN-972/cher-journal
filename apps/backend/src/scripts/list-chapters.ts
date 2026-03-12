import prisma from "../lib/prisma.js";

async function listChapters() {
  try {
    const chapters = await prisma.chapter.findMany({
      select: { id: true, title: true, protagonistName: true },
      take: 10,
    });

    console.log(`Found ${chapters.length} chapters:`);
    chapters.forEach((c) => {
      console.log(`  - ${c.protagonistName}: ${c.title}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listChapters();
