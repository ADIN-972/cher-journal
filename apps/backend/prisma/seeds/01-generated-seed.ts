import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { config } from "@cher-journal/config";

const prisma = new PrismaClient();

function createDate2025(month: number, day: number): Date {
  return new Date(2025, month, day, 10, 0, 0);
}

function createDate2026(month: number, day: number): Date {
  return new Date(2026, month, day, 10, 0, 0);
}

/**
 * Generated seed: Creates fake/test data for development and testing
 * This seed is kept separate from production data to avoid mixing concerns
 */
export async function seedGeneratedData() {
  console.log("🎭 Seeding generated (test) data...");

  try {
    // Create or verify admin user exists
    const adminHash = await bcrypt.hash(config.seed.adminPassword, 10);
    const existingAdmin = await prisma.user.findUnique({
      where: { email: config.seed.adminEmail },
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: config.seed.adminEmail,
          passwordHash: adminHash,
          role: "ADMIN",
          status: "ACTIVE",
          firstName: "Admin",
          lastName: "Test",
        },
      });
      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️  Admin user already exists, skipping creation");
    }

    // DISABLED: Create test chapters with volumes
    // To re-enable generated test data, uncomment the code below
    /*
    const chapterData =  [
      { title: "Le Secret de la Forêt", hasEpilogue: true, protagonist: "Léa", genres: ["PASSIONS_CHARNELLES", "REVES_SECRETS"] },
      { title: "L'Énigme du Manoir", hasEpilogue: false, protagonist: "Jasmine", genres: ["MYSTERIES_SENSUELS", "INTERDITS"] },
      { title: "Le Voyage Interdit", hasEpilogue: true, protagonist: "Emma", genres: ["INTERDITS", "PASSION_BRUTALE"] },
      { title: "La Montre Magique", hasEpilogue: false, protagonist: "Belle", genres: ["REVES_SECRETS", "ROMANCES_TENDRES"] },
      { title: "Les Gardiens du Temps", hasEpilogue: true, protagonist: "Sophie", genres: ["PASSIONS_CHARNELLES", "CONQUETES"] },
      { title: "Le Mystère de l'Île", hasEpilogue: false, protagonist: "Léna", genres: ["MYSTERIES_SENSUELS", "PASSION_BRUTALE"] },
      { title: "La Légende Oubliée", hasEpilogue: true, protagonist: "Clara", genres: ["ROMANCES_TENDRES", "DESIR_NOCTURNE"] },
      { title: "Les Portes de l'Infini", hasEpilogue: false, protagonist: "Sunshine", genres: ["PASSIONS_CHARNELLES", "AMOUR_COMPLIQUE"] },
      { title: "Le Dernier Sortilège", hasEpilogue: true, protagonist: "Jade", genres: ["INTERDITS", "LIBERATION"] },
      { title: "L'Écho des Étoiles", hasEpilogue: false, protagonist: "Esmeralda", genres: ["DESIR_NOCTURNE", "CONQUETES"] },
      { title: "Le Royaume Perdu", hasEpilogue: false, protagonist: "Chloé", genres: ["ROMANCES_TENDRES", "REVES_SECRETS"] },
      { title: "Les Ombres du Passé", hasEpilogue: false, protagonist: "Ursula", genres: ["PASSION_BRUTALE", "AMOUR_COMPLIQUE"] },
      { title: "La Clé des Songes", hasEpilogue: false, protagonist: "Lily", genres: ["LIBERATION", "PASSIONS_CHARNELLES"] },
      { title: "Le Pacte des Immortels", hasEpilogue: false, protagonist: "Julia", genres: ["MYSTERIES_SENSUELS", "REVES_SECRETS"] },
    ];

    for (let i = 0; i < chapterData.length; i++) {
      const chapter = await prisma.chapter.create({
        data: {
          title: chapterData[i].title,
          protagonistName: chapterData[i].protagonist,
          status: "PUBLISHED",
          publishedAt: createDate2025(0, i + 1),
        },
      });

      // Add genres to chapter
      for (const genre of chapterData[i].genres) {
        await prisma.chapterGenreTag.create({
          data: {
            chapterId: chapter.id,
            genre: genre as any,
          },
        });
      }

      // Create 5-6 volumes per chapter
      const volumeCount = chapterData[i].hasEpilogue ? 6 : 5;
      for (let v = 1; v <= volumeCount; v++) {
        const isEpilogue = chapterData[i].hasEpilogue && v === 6;
        const volume = await prisma.volume.create({
          data: {
            chapterId: chapter.id,
            volumeNumber: v,
            title: isEpilogue ? "Épilogue" : `Volume ${v}`,
            publishedAt: createDate2025(Math.floor(i / 2), i + v),
            status: "PUBLISHED",
          },
        });

        await prisma.volumeVersion.create({
          data: { volumeId: volume.id, perspective: "NARRATOR" },
        });
      }
    }
    */

    console.log("ℹ️  Generated test data disabled (only production data will be used)");
  } catch (error) {
    console.error("❌ Error seeding generated data:", error);
    throw error;
  }
}
