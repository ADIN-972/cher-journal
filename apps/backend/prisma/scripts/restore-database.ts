// Restore script for complete database import from backup
// Usage: npx tsx prisma/scripts/restore-database.ts
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

async function restoreDatabase() {
  try {
    console.log("📥 Starting database restore from backup...\n");

    // Support both backup file locations
    let backupPath = path.join(
      __dirname,
      "../seeds/production-data_save.json"
    );

    if (!fs.existsSync(backupPath)) {
      backupPath = path.join(
        __dirname,
        "../seeds/data/production-data.json"
      );
    }

    if (!fs.existsSync(backupPath)) {
      console.error(
        `❌ Backup file not found at either:\n   - ../seeds/production-data_save.json\n   - ../seeds/data/production-data.json`
      );
      process.exit(1);
    }

    console.log(`📁 Reading from: ${backupPath}\n`);
    const data: ProductionData = JSON.parse(
      fs.readFileSync(backupPath, "utf-8")
    );

    // Helper function to safely delete from tables that may not exist
    const safeDelete = async (promise: Promise<any>) => {
      try {
        return await promise;
      } catch (error: any) {
        if (error?.code === 'P2021') {
          return { count: 0 }; // Table doesn't exist, skip
        }
        throw error;
      }
    };

    // Clean related tables first (reverse FK order, without sessions/audit_logs)
    console.log("🧹 Cleaning database...");
    await Promise.all([
      safeDelete((prisma as any).volumeProposal.deleteMany?.() || Promise.resolve()),
      safeDelete((prisma as any).customStoryRequest.deleteMany?.() || Promise.resolve()),
      prisma.supportClaim.deleteMany(),
      prisma.appliedPromotion.deleteMany(),
      prisma.userRewardUnlock.deleteMany(),
      prisma.userBadge.deleteMany(),
      prisma.userConstellationProgress.deleteMany(),
      prisma.userProgress.deleteMany(),
      prisma.chapterReview.deleteMany(),
      prisma.volumeRead.deleteMany(),
      prisma.unlock.deleteMany(),
      prisma.entitlement.deleteMany(),
      prisma.refund.deleteMany(),
      prisma.order.deleteMany(),
      prisma.subscription.deleteMany(),
      prisma.priceHistory.deleteMany(),
      prisma.promotion.deleteMany(),
      prisma.price.deleteMany(),
      prisma.bundleItem.deleteMany(),
      prisma.bundle.deleteMany(),
      prisma.assetTagging.deleteMany(),
      prisma.volumeConstellation.deleteMany(),
      prisma.versionAsset.deleteMany(),
      prisma.volumeVersion.deleteMany(),
      prisma.volume.deleteMany(),
      prisma.chapterPriceOverride.deleteMany(),
      prisma.chapterConstellation.deleteMany(),
      prisma.chapterAsset.deleteMany(),
      prisma.chapterGenreTag.deleteMany(),
      prisma.rewardUnlock.deleteMany(),
      prisma.badge.deleteMany(),
      prisma.user.deleteMany(),
      prisma.priceSchema.deleteMany(),
      prisma.assetTag.deleteMany(),
      prisma.systemConfig.deleteMany(),
      prisma.setting.deleteMany(),
      prisma.webhookEvent.deleteMany(),
      prisma.constellation.deleteMany(),
      prisma.encryptedBlob.deleteMany(),
      prisma.chapter.deleteMany(),
    ]);
    console.log("✓ All tables cleaned\n");

    // Restore in FK order
    console.log("📥 Restoring data...\n");

    // 1. Tables with no FK dependencies
    if (data.encryptedBlobs?.length > 0) {
      console.log(`   🔐 Restoring ${data.encryptedBlobs.length} encrypted blobs...`);
      for (const blob of data.encryptedBlobs) {
        await prisma.encryptedBlob.create({ data: blob });
      }
    }

    if (data.users?.length > 0) {
      console.log(`   👤 Restoring ${data.users.length} users...`);
      for (const user of data.users) {
        await prisma.user.create({ data: user });
      }
    }

    // 2. Create chapters without coverAssetId (circular FK issue)
    if (data.chapters?.length > 0) {
      console.log(`   📖 Restoring ${data.chapters.length} chapters...`);
      const chaptersWithoutCover = data.chapters.map(ch => {
        const { coverAssetId, ...rest } = ch;
        return rest;
      });
      for (const chapter of chaptersWithoutCover) {
        await prisma.chapter.create({ data: chapter });
      }
    }

    // 3. Config tables
    if (data.constellations?.length > 0) {
      console.log(`   ⭐ Restoring ${data.constellations.length} constellations...`);
      for (const c of data.constellations) {
        await prisma.constellation.create({ data: c });
      }
    }

    if (data.settings?.length > 0) {
      console.log(`   ⚙️ Restoring ${data.settings.length} settings...`);
      for (const s of data.settings) {
        await prisma.setting.create({ data: s });
      }
    }

    if (data.systemConfigs?.length > 0) {
      console.log(`   🔧 Restoring ${data.systemConfigs.length} system configs...`);
      for (const sc of data.systemConfigs) {
        await prisma.systemConfig.create({ data: sc });
      }
    }

    if (data.assetTags?.length > 0) {
      console.log(`   🏷️  Restoring ${data.assetTags.length} asset tags...`);
      for (const tag of data.assetTags) {
        await prisma.assetTag.create({ data: tag });
      }
    }

    if (data.priceSchemas?.length > 0) {
      console.log(`   💰 Restoring ${data.priceSchemas.length} price schemas...`);
      for (const schema of data.priceSchemas) {
        await prisma.priceSchema.create({ data: schema });
      }
    }

    if (data.webhookEvents?.length > 0) {
      console.log(`   🔔 Restoring ${data.webhookEvents.length} webhook events...`);
      for (const event of data.webhookEvents) {
        await prisma.webhookEvent.create({ data: event });
      }
    }

    if (data.badges?.length > 0) {
      console.log(`   🎖️  Restoring ${data.badges.length} badges...`);
      for (const badge of data.badges) {
        await prisma.badge.create({ data: badge });
      }
    }

    // 4. Chapter-related
    if (data.chapterGenreTags?.length > 0) {
      console.log(`   🏷️  Restoring ${data.chapterGenreTags.length} genre tags...`);
      for (const tag of data.chapterGenreTags) {
        await prisma.chapterGenreTag.create({ data: tag });
      }
    }

    if (data.chapterAssets?.length > 0) {
      console.log(`   🖼️  Restoring ${data.chapterAssets.length} chapter assets...`);
      for (const asset of data.chapterAssets) {
        await prisma.chapterAsset.create({ data: asset });
      }
    }

    if (data.chapterConstellations?.length > 0) {
      console.log(`   🌟 Restoring ${data.chapterConstellations.length} chapter constellations...`);
      for (const cc of data.chapterConstellations) {
        await prisma.chapterConstellation.create({ data: cc });
      }
    }

    if (data.chapterPriceOverrides?.length > 0) {
      console.log(`   💵 Restoring ${data.chapterPriceOverrides.length} chapter price overrides...`);
      for (const override of data.chapterPriceOverrides) {
        await prisma.chapterPriceOverride.create({ data: override });
      }
    }

    // 5. Update chapters with coverAssetId
    if (data.chapters?.length > 0) {
      const chaptersWithCover = data.chapters.filter(ch => ch.coverAssetId);
      if (chaptersWithCover.length > 0) {
        console.log(`   🖼️  Updating ${chaptersWithCover.length} chapter cover images...`);
        for (const chapter of chaptersWithCover) {
          await prisma.chapter.update({
            where: { id: chapter.id },
            data: { coverAssetId: chapter.coverAssetId }
          });
        }
      }
    }

    // 6. Volumes
    if (data.volumes?.length > 0) {
      console.log(`   📚 Restoring ${data.volumes.length} volumes...`);
      for (const volume of data.volumes) {
        await prisma.volume.create({ data: volume });
      }
    }

    if (data.volumeVersions?.length > 0) {
      console.log(`   📖 Restoring ${data.volumeVersions.length} volume versions...`);
      for (const version of data.volumeVersions) {
        await prisma.volumeVersion.create({ data: version });
      }
    }

    if (data.versionAssets?.length > 0) {
      console.log(`   🎨 Restoring ${data.versionAssets.length} version assets...`);
      for (const asset of data.versionAssets) {
        await prisma.versionAsset.create({ data: asset });
      }
    }

    if (data.volumeConstellations?.length > 0) {
      console.log(`   🌠 Restoring ${data.volumeConstellations.length} volume constellations...`);
      for (const vc of data.volumeConstellations) {
        await prisma.volumeConstellation.create({ data: vc });
      }
    }

    if (data.assetTagging?.length > 0) {
      console.log(`   🏷️  Restoring ${data.assetTagging.length} asset tagging...`);
      for (const tagging of data.assetTagging) {
        await prisma.assetTagging.create({ data: tagging });
      }
    }

    // 7. Bundles
    if (data.bundles?.length > 0) {
      console.log(`   📦 Restoring ${data.bundles.length} bundles...`);
      for (const bundle of data.bundles) {
        await prisma.bundle.create({ data: bundle });
      }
    }

    if (data.bundleItems?.length > 0) {
      console.log(`   📋 Restoring ${data.bundleItems.length} bundle items...`);
      for (const item of data.bundleItems) {
        await prisma.bundleItem.create({ data: item });
      }
    }

    // 8. Pricing
    if (data.prices?.length > 0) {
      console.log(`   💲 Restoring ${data.prices.length} prices...`);
      for (const price of data.prices) {
        await prisma.price.create({ data: price });
      }
    }

    if (data.priceHistory?.length > 0) {
      console.log(`   📊 Restoring ${data.priceHistory.length} price history entries...`);
      for (const history of data.priceHistory) {
        await prisma.priceHistory.create({ data: history });
      }
    }

    if (data.promotions?.length > 0) {
      console.log(`   🎁 Restoring ${data.promotions.length} promotions...`);
      for (const promo of data.promotions) {
        await prisma.promotion.create({ data: promo });
      }
    }

    if (data.rewardUnlocks?.length > 0) {
      console.log(`   🏆 Restoring ${data.rewardUnlocks.length} reward unlocks...`);
      for (const reward of data.rewardUnlocks) {
        await prisma.rewardUnlock.create({ data: reward });
      }
    }

    // 9. User data
    if (data.subscriptions?.length > 0) {
      console.log(`   🔄 Restoring ${data.subscriptions.length} subscriptions...`);
      for (const sub of data.subscriptions) {
        await prisma.subscription.create({ data: sub });
      }
    }

    if (data.orders?.length > 0) {
      console.log(`   🛒 Restoring ${data.orders.length} orders...`);
      for (const order of data.orders) {
        await prisma.order.create({ data: order });
      }
    }

    if (data.refunds?.length > 0) {
      console.log(`   💸 Restoring ${data.refunds.length} refunds...`);
      for (const refund of data.refunds) {
        await prisma.refund.create({ data: refund });
      }
    }

    if (data.entitlements?.length > 0) {
      console.log(`   🔑 Restoring ${data.entitlements.length} entitlements...`);
      for (const ent of data.entitlements) {
        await prisma.entitlement.create({ data: ent });
      }
    }

    if (data.unlocks?.length > 0) {
      console.log(`   🔓 Restoring ${data.unlocks.length} unlocks...`);
      for (const unlock of data.unlocks) {
        await prisma.unlock.create({ data: unlock });
      }
    }

    if (data.volumeReads?.length > 0) {
      console.log(`   📖 Restoring ${data.volumeReads.length} volume reads...`);
      for (const read of data.volumeReads) {
        await prisma.volumeRead.create({ data: read });
      }
    }

    if (data.chapterReviews?.length > 0) {
      console.log(`   ⭐ Restoring ${data.chapterReviews.length} chapter reviews...`);
      for (const review of data.chapterReviews) {
        await prisma.chapterReview.create({ data: review });
      }
    }

    if (data.userProgress?.length > 0) {
      console.log(`   📈 Restoring ${data.userProgress.length} user progress...`);
      for (const progress of data.userProgress) {
        await prisma.userProgress.create({ data: progress });
      }
    }

    if (data.userConstellationProgress?.length > 0) {
      console.log(`   ⭐ Restoring ${data.userConstellationProgress.length} user constellation progress...`);
      for (const prog of data.userConstellationProgress) {
        await prisma.userConstellationProgress.create({ data: prog });
      }
    }

    if (data.userBadges?.length > 0) {
      console.log(`   🎖️  Restoring ${data.userBadges.length} user badges...`);
      for (const badge of data.userBadges) {
        await prisma.userBadge.create({ data: badge });
      }
    }

    if (data.userRewardUnlocks?.length > 0) {
      console.log(`   🏆 Restoring ${data.userRewardUnlocks.length} user reward unlocks...`);
      for (const unlock of data.userRewardUnlocks) {
        await prisma.userRewardUnlock.create({ data: unlock });
      }
    }

    if (data.appliedPromotions?.length > 0) {
      console.log(`   💝 Restoring ${data.appliedPromotions.length} applied promotions...`);
      for (const applied of data.appliedPromotions) {
        await prisma.appliedPromotion.create({ data: applied });
      }
    }

    if (data.supportClaims?.length > 0) {
      console.log(`   💬 Restoring ${data.supportClaims.length} support claims...`);
      for (const claim of data.supportClaims) {
        await prisma.supportClaim.create({ data: claim });
      }
    }

    if (data.customStoryRequests?.length > 0) {
      console.log(`   ✍️  Restoring ${data.customStoryRequests.length} custom story requests...`);
      for (const request of data.customStoryRequests) {
        await prisma.customStoryRequest.create({ data: request });
      }
    }

    if (data.volumeProposals?.length > 0) {
      console.log(`   📝 Restoring ${data.volumeProposals.length} volume proposals...`);
      for (const proposal of data.volumeProposals) {
        await prisma.volumeProposal.create({ data: proposal });
      }
    }

    console.log("\n✅ Database restored successfully from backup!");
  } catch (error) {
    console.error("❌ Restore failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreDatabase();
