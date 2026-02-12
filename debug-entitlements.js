// Debug script to check user entitlements and volume status
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHAPTER_ID = '4ab2e94f-5fc2-44b9-8ce1-bc0623970c45'; // Replace with actual chapter ID

async function debugEntitlements() {
  try {
    console.log('=== DEBUGGING USER ENTITLEMENTS ===\n');

    // Get chapter info
    const chapter = await prisma.chapter.findUnique({
      where: { id: CHAPTER_ID },
      include: {
        volumes: {
          orderBy: { volumeNumber: 'asc' },
          select: {
            id: true,
            volumeNumber: true,
            title: true,
            status: true,
            isFree: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!chapter) {
      console.log('Chapter not found!');
      return;
    }

    console.log(`Chapter: ${chapter.title}`);
    console.log(`Total volumes in DB: ${chapter.volumes.length}\n`);

    // Show volume status
    console.log('=== VOLUME STATUS ===');
    chapter.volumes.forEach(v => {
      console.log(`Volume ${v.volumeNumber}: ${v.title}`);
      console.log(`  Status: ${v.status}`);
      console.log(`  isFree: ${v.isFree}`);
      console.log(`  publishedAt: ${v.publishedAt || 'null'}`);
      console.log('');
    });

    // Get all orders for this chapter
    console.log('=== ORDERS FOR THIS CHAPTER ===');
    const orders = await prisma.order.findMany({
      where: {
        refId: CHAPTER_ID,
        type: 'CHAPTER',
      },
      select: {
        id: true,
        userId: true,
        type: true,
        status: true,
        amountTotal: true,
        currency: true,
        refId: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      console.log('No orders found for this chapter\n');
    } else {
      orders.forEach(order => {
        console.log(`Order ID: ${order.id.slice(0, 8)}...`);
        console.log(`  User: ${order.user.email} (${order.user.firstName} ${order.user.lastName})`);
        console.log(`  Type: ${order.type}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Amount: ${(order.amountTotal || 0) / 100} ${order.currency || 'EUR'}`);
        console.log(`  RefId: ${order.refId}`);
        console.log(`  Created: ${order.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Get all entitlements for this chapter
    console.log('=== ENTITLEMENTS FOR THIS CHAPTER ===');
    const entitlements = await prisma.entitlement.findMany({
      where: {
        chapterId: CHAPTER_ID,
      },
      select: {
        id: true,
        userId: true,
        volumeFrom: true,
        volumeTo: true,
        versionScope: true,
        source: true,
        grantedAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });

    if (entitlements.length === 0) {
      console.log('No entitlements found for this chapter\n');
    } else {
      entitlements.forEach(ent => {
        console.log(`Entitlement ID: ${ent.id.slice(0, 8)}...`);
        console.log(`  User: ${ent.user.email} (${ent.user.firstName} ${ent.user.lastName})`);
        console.log(`  Volumes: ${ent.volumeFrom}-${ent.volumeTo}`);
        console.log(`  Version Scope: ${ent.versionScope}`);
        console.log(`  Source: ${ent.source}`);
        console.log(`  Granted: ${ent.grantedAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Summary
    console.log('=== SUMMARY ===');
    const publishedCount = chapter.volumes.filter(v => v.status === 'PUBLISHED').length;
    const draftCount = chapter.volumes.filter(v => v.status === 'DRAFT').length;
    const scheduledCount = chapter.volumes.filter(v => v.status === 'SCHEDULED').length;

    console.log(`Published volumes: ${publishedCount}`);
    console.log(`Draft volumes: ${draftCount}`);
    console.log(`Scheduled volumes: ${scheduledCount}`);
    console.log(`\nVolumes that users with full access CANNOT see: ${draftCount + scheduledCount}`);

    if (draftCount + scheduledCount > 0) {
      console.log('\n⚠️  PROBLEM DETECTED:');
      console.log('Users who purchased the full chapter cannot access unpublished volumes.');
      console.log('Solution: Publish these volumes using the bulk edit feature in the admin panel.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugEntitlements();
