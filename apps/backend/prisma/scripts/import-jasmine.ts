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

async function importJasmine() {
  console.log("📖 Importing Jasmine chapter data...\n");

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

    // Check if already imported
    const existing = await prisma.chapter.findUnique({
      where: { id: jasmineChapter.id },
    });

    if (existing) {
      console.log("✅ Jasmine chapter already imported");
      process.exit(0);
    }

    // Import chapter with core fields only
    console.log("📝 Importing chapter...");
    const chapterData = {
      id: jasmineChapter.id,
      title: jasmineChapter.title,
      protagonistName: jasmineChapter.protagonistName,
      status: jasmineChapter.status,
      publishedAt: jasmineChapter.publishedAt,
      description: jasmineChapter.description || null,
      accroche_marketing: jasmineChapter.accroche_marketing || null,
      accroche_classic: jasmineChapter.accroche_classic || null,
      accroche_dark: jasmineChapter.accroche_dark || null,
      accroche_love: jasmineChapter.accroche_love || null,
      accroche_dark_collection: jasmineChapter.accroche_dark_collection || null,
      niveau_intensite: jasmineChapter.niveau_intensite || null,
      niveau_douceur: jasmineChapter.niveau_douceur || null,
      niveau_danger: jasmineChapter.niveau_danger || null,
      niveau_transformation: jasmineChapter.niveau_transformation || null,
    };

    await prisma.chapter.create({ data: chapterData });
    console.log(`   ✅ ${jasmineChapter.title} created`);

    // Import genre tags
    console.log("🏷️  Importing genre tags...");
    const jasmineGenres = data.chapterGenreTags.filter(
      (t) => t.chapterId === jasmineChapter.id
    );
    for (const tag of jasmineGenres) {
      const existing = await prisma.chapterGenreTag.findFirst({
        where: {
          chapterId: tag.chapterId,
          genre: tag.genre,
        },
      });
      if (!existing) {
        await prisma.chapterGenreTag.create({ data: tag });
      }
    }
    console.log(`   ✅ ${jasmineGenres.length} genre tags imported`);

    // Import volumes
    console.log("📚 Importing volumes...");
    const jasmineVolumes = data.volumes.filter(
      (v) => v.chapterId === jasmineChapter.id
    );

    for (const volume of jasmineVolumes) {
      const existing = await prisma.volume.findUnique({
        where: { id: volume.id },
      });
      if (!existing) {
        await prisma.volume.create({
          data: {
            id: volume.id,
            chapterId: volume.chapterId,
            volumeNumber: volume.volumeNumber,
            title: volume.title,
            publishedAt: volume.publishedAt,
            status: volume.status,
          },
        });
      }
    }
    console.log(`   ✅ ${jasmineVolumes.length} volumes imported`);

    // Import volume versions
    console.log("🔄 Importing volume versions...");
    const jasmineVersions = data.volumeVersions.filter((v) =>
      jasmineVolumes.some((vol) => vol.id === v.volumeId)
    );

    for (const version of jasmineVersions) {
      const existing = await prisma.volumeVersion.findUnique({
        where: { id: version.id },
      });
      if (!existing) {
        await prisma.volumeVersion.create({
          data: {
            id: version.id,
            volumeId: version.volumeId,
            perspective: version.perspective,
          },
        });
      }
    }
    console.log(`   ✅ ${jasmineVersions.length} volume versions imported`);

    console.log("\n✨ Jasmine chapter fully imported!");
    console.log(`📖 Chapter: ${jasmineChapter.title}`);
    console.log(`📚 Volumes: ${jasmineVolumes.length}`);
    console.log(`🏷️  Genres: ${jasmineGenres.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing Jasmine:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importJasmine();
