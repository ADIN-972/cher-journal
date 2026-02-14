import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RestoreData {
  metadata: {
    exportedAt: string;
    tables: Record<string, number>;
  };
  data: {
    users: any[];
    sessions: any[];
    chapters: any[];
    volumes: any[];
    volumeVersions: any[];
    versionAssets: any[];
    chapterAssets: any[];
    chapterGenreTags: any[];
    orders: any[];
    refunds: any[];
    entitlements: any[];
    unlocks: any[];
    volumeReads: any[];
    chapterReviews: any[];
    encryptedBlobs: any[];
    webhookEvents: any[];
    settings: any[];
    prices: any[];
    priceHistory: any[];
    promotions: any[];
    appliedPromotions: any[];
    priceSchemas: any[];
    chapterPriceOverrides: any[];
    auditLogs: any[];
    systemConfigs: any[];
    assetTags: any[];
    assetTagging: any[];
    bundles: any[];
    bundleItems: any[];
    constellations: any[];
    chapterConstellations: any[];
    volumeConstellations: any[];
    badges: any[];
    userBadges: any[];
    userProgress: any[];
    userConstellationProgress: any[];
    rewardUnlocks: any[];
    userRewardUnlocks: any[];
  };
}

/**
 * Restore seed - loads all data from restore-data.json
 * This allows you to export current database state and restore it later
 *
 * Order of restoration matters due to foreign key constraints!
 */
