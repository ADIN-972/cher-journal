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

async function importAllProtagonists() {
  console.log("📖 Importing ALL protagonists from production data...\n");

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

    // Get unique protagonists
    const protagonists = [...new Set(data.chapters.map((c) => c.protagonistName))];
    console.log(`📚 Found ${protagonists.length} protagonists`);
    console.log(`   ${protagonists.join(", ")}\n`);

    let imported = 0;
    let skipped = 0;

    for (const protagonist of protagonists) {
      const chapters = data.chapters.filter(
        (c) => c.protagonistName === protagonist
      );

      console.log(`\n🎭 ${protagonist} (${chapters.length} chapters)`);

      for (const chapter of chapters) {
        // Check if already imported
        const existing = await prisma.chapter.findUnique({
          where: { id: chapter.id },
        });

        if (existing) {
          console.log(`   ✅ ${chapter.title} (already imported)`);
          skipped++;
          continue;
        }

        // Import chapter with core fields only
        const chapterData = {
          id: chapter.id,
          title: chapter.title,
          protagonistName: chapter.protagonistName,
          status: chapter.status,
          publishedAt: chapter.publishedAt,
          description: chapter.description || null,
          accroche_marketing: chapter.accroche_marketing || null,
          accroche_classic: chapter.accroche_classic || null,
          accroche_dark: chapter.accroche_dark || null,
          accroche_love: chapter.accroche_love || null,
          accroche_dark_collection: chapter.accroche_dark_collection || null,
          niveau_intensite: chapter.niveau_intensite || null,
          niveau_douceur: chapter.niveau_douceur || null,
          niveau_danger: chapter.niveau_danger || null,
          niveau_transformation: chapter.niveau_transformation || null,
        };

        await prisma.chapter.create({ data: chapterData });

        // Import genre tags
        const genreTags = data.chapterGenreTags.filter(
          (t) => t.chapterId === chapter.id
        );
        for (const tag of genreTags) {
          await prisma.chapterGenreTag.create({ data: tag });
        }

        // Import volumes
        const volumes = data.volumes.filter(
          (v) => v.chapterId === chapter.id
        );
        for (const volume of volumes) {
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

        // Import volume versions
        const versions = data.volumeVersions.filter((v) =>
          volumes.some((vol) => vol.id === v.volumeId)
        );
        for (const version of versions) {
          try {
            await prisma.volumeVersion.create({
              data: {
                id: version.id,
                volumeId: version.volumeId,
                perspective: version.perspective,
              },
            });
          } catch (e) {
            // Skip if already exists
          }
        }

        // Import cover asset if available
        if (chapter.coverAssetId) {
          try {
            const asset = data.chapterAssets.find(
              (a) => a.id === chapter.coverAssetId
            );
            if (asset && !asset.originalAssetId) {
              const existing = await prisma.chapterAsset.findUnique({
                where: { id: asset.id },
              });
              if (!existing) {
                await prisma.chapterAsset.create({ data: asset });
                await prisma.chapter.update({
                  where: { id: chapter.id },
                  data: { coverAssetId: chapter.coverAssetId },
                });
              }
            }
          } catch (e) {
            // Skip asset issues
          }
        }

        console.log(`   ✅ ${chapter.title} (${volumes.length} volumes)`);
        imported++;
      }
    }

    console.log(`\n✨ Import completed!`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   🎭 Total protagonists: ${protagonists.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing protagonists:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importAllProtagonists();
