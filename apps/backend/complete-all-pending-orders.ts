/**
 * Script to complete all PENDING orders
 * This simulates what the Stripe webhook would do
 *
 * Usage: npx tsx complete-all-pending-orders.ts
 */

import prisma from './src/lib/prisma';
import { OrderStatus, EntitlementSource, EntitlementVersionScope } from '@prisma/client';

async function completeAllPendingOrders() {
  console.log('🔍 Looking for PENDING orders...');

  // Get all pending orders
  const pendingOrders = await prisma.order.findMany({
    where: { status: OrderStatus.PENDING },
    include: {
      user: {
        select: { email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (pendingOrders.length === 0) {
    console.log('✅ No pending orders found');
    return;
  }

  console.log(`📦 Found ${pendingOrders.length} pending orders`);

  for (const order of pendingOrders) {
    console.log(`\n--- Processing order ${order.id} ---`);
    console.log(`User: ${order.user.email}`);
    console.log(`Type: ${order.type}`);
    console.log(`Chapter ID: ${order.refId}`);

    try {
      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          currency: 'eur',
          amountTotal: 1046 // Default amount
        }
      });
      console.log('✅ Order status updated to PAID');

      // Create entitlement if it's a chapter purchase
      if (order.type === 'CHAPTER') {
        const chapterId = order.refId;
        const chapter = await prisma.chapter.findUnique({
          where: { id: chapterId },
          include: { volumes: true }
        });

        if (!chapter) {
          console.error('❌ Chapter not found:', chapterId);
          continue;
        }

        const minVolume = Math.min(...chapter.volumes.map(v => v.volumeNumber));
        const maxVolume = Math.max(...chapter.volumes.map(v => v.volumeNumber));
        console.log(`Volume range: ${minVolume}-${maxVolume}`);

        // Check if entitlement already exists
        const existingEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId: order.userId,
            chapterId: chapterId
          }
        });

        if (existingEntitlement) {
          // Update existing entitlement
          await prisma.entitlement.update({
            where: { id: existingEntitlement.id },
            data: {
              source: EntitlementSource.PURCHASE,
              versionScope: EntitlementVersionScope.BASE,
              volumeFrom: minVolume,
              volumeTo: maxVolume
            }
          });
          console.log('✅ Entitlement updated');
        } else {
          // Create new entitlement
          await prisma.entitlement.create({
            data: {
              userId: order.userId,
              chapterId: chapterId,
              volumeFrom: minVolume,
              volumeTo: maxVolume,
              versionScope: EntitlementVersionScope.BASE,
              source: EntitlementSource.PURCHASE
            }
          });
          console.log('✅ Entitlement created');
        }

        // Create unlock for volume 1
        const existingUnlock = await prisma.unlock.findUnique({
          where: {
            userId_chapterId_volumeNumber: {
              userId: order.userId,
              chapterId: chapterId,
              volumeNumber: 1
            }
          }
        });

        if (!existingUnlock) {
          await prisma.unlock.create({
            data: {
              userId: order.userId,
              chapterId: chapterId,
              volumeNumber: 1,
              unlocksAt: new Date(),
              triggeredBy: 'PURCHASE'
            }
          });
          console.log('✅ Unlock created for volume 1');
        } else {
          console.log('ℹ️  Unlock for volume 1 already exists');
        }
      }

      console.log('✅ Order completed successfully');
    } catch (error: any) {
      console.error(`❌ Error processing order ${order.id}:`, error.message);
    }
  }

  console.log('\n🎉 All pending orders have been processed!');
}

completeAllPendingOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
