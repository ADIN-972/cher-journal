import { PrismaClient } from "@prisma/client";
import { seedGeneratedData } from "./01-generated-seed";
import { seedProductionData } from "./02-production-seed";

const prisma = new PrismaClient();

/**
 * Main seed orchestrator
 *
 * Execution order:
 * 1. Clean all data (except users for now)
 * 2. Create generated/test data (01-generated-seed)
 * 3. Import production data (02-production-seed)
 *
 * This ensures:
 * - Test/generated data provides base content for development
 * - Production data overrides and supplements with real content
 * - Proper foreign key relationships are maintained
 * - Clean separation of concerns
 */
async function main() {
  console.log("\n🌱 Starting complete seed...\n");

  try {
    // Clean only data-related tables, keep users/auth separate
    // Order matters due to foreign key constraints!
    console.log("🧹 Cleaning tables...");

    // Clean tables that depend on other tables first
    await Promise.all([
      prisma.order.deleteMany(),
      prisma.entitlement.deleteMany(),
      prisma.unlock.deleteMany(),
      prisma.volumeRead.deleteMany(),
      prisma.chapterReview.deleteMany(),
      prisma.bundleItem.deleteMany(),
      prisma.versionAsset.deleteMany(),
      prisma.chapterPriceOverride.deleteMany(),
      prisma.appliedPromotion.deleteMany(),
    ]);

    // Then clean volumes and versions
    await Promise.all([
      prisma.volumeVersion.deleteMany(),
      prisma.volume.deleteMany(),
    ]);

    // Clean chapter-related data
    await Promise.all([
      prisma.chapterGenreTag.deleteMany(),
      prisma.chapterAsset.deleteMany(),
    ]);

    // Finally clean chapters
    await prisma.chapter.deleteMany();

    console.log("✅ Tables cleaned\n");

    // Step 1: Seed generated/test data
    await seedGeneratedData();
    console.log();

    // Step 2: Seed production data (from backup)
    await seedProductionData();
    console.log();

    console.log("✨ ==========================================");
    console.log("✨ Seed completed successfully!");
    console.log("✨ ==========================================\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
