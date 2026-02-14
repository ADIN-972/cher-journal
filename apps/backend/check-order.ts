import prisma from './src/lib/prisma';

async function main() {
  // Check the most recent VOLUME order
  const order = await prisma.order.findFirst({
    where: {
      type: 'VOLUME',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('=== Recent VOLUME Order ===');
  console.log(JSON.stringify(order, null, 2));

  if (order && order.refId && order.userId) {
    // Check entitlements for this user
    const entitlements = await prisma.entitlement.findMany({
      where: {
        userId: order.userId,
        chapterId: order.refId,
      },
    });

    console.log('\n=== Entitlements ===');
    console.log(JSON.stringify(entitlements, null, 2));

    // Check unlocks for this volume
    if (order.volumeNumber) {
      const unlocks = await prisma.unlock.findMany({
        where: {
          userId: order.userId,
          chapterId: order.refId,
          volumeNumber: order.volumeNumber,
        },
      });

      console.log('\n=== Unlocks ===');
      console.log(JSON.stringify(unlocks, null, 2));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
