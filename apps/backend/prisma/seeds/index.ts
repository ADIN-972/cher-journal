import { PrismaClient } from "@prisma/client";
import { seedGeneratedData } from "./01-generated-seed";
import { seedProductionData } from "./02-production-seed";
import { seedRestoreData } from "./03-restore-seed";
import { seedTestPromotions } from "./04-test-promotions";

const prisma = new PrismaClient();

/**
 * Main seed orchestrator
 *
 * Execution order:
 * 1. Clean all data (except users for now)
 * 2. Create generated/test data (01-generated-seed)
 * 3. Import production data (02-production-seed)
 * 4. Restore snapshot data if available (03-restore-seed)
 * 5. Create test promotions (04-test-promotions)
 *
 * This ensures:
 * - Test/generated data provides base content for development
 * - Production data overrides and supplements with real content
 * - Restore data (if present) provides exact state snapshots
 * - Test promotions are available for development
 * - Proper foreign key relationships are maintained
 * - Clean separation of concerns
 *
 * To export current database state, run:
 *   npx ts-node prisma/scripts/extract-all-data.ts
 *
 * See RESTORE-SEED.md for detailed documentation
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
      (prisma as any).userBadge?.deleteMany?.() || Promise.resolve(),
      (prisma as any).userRewardUnlock?.deleteMany?.() || Promise.resolve(),
      (prisma as any).assetTagging?.deleteMany?.() || Promise.resolve(),
    ]);

    // Clean promotion and pricing
    await Promise.all([
      prisma.appliedPromotion.deleteMany(),
      prisma.promotion.deleteMany(),
      prisma.priceHistory.deleteMany(),
      prisma.price.deleteMany(),
      (prisma as any).bundleItem?.deleteMany?.() || Promise.resolve(),
      (prisma as any).bundle?.deleteMany?.() || Promise.resolve(),
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
      (prisma as any).chapterConstellation?.deleteMany?.() || Promise.resolve(),
    ]);

    // Finally clean chapters
    await prisma.chapter.deleteMany();

    // Clean remaining data
    await Promise.all([
      prisma.encryptedBlob.deleteMany(),
      prisma.refund.deleteMany(),
      (prisma as any).userConstellationProgress?.deleteMany?.() || Promise.resolve(),
      (prisma as any).userProgress?.deleteMany?.() || Promise.resolve(),
      (prisma as any).userRewardUnlock?.deleteMany?.() || Promise.resolve(),
      (prisma as any).rewardUnlock?.deleteMany?.() || Promise.resolve(),
      (prisma as any).badge?.deleteMany?.() || Promise.resolve(),
      (prisma as any).volumeConstellation?.deleteMany?.() || Promise.resolve(),
    ]);

    console.log("✅ Tables cleaned\n");

    // Step 1: Seed generated/test data
    await seedGeneratedData();
    console.log();

    // Step 2: Seed production data (from backup)
    await seedProductionData();
    console.log();

    // Step 3: Restore snapshot data if available
    await seedRestoreData();
    console.log();

    // Step 4: Create test promotions
    await seedTestPromotions();
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
