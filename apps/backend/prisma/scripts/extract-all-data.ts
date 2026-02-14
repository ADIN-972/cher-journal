import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Complete database export script
 * Extracts all data from all tables into a JSON file for easy backup and restore
 * Usage: npx ts-node prisma/scripts/extract-all-data.ts
 */

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

async function extractAllData() {
  try {
    console.log("📦 Starting complete database export...\n");

    // Extract all data from all tables
    const [
      users,
      sessions,
      chapters,
      volumes,
      volumeVersions,
      versionAssets,
      chapterAssets,
      chapterGenreTags,
      orders,
      refunds,
      entitlements,
      unlocks,
      volumeReads,
      chapterReviews,
      encryptedBlobs,
      webhookEvents,
      settings,
      prices,
      priceHistory,
      promotions,
      appliedPromotions,
      priceSchemas,
      chapterPriceOverrides,
      auditLogs,
      systemConfigs,
      assetTags,
      assetTagging,
      bundles,
      bundleItems,
      constellations,
      chapterConstellations,
      volumeConstellations,
      badges,
      userBadges,
      userProgress,
      userConstellationProgress,
      rewardUnlocks,
      userRewardUnlocks,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.session.findMany(),
      prisma.chapter.findMany(),
      prisma.volume.findMany(),
      prisma.volumeVersion.findMany(),
      prisma.versionAsset.findMany(),
      prisma.chapterAsset.findMany(),
      prisma.chapterGenreTag.findMany(),
      prisma.order.findMany(),
      prisma.refund.findMany(),
      prisma.entitlement.findMany(),
      prisma.unlock.findMany(),
      prisma.volumeRead.findMany(),
      prisma.chapterReview.findMany(),
      prisma.encryptedBlob.findMany(),
      prisma.webhookEvent.findMany(),
      prisma.setting.findMany(),
      prisma.price.findMany(),
      prisma.priceHistory.findMany(),
      prisma.promotion.findMany(),
      prisma.appliedPromotion.findMany(),
      prisma.priceSchema.findMany(),
      prisma.chapterPriceOverride.findMany(),
      prisma.auditLog.findMany(),
      prisma.systemConfig.findMany(),
      (prisma as any).assetTag?.findMany?.() || [],
      (prisma as any).assetTagging?.findMany?.() || [],
      (prisma as any).bundle?.findMany?.() || [],
      (prisma as any).bundleItem?.findMany?.() || [],
      (prisma as any).constellation?.findMany?.() || [],
      (prisma as any).chapterConstellation?.findMany?.() || [],
      (prisma as any).volumeConstellation?.findMany?.() || [],
      (prisma as any).badge?.findMany?.() || [],
      (prisma as any).userBadge?.findMany?.() || [],
      (prisma as any).userProgress?.findMany?.() || [],
      (prisma as any).userConstellationProgress?.findMany?.() || [],
      (prisma as any).rewardUnlock?.findMany?.() || [],
      (prisma as any).userRewardUnlock?.findMany?.() || [],
    ]);

    const restoreData: RestoreData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        tables: {
          users: users.length,
          sessions: sessions.length,
          chapters: chapters.length,
          volumes: volumes.length,
          volumeVersions: volumeVersions.length,
          versionAssets: versionAssets.length,
          chapterAssets: chapterAssets.length,
          chapterGenreTags: chapterGenreTags.length,
          orders: orders.length,
          refunds: refunds.length,
          entitlements: entitlements.length,
          unlocks: unlocks.length,
          volumeReads: volumeReads.length,
          chapterReviews: chapterReviews.length,
          encryptedBlobs: encryptedBlobs.length,
          webhookEvents: webhookEvents.length,
          settings: settings.length,
          prices: prices.length,
          priceHistory: priceHistory.length,
          promotions: promotions.length,
          appliedPromotions: appliedPromotions.length,
          priceSchemas: priceSchemas.length,
          chapterPriceOverrides: chapterPriceOverrides.length,
          auditLogs: auditLogs.length,
          systemConfigs: systemConfigs.length,
          assetTags: assetTags.length,
          assetTagging: assetTagging.length,
          bundles: bundles.length,
          bundleItems: bundleItems.length,
          constellations: constellations.length,
          chapterConstellations: chapterConstellations.length,
          volumeConstellations: volumeConstellations.length,
          badges: badges.length,
          userBadges: userBadges.length,
          userProgress: userProgress.length,
          userConstellationProgress: userConstellationProgress.length,
          rewardUnlocks: rewardUnlocks.length,
          userRewardUnlocks: userRewardUnlocks.length,
        },
      },
      data: {
        users,
        sessions,
        chapters,
        volumes,
        volumeVersions,
        versionAssets,
        chapterAssets,
        chapterGenreTags,
        orders,
        refunds,
        entitlements,
        unlocks,
        volumeReads,
        chapterReviews,
        encryptedBlobs,
        webhookEvents,
        settings,
        prices,
        priceHistory,
        promotions,
        appliedPromotions,
        priceSchemas,
        chapterPriceOverrides,
        auditLogs,
        systemConfigs,
        assetTags,
        assetTagging,
        bundles,
        bundleItems,
        constellations,
        chapterConstellations,
        volumeConstellations,
        badges,
        userBadges,
        userProgress,
        userConstellationProgress,
        rewardUnlocks,
        userRewardUnlocks,
      },
    };

    // Create backup file
    const backupPath = path.join(__dirname, "../seeds/data/restore-data.json");

    // Ensure directory exists
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write backup with formatting for Git-friendly diffs
    const json = JSON.stringify(
      restoreData,
      (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      },
      2
    );
    fs.writeFileSync(backupPath, json, "utf-8");

    console.log("✅ Database exported successfully");
    console.log(`📁 Location: ${backupPath}\n`);
    console.log("📊 Export Summary:");
    Object.entries(restoreData.metadata.tables).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ✓ ${table}: ${count}`);
      }
    });
    console.log();
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

extractAllData();
