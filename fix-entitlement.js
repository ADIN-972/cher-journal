// Script to fix entitlement source for users who purchased chapters
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHAPTER_ID = '4ab2e94f-5fc2-44b9-8ce1-bc0623970c45';

async function fixEntitlement() {
  try {
    console.log('=== FIXING ENTITLEMENT SOURCE ===\n');

    // Find the entitlement with wrong source
    const wrongEntitlement = await prisma.entitlement.findFirst({
      where: {
        chapterId: CHAPTER_ID,
        source: 'SUBSCRIPTION',
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wrongEntitlement) {
      console.log('No entitlement with SUBSCRIPTION source found.');
      return;
    }

    console.log('Found entitlement with wrong source:');
    console.log(`  ID: ${wrongEntitlement.id}`);
    console.log(`  User: ${wrongEntitlement.user.email} (${wrongEntitlement.user.firstName} ${wrongEntitlement.user.lastName})`);
    console.log(`  Volumes: ${wrongEntitlement.volumeFrom}-${wrongEntitlement.volumeTo}`);
    console.log(`  Current Source: ${wrongEntitlement.source}`);
    console.log('');

    // Check if user has a PAID order for this chapter
    const paidOrder = await prisma.order.findFirst({
      where: {
        userId: wrongEntitlement.userId,
        refId: CHAPTER_ID,
        type: 'CHAPTER',
        status: 'PAID',
      },
    });

    if (!paidOrder) {
      console.log('⚠️  No PAID order found for this user and chapter.');
      console.log('Cannot change source to PURCHASE without a paid order.');
      return;
    }

    console.log('Found PAID order:');
    console.log(`  ID: ${paidOrder.id}`);
    console.log(`  Amount: ${(paidOrder.amountTotal || 0) / 100} ${paidOrder.currency || 'EUR'}`);
    console.log(`  Created: ${paidOrder.createdAt.toLocaleString()}`);
    console.log('');

    // Update the entitlement source
    console.log('Updating entitlement source from SUBSCRIPTION to PURCHASE...');

    const updatedEntitlement = await prisma.entitlement.update({
      where: {
        id: wrongEntitlement.id,
      },
      data: {
        source: 'PURCHASE',
      },
    });

    console.log('✓ Entitlement updated successfully!');
    console.log(`  New Source: ${updatedEntitlement.source}`);
    console.log('');
    console.log('The user should now have full access to all volumes in the chapter.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEntitlement();
