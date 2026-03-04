/**
 * Script de correction pour le compte chapter.collector@example.com
 * Vérifie et crée les entitlements manquants pour les promotions FREE appliquées
 */

import prisma from '../lib/prisma.js';

async function fixChapterCollectorPromotions() {
  const email = 'chapter.collector@example.com';

  console.log(`\n[Promotion Fix] Starting fix for ${email}\n`);

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`✓ Found user: ${user.id} (${user.firstName} ${user.lastName})`);

  // 2. Get all applied FREE promotions for this user
  const appliedFreePromotions = await prisma.appliedPromotion.findMany({
    where: {
      userId: user.id,
      promotion: {
        type: 'FREE',
      },
    },
    include: {
      promotion: true,
    },
  });

  console.log(`\n✓ Found ${appliedFreePromotions.length} applied FREE promotions:`);
  appliedFreePromotions.forEach((ap) => {
    console.log(`  - ${ap.promotion.name} (${ap.promotion.scope}) refId: ${ap.promotion.refId || ap.appliedRefId}`);
  });

  if (appliedFreePromotions.length === 0) {
    console.log('\n✓ No FREE promotions found for this user');
    process.exit(0);
  }

  // 3. For each promotion, check if entitlement exists and create if needed
  let created = 0;
  let alreadyExists = 0;

  for (const applied of appliedFreePromotions) {
    const { promotion, appliedRefId } = applied;
    const refId = appliedRefId || promotion.refId;

    if (!refId) {
      console.log(`\n⚠ Skipping ${promotion.name} - no refId`);
      continue;
    }

    console.log(`\n📋 Processing: ${promotion.name}`);

    if (promotion.scope === 'VOLUME') {
      const [chapterId, volumeNumberStr] = refId.split(':');
      const volumeNumber = parseInt(volumeNumberStr);

      console.log(`   Scope: VOLUME (chapter: ${chapterId}, volume: ${volumeNumber})`);

      // Check if entitlement exists
      const existing = await prisma.entitlement.findFirst({
        where: {
          userId: user.id,
          chapterId,
          volumeFrom: { lte: volumeNumber },
          volumeTo: { gte: volumeNumber },
        },
      });

      if (existing) {
        console.log(`   ✓ Entitlement already exists`);
        alreadyExists++;
      } else {
        console.log(`   ✗ Missing entitlement - creating...`);
        await prisma.entitlement.create({
          data: {
            userId: user.id,
            chapterId,
            volumeFrom: volumeNumber,
            volumeTo: volumeNumber,
            source: 'PROMOTION',
            scopes: ['BASE'],
          },
        });
        console.log(`   ✓ Created entitlement`);
        created++;
      }
    } else if (promotion.scope === 'CHAPTER') {
      console.log(`   Scope: CHAPTER (chapterId: ${refId})`);

      // Get chapter with volumes
      const chapter = await prisma.chapter.findUnique({
        where: { id: refId },
        include: {
          volumes: {
            select: { volumeNumber: true },
          },
        },
      });

      if (!chapter) {
        console.log(`   ⚠ Chapter not found`);
        continue;
      }

      if (chapter.volumes.length === 0) {
        console.log(`   ⚠ Chapter has no volumes`);
        continue;
      }

      const minVolume = Math.min(...chapter.volumes.map((v) => v.volumeNumber));
      const maxVolume = Math.max(...chapter.volumes.map((v) => v.volumeNumber));

      console.log(`   Volumes: ${minVolume}-${maxVolume}`);

      // Check if entitlement exists
      const existing = await prisma.entitlement.findFirst({
        where: {
          userId: user.id,
          chapterId: refId,
        },
      });

      if (existing) {
        console.log(`   ✓ Entitlement already exists (volumes ${existing.volumeFrom}-${existing.volumeTo})`);
        alreadyExists++;
      } else {
        console.log(`   ✗ Missing entitlement - creating...`);
        await prisma.entitlement.create({
          data: {
            userId: user.id,
            chapterId: refId,
            volumeFrom: minVolume,
            volumeTo: maxVolume,
            source: 'PROMOTION',
            scopes: ['BASE'],
          },
        });
        console.log(`   ✓ Created entitlement for volumes ${minVolume}-${maxVolume}`);
        created++;
      }
    }
  }

  // 4. Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✓ Fix Complete`);
  console.log(`  - Entitlements created: ${created}`);
  console.log(`  - Already existed: ${alreadyExists}`);
  console.log(`  - Total processed: ${appliedFreePromotions.length}`);
  console.log(`${'='.repeat(50)}\n`);

  process.exit(0);
}

fixChapterCollectorPromotions().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