export async function seedRestoreData() {
  try {
    console.log("📥 Starting database restore from JSON...");

    const dataPath = path.join(__dirname, "./data/restore-data.json");

    if (!fs.existsSync(dataPath)) {
      console.warn(`⚠️  Restore data file not found at ${dataPath}`);
      console.warn("   Skipping restore seed (this is normal on fresh setup)");
      return;
    }

    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const restoreData: RestoreData = JSON.parse(fileContent);

    console.log(
      `\n📊 Loaded restore data from ${path.basename(dataPath)}`
    );
    console.log(`   Exported at: ${restoreData.metadata.exportedAt}`);
    console.log(
      `   Total records: ${Object.values(restoreData.metadata.tables).reduce((a, b) => a + b, 0)}\n`
    );

    // Helper function to safely restore data with error handling
    const restoreTable = async (
      tableName: string,
      records: any[],
      createFn: (data: any) => Promise<any>
    ) => {
      if (!records || records.length === 0) return;

      let successCount = 0;
      let skipCount = 0;

      for (const record of records) {
        try {
          await createFn(record);
          successCount++;
        } catch (error: any) {
          // Skip duplicate key errors
          if (error.code === "P2002" || error.message?.includes("Unique")) {
            skipCount++;
          } else {
            console.error(`   ❌ Error restoring ${tableName}:`, error.message);
          }
        }
      }

      if (successCount > 0) {
        console.log(
          `   ✓ ${tableName}: ${successCount} restored${skipCount > 0 ? ` (${skipCount} skipped)` : ""}`
        );
      }
    };

    // Restoration order matters! Start with tables that have no dependencies
    console.log("🔄 Restoring tables in order...\n");

    // 1. Independent tables (no foreign keys)
    await restoreTable("settings", restoreData.data.settings, async (data) =>
      prisma.setting.create({ data })
    );

    await restoreTable("assetTags", restoreData.data.assetTags, async (data) =>
      (prisma as any).assetTag.create({ data })
    );

    await restoreTable(
      "webhookEvents",
      restoreData.data.webhookEvents,
      async (data) => prisma.webhookEvent.create({ data })
    );

    await restoreTable(
      "constellations",
      restoreData.data.constellations,
      async (data) => (prisma as any).constellation.create({ data })
    );

    // 2. Users and sessions
    await restoreTable("users", restoreData.data.users, async (data) =>
      prisma.user.create({ data })
    );

    await restoreTable("sessions", restoreData.data.sessions, async (data) =>
      prisma.session.create({ data })
    );

    // 3. Chapters and chapter assets
    await restoreTable("chapters", restoreData.data.chapters, async (data) =>
      prisma.chapter.create({ data })
    );

    await restoreTable(
      "chapterAssets",
      restoreData.data.chapterAssets,
      async (data) => prisma.chapterAsset.create({ data })
    );

    await restoreTable(
      "chapterGenreTags",
      restoreData.data.chapterGenreTags,
      async (data) => prisma.chapterGenreTag.create({ data })
    );

    // 4. Pricing data
    await restoreTable("prices", restoreData.data.prices, async (data) =>
      prisma.price.create({ data })
    );

    await restoreTable(
      "priceHistory",
      restoreData.data.priceHistory,
      async (data) => prisma.priceHistory.create({ data })
    );

    await restoreTable(
      "priceSchemas",
      restoreData.data.priceSchemas,
      async (data) => prisma.priceSchema.create({ data })
    );

    // 5. Volumes and versions
    await restoreTable("volumes", restoreData.data.volumes, async (data) =>
      prisma.volume.create({ data })
    );

    await restoreTable(
      "volumeVersions",
      restoreData.data.volumeVersions,
      async (data) => prisma.volumeVersion.create({ data })
    );

    // 6. Encrypted blobs
    await restoreTable(
      "encryptedBlobs",
      restoreData.data.encryptedBlobs,
      async (data) => {
        // Convert string representations back to Buffer
        if (data.cipherText && typeof data.cipherText === "string") {
          data.cipherText = Buffer.from(data.cipherText, "base64");
        }
        if (data.iv && typeof data.iv === "string") {
          data.iv = Buffer.from(data.iv, "base64");
        }
        if (data.tag && typeof data.tag === "string") {
          data.tag = Buffer.from(data.tag, "base64");
        }
        if (data.wrappedDek && typeof data.wrappedDek === "string") {
          data.wrappedDek = Buffer.from(data.wrappedDek, "base64");
        }
        return prisma.encryptedBlob.create({ data });
      }
    );

    // 7. Assets and tags
    await restoreTable(
      "assetTagging",
      restoreData.data.assetTagging,
      async (data) => (prisma as any).assetTagging.create({ data })
    );

    await restoreTable(
      "versionAssets",
      restoreData.data.versionAssets,
      async (data) => prisma.versionAsset.create({ data })
    );

    // 8. Bundles
    await restoreTable("bundles", restoreData.data.bundles, async (data) =>
      (prisma as any).bundle.create({ data })
    );

    await restoreTable(
      "bundleItems",
      restoreData.data.bundleItems,
      async (data) => (prisma as any).bundleItem.create({ data })
    );

    // 9. Orders and refunds
    await restoreTable("orders", restoreData.data.orders, async (data) =>
      prisma.order.create({ data })
    );

    await restoreTable("refunds", restoreData.data.refunds, async (data) =>
      prisma.refund.create({ data })
    );

    // 10. Promotions
    await restoreTable(
      "promotions",
      restoreData.data.promotions,
      async (data) => prisma.promotion.create({ data })
    );

    await restoreTable(
      "appliedPromotions",
      restoreData.data.appliedPromotions,
      async (data) => prisma.appliedPromotion.create({ data })
    );

    await restoreTable(
      "chapterPriceOverrides",
      restoreData.data.chapterPriceOverrides,
      async (data) => prisma.chapterPriceOverride.create({ data })
    );

    // 11. User data
    await restoreTable(
      "entitlements",
      restoreData.data.entitlements,
      async (data) => prisma.entitlement.create({ data })
    );

    await restoreTable("unlocks", restoreData.data.unlocks, async (data) =>
      prisma.unlock.create({ data })
    );

    await restoreTable(
      "volumeReads",
      restoreData.data.volumeReads,
      async (data) => prisma.volumeRead.create({ data })
    );

    await restoreTable(
      "chapterReviews",
      restoreData.data.chapterReviews,
      async (data) => prisma.chapterReview.create({ data })
    );

    // 12. Badges and progression
    await restoreTable("badges", restoreData.data.badges, async (data) =>
      (prisma as any).badge.create({ data })
    );

    await restoreTable(
      "userBadges",
      restoreData.data.userBadges,
      async (data) => (prisma as any).userBadge.create({ data })
    );

    await restoreTable(
      "userProgress",
      restoreData.data.userProgress,
      async (data) => (prisma as any).userProgress.create({ data })
    );

    await restoreTable(
      "chapterConstellations",
      restoreData.data.chapterConstellations,
      async (data) => (prisma as any).chapterConstellation.create({ data })
    );

    await restoreTable(
      "volumeConstellations",
      restoreData.data.volumeConstellations,
      async (data) => (prisma as any).volumeConstellation.create({ data })
    );

    await restoreTable(
      "userConstellationProgress",
      restoreData.data.userConstellationProgress,
      async (data) => (prisma as any).userConstellationProgress.create({ data })
    );

    // 13. Rewards
    await restoreTable(
      "rewardUnlocks",
      restoreData.data.rewardUnlocks,
      async (data) => (prisma as any).rewardUnlock.create({ data })
    );

    await restoreTable(
      "userRewardUnlocks",
      restoreData.data.userRewardUnlocks,
      async (data) => (prisma as any).userRewardUnlock.create({ data })
    );

    // 14. Audit logs and system configs
    await restoreTable(
      "auditLogs",
      restoreData.data.auditLogs,
      async (data) => prisma.auditLog.create({ data })
    );

    await restoreTable(
      "systemConfigs",
      restoreData.data.systemConfigs,
      async (data) => prisma.systemConfig.create({ data })
    );

    console.log("\n✅ Database restore completed!");
  } catch (error) {
    console.error("❌ Restore failed:", error);
    throw error;
  }
}
