// Backup script for complete database export
// Usage: npx tsx prisma/scripts/backup-database.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ProductionData {
  chapters: any[];
  volumes: any[];
  volumeVersions: any[];
  versionAssets: any[];
  chapterAssets: any[];
  chapterGenreTags: any[];
  constellations: any[];
  chapterConstellations: any[];
  volumeConstellations: any[];
  badges: any[];
  rewardUnlocks: any[];
  bundles: any[];
  bundleItems: any[];
  priceSchemas: any[];
  chapterPriceOverrides: any[];
  prices: any[];
  priceHistory: any[];
  promotions: any[];
  appliedPromotions: any[];
  settings: any[];
  systemConfigs: any[];
  assetTags: any[];
  assetTagging: any[];
  users: any[];
  subscriptions: any[];
  encryptedBlobs: any[];
  webhookEvents: any[];
  orders: any[];
  refunds: any[];
  entitlements: any[];
  unlocks: any[];
  volumeReads: any[];
  chapterReviews: any[];
  userProgress: any[];
  userConstellationProgress: any[];
  userBadges: any[];
  userRewardUnlocks: any[];
  supportClaims: any[];
  customStoryRequests: any[];
  volumeProposals: any[];
}

async function backupDatabase() {
  try {
    console.log("📦 Starting complete database backup...\n");

    // Helper function to safely query tables that may not exist
    const safeQuery = async (query: Promise<any[]>): Promise<any[]> => {
      try {
        return await query;
      } catch (error: any) {
        if (error?.code === 'P2021') {
          return []; // Table doesn't exist, return empty array
        }
        throw error;
      }
    };

    // Export all data in parallel with error handling for missing tables
    const [
      chapters,
      volumes,
      volumeVersions,
      versionAssets,
      chapterAssets,
      chapterGenreTags,
      constellations,
      chapterConstellations,
      volumeConstellations,
      badges,
      rewardUnlocks,
      bundles,
      bundleItems,
      priceSchemas,
      chapterPriceOverrides,
      prices,
      priceHistory,
      promotions,
      appliedPromotions,
      settings,
      systemConfigs,
      assetTags,
      assetTagging,
      users,
      subscriptions,
      encryptedBlobs,
      webhookEvents,
      orders,
      refunds,
      entitlements,
      unlocks,
      volumeReads,
      chapterReviews,
      userProgress,
      userConstellationProgress,
      userBadges,
      userRewardUnlocks,
      supportClaims,
      customStoryRequests,
      volumeProposals,
    ] = await Promise.all([
      prisma.chapter.findMany(),
      prisma.volume.findMany(),
      prisma.volumeVersion.findMany(),
      prisma.versionAsset.findMany(),
      prisma.chapterAsset.findMany(),
      prisma.chapterGenreTag.findMany(),
      prisma.constellation.findMany(),
      prisma.chapterConstellation.findMany(),
      prisma.volumeConstellation.findMany(),
      prisma.badge.findMany(),
      prisma.rewardUnlock.findMany(),
      prisma.bundle.findMany(),
      prisma.bundleItem.findMany(),
      prisma.priceSchema.findMany(),
      prisma.chapterPriceOverride.findMany(),
      prisma.price.findMany(),
      prisma.priceHistory.findMany(),
      prisma.promotion.findMany(),
      prisma.appliedPromotion.findMany(),
      prisma.setting.findMany(),
      prisma.systemConfig.findMany(),
      prisma.assetTag.findMany(),
      prisma.assetTagging.findMany(),
      prisma.user.findMany(),
      prisma.subscription.findMany(),
      prisma.encryptedBlob.findMany(),
      prisma.webhookEvent.findMany(),
      prisma.order.findMany(),
      prisma.refund.findMany(),
      prisma.entitlement.findMany(),
      prisma.unlock.findMany(),
      prisma.volumeRead.findMany(),
      prisma.chapterReview.findMany(),
      prisma.userProgress.findMany(),
      prisma.userConstellationProgress.findMany(),
      prisma.userBadge.findMany(),
      prisma.userRewardUnlock.findMany(),
      prisma.supportClaim.findMany(),
      // Optional tables that may not exist yet
      safeQuery((prisma as any).customStoryRequest.findMany()),
      safeQuery((prisma as any).volumeProposal.findMany()),
    ]);

    const productionData: ProductionData = {
      chapters,
      volumes,
      volumeVersions,
      versionAssets,
      chapterAssets,
      chapterGenreTags,
      constellations,
      chapterConstellations,
      volumeConstellations,
      badges,
      rewardUnlocks,
      bundles,
      bundleItems,
      priceSchemas,
      chapterPriceOverrides,
      prices,
      priceHistory,
      promotions,
      appliedPromotions,
      settings,
      systemConfigs,
      assetTags,
      assetTagging,
      users,
      subscriptions,
      encryptedBlobs,
      webhookEvents,
      orders,
      refunds,
      entitlements,
      unlocks,
      volumeReads,
      chapterReviews,
      userProgress,
      userConstellationProgress,
      userBadges,
      userRewardUnlocks,
      supportClaims,
      customStoryRequests,
      volumeProposals,
    };

    // Create backup file - save to production-data_save.json
    const backupPath = path.join(
      __dirname,
      "../seeds/production-data_save.json"
    );

    // Ensure directory exists
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write backup with formatting for Git-friendly diffs
    // Custom replacer to handle BigInt
    const json = JSON.stringify(
      productionData,
      (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      },
      2
    );
    fs.writeFileSync(backupPath, json, "utf-8");

    console.log(`✅ Database backed up successfully`);
    console.log(`📁 Location: ${backupPath}\n`);
    console.log("📊 Backup Summary:");
    console.log(`   - Chapters: ${chapters.length}`);
    console.log(`   - Volumes: ${volumes.length}`);
    console.log(`   - Volume Versions: ${volumeVersions.length}`);
    console.log(`   - Chapter Assets: ${chapterAssets.length}`);
    console.log(`   - Version Assets: ${versionAssets.length}`);
    console.log(`   - Chapter Genre Tags: ${chapterGenreTags.length}`);
    console.log(`   - Constellations: ${constellations.length}`);
    console.log(`   - Chapter Constellations: ${chapterConstellations.length}`);
    console.log(`   - Volume Constellations: ${volumeConstellations.length}`);
    console.log(`   - Badges: ${badges.length}`);
    console.log(`   - Reward Unlocks: ${rewardUnlocks.length}`);
    console.log(`   - Bundles: ${bundles.length}`);
    console.log(`   - Bundle Items: ${bundleItems.length}`);
    console.log(`   - Price Schemas: ${priceSchemas.length}`);
    console.log(`   - Chapter Price Overrides: ${chapterPriceOverrides.length}`);
    console.log(`   - Prices: ${prices.length}`);
    console.log(`   - Price History: ${priceHistory.length}`);
    console.log(`   - Promotions: ${promotions.length}`);
    console.log(`   - Applied Promotions: ${appliedPromotions.length}`);
    console.log(`   - Settings: ${settings.length}`);
    console.log(`   - System Configs: ${systemConfigs.length}`);
    console.log(`   - Asset Tags: ${assetTags.length}`);
    console.log(`   - Asset Tagging: ${assetTagging.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);
    console.log(`   - Encrypted Blobs: ${encryptedBlobs.length}`);
    console.log(`   - Webhook Events: ${webhookEvents.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Refunds: ${refunds.length}`);
    console.log(`   - Entitlements: ${entitlements.length}`);
    console.log(`   - Unlocks: ${unlocks.length}`);
    console.log(`   - Volume Reads: ${volumeReads.length}`);
    console.log(`   - Chapter Reviews: ${chapterReviews.length}`);
    console.log(`   - User Progress: ${userProgress.length}`);
    console.log(`   - User Constellation Progress: ${userConstellationProgress.length}`);
    console.log(`   - User Badges: ${userBadges.length}`);
    console.log(`   - User Reward Unlocks: ${userRewardUnlocks.length}`);
    console.log(`   - Support Claims: ${supportClaims.length}`);
    console.log(`   - Custom Story Requests: ${customStoryRequests.length}`);
    console.log(`   - Volume Proposals: ${volumeProposals.length}`);
  } catch (error) {
    console.error("❌ Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();
