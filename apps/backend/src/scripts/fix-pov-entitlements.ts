/**
 * Script to fix POV entitlements that were created without POV scope
 * OR were never created because an existing BASE entitlement blocked creation.
 *
 * Root cause of the original bug:
 *   createEntitlementsFromPromotion() used findFirst({ where: { userId, chapterId } })
 *   without filtering by scope, so an existing BASE entitlement caused it to
 *   skip creating the POV entitlement for POV promotions.
 *
 * This script handles both cases:
 *   1. POV entitlement missing entirely → create it with scopes: ['BASE', 'POV']
 *   2. Entitlement exists but lacks 'POV' scope → update scopes to include 'POV'
 *   3. Entitlement exists but volumeTo is too small → update volumeTo to 9999
 *
 * Execution: npx tsx src/scripts/fix-pov-entitlements.ts
 */

import prisma from '../lib/prisma.js';

async function main() {
  console.log('\n🔧 Fixing POV entitlements (missing POV scope)...\n');

  try {
    // 1. Find all applied POV FREE promotions
    const povPromotions = await prisma.appliedPromotion.findMany({
      where: {
        promotion: {
          type: 'FREE',
          scope: {
            in: ['POV', 'POV_CHAPTER', 'POV_VOLUME'],
          },
        },
      },
      include: {
        promotion: true,
      },
    });

    console.log(`Found ${povPromotions.length} applied POV FREE promotions\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const applied of povPromotions) {
      const { userId, promotion, appliedRefId } = applied;
      const refId = appliedRefId || promotion.refId;

      if (!refId) {
        console.log(`  ⚠ Skipping - no refId for promotion ${promotion.id} (${promotion.name})`);
        continue;
      }

      try {
        if (promotion.scope === 'POV_VOLUME') {
          // refId format: "chapterId:volumeNumber"
          if (!refId.includes(':')) {
            console.log(`  ⚠ POV_VOLUME refId missing volume number: ${refId}`);
            continue;
          }
          const [chapterId, volumeNumberStr] = refId.split(':');
          const volumeNumber = parseInt(volumeNumberStr);

          if (isNaN(volumeNumber)) {
            console.log(`  ⚠ Invalid volume number in refId: ${refId}`);
            continue;
          }

          // Check if a valid POV entitlement already exists for this volume range
          const povEntitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              chapterId,
              volumeFrom: { lte: volumeNumber },
              volumeTo: { gte: volumeNumber },
              scopes: { has: 'POV' },
            },
          });

          if (!povEntitlement) {
            // Check if a BASE-only entitlement exists to upgrade
            const baseEntitlement = await prisma.entitlement.findFirst({
              where: {
                userId,
                chapterId,
                volumeFrom: { lte: volumeNumber },
                volumeTo: { gte: volumeNumber },
                source: 'PROMOTION',
              },
            });

            if (baseEntitlement) {
              // Upgrade existing entitlement to include POV scope
              const updatedScopes = [...new Set([...baseEntitlement.scopes, 'BASE', 'POV'])];
              console.log(
                `  🔄 Updating entitlement to include POV scope for userId=${userId}, chapter=${chapterId}, vol=${volumeNumber}`
              );
              await prisma.entitlement.update({
                where: { id: baseEntitlement.id },
                data: { scopes: updatedScopes },
              });
              updated++;
            } else {
              // Create missing POV entitlement from scratch
              console.log(
                `  ➕ Creating POV entitlement for userId=${userId}, chapter=${chapterId}, vol=${volumeNumber}`
              );
              await prisma.entitlement.create({
                data: {
                  userId,
                  chapterId,
                  volumeFrom: volumeNumber,
                  volumeTo: volumeNumber,
                  source: 'PROMOTION',
                  scopes: ['BASE', 'POV'],
                },
              });
              created++;
            }
          } else {
            console.log(`  ✓ POV entitlement already correct for userId=${userId}, chapter=${chapterId}, vol=${volumeNumber}`);
            skipped++;
          }
        } else if (promotion.scope === 'POV_CHAPTER' || promotion.scope === 'POV') {
          // refId is the chapterId
          const chapterId = refId;

          // Get the min volume for this chapter
          const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
              volumes: {
                orderBy: { volumeNumber: 'asc' },
                select: { volumeNumber: true },
                take: 1,
              },
            },
          });

          if (!chapter || chapter.volumes.length === 0) {
            console.log(`  ⚠ Chapter not found or no volumes: ${chapterId}`);
            continue;
          }

          const minVolume = chapter.volumes[0].volumeNumber;
          const UNLIMITED_VOLUME = 9999;

          // Check if a valid POV entitlement exists covering from minVolume to 9999
          const fullPovEntitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              chapterId,
              scopes: { has: 'POV' },
              volumeFrom: { lte: minVolume },
              volumeTo: { gte: UNLIMITED_VOLUME },
            },
          });

          if (fullPovEntitlement) {
            console.log(`  ✓ POV entitlement already correct for userId=${userId}, chapter=${chapterId}`);
            skipped++;
            continue;
          }

          // Check if a partial POV entitlement exists (has POV but volumeTo too small)
          const partialPovEntitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              chapterId,
              scopes: { has: 'POV' },
            },
          });

          if (partialPovEntitlement) {
            // Update volumeTo to cover all future volumes
            console.log(
              `  🔄 Updating POV entitlement volumeTo: ${partialPovEntitlement.volumeTo} → ${UNLIMITED_VOLUME} for userId=${userId}, chapter=${chapterId}`
            );
            await prisma.entitlement.update({
              where: { id: partialPovEntitlement.id },
              data: { volumeTo: UNLIMITED_VOLUME },
            });
            updated++;
            continue;
          }

          // Check if a PROMOTION entitlement exists to upgrade (BASE-only)
          const baseEntitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              chapterId,
              source: 'PROMOTION',
            },
          });

          if (baseEntitlement) {
            // Upgrade to include POV scope and extend volumeTo
            const updatedScopes = [...new Set([...baseEntitlement.scopes, 'BASE', 'POV'])];
            console.log(
              `  🔄 Upgrading entitlement to POV scope + volumeTo=${UNLIMITED_VOLUME} for userId=${userId}, chapter=${chapterId}`
            );
            await prisma.entitlement.update({
              where: { id: baseEntitlement.id },
              data: { scopes: updatedScopes, volumeTo: UNLIMITED_VOLUME },
            });
            updated++;
          } else {
            // Create missing POV entitlement from scratch
            console.log(
              `  ➕ Creating POV entitlement for userId=${userId}, chapter=${chapterId}, volumes ${minVolume}-${UNLIMITED_VOLUME}`
            );
            await prisma.entitlement.create({
              data: {
                userId,
                chapterId,
                volumeFrom: minVolume,
                volumeTo: UNLIMITED_VOLUME,
                source: 'PROMOTION',
                scopes: ['BASE', 'POV'],
              },
            });
            created++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing promotion ${promotion.id} (${promotion.name}):`, error);
      }
    }

    console.log('\n✅ Fix Complete!');
    console.log('═'.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   • Entitlements created (missing):           ${created}`);
    console.log(`   • Entitlements updated (upgraded to POV):   ${updated}`);
    console.log(`   • Already correct (skipped):                ${skipped}`);
    console.log(`   • Total promotions processed:               ${povPromotions.length}`);
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
