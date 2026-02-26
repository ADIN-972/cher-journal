/**
 * Script to fix POV entitlements that were created with wrong versionScope
 * Execution: npx tsx src/scripts/fix-pov-entitlements.ts
 */

import prisma from '../lib/prisma.js';

async function main() {
  console.log('\n🔧 Fixing POV entitlements with wrong versionScope...\n');

  try {
    // 1. Find all applied POV promotions
    const povPromotions = await prisma.appliedPromotion.findMany({
      where: {
        promotion: {
          type: 'FREE',
          scope: {
            in: ['POV', 'POV_CHAPTER', 'POV_VOLUME']
          }
        }
      },
      include: {
        promotion: true,
      }
    });

    console.log(`Found ${povPromotions.length} applied POV promotions`);

    let fixed = 0;
    let skipped = 0;

    // 2. For each POV promotion, check if entitlements have wrong versionScope
    for (const applied of povPromotions) {
      const { userId, promotion, appliedRefId } = applied;
      const refId = appliedRefId || promotion.refId;

      if (!refId) {
        console.log(`  ⚠ Skipping - no refId for promotion ${promotion.id}`);
        continue;
      }

      try {
        if (promotion.scope === 'POV_VOLUME' || promotion.scope === 'VOLUME') {
          const [chapterId, volumeNumberStr] = refId.split(':');
          const volumeNumber = parseInt(volumeNumberStr);

          // Find entitlements with wrong versionScope
          const wrongEntitlements = await prisma.entitlement.findMany({
            where: {
              userId,
              chapterId,
              volumeFrom: { lte: volumeNumber },
              volumeTo: { gte: volumeNumber },
              source: 'PROMOTION',
              versionScope: 'BASE' // Wrong scope for POV
            }
          });

          for (const ent of wrongEntitlements) {
            console.log(`  🔄 Updating entitlement ${ent.id}: BASE → ALL`);
            await prisma.entitlement.update({
              where: { id: ent.id },
              data: { versionScope: 'ALL' }
            });
            fixed++;
          }

          if (wrongEntitlements.length === 0) {
            console.log(`  ✓ Entitlements already correct for ${promotion.name}`);
            skipped++;
          }
        } else if (promotion.scope === 'POV_CHAPTER' || promotion.scope === 'CHAPTER') {
          // Find entitlements with wrong versionScope for chapter
          const wrongEntitlements = await prisma.entitlement.findMany({
            where: {
              userId,
              chapterId: refId,
              source: 'PROMOTION',
              versionScope: 'BASE' // Wrong scope for POV
            }
          });

          for (const ent of wrongEntitlements) {
            console.log(`  🔄 Updating entitlement ${ent.id}: BASE → ALL`);
            await prisma.entitlement.update({
              where: { id: ent.id },
              data: { versionScope: 'ALL' }
            });
            fixed++;
          }

          if (wrongEntitlements.length === 0) {
            console.log(`  ✓ Entitlements already correct for ${promotion.name}`);
            skipped++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing promotion ${promotion.id}:`, error);
      }
    }

    console.log('\n✅ Fix Complete!');
    console.log('═'.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   • Entitlements fixed: ${fixed}`);
    console.log(`   • Already correct: ${skipped}`);
    console.log(`   • Total processed: ${povPromotions.length}`);
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
