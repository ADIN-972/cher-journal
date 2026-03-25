import prisma from '../../../lib/prisma';
import { SupportClaimCategory } from '@prisma/client';

interface CreateClaimData {
  category: SupportClaimCategory;
  subject: string;
  message: string;
}

export class SupportService {
  async createClaim(userId: string, data: CreateClaimData) {
    // Create claim + initial message in a transaction
    return prisma.$transaction(async (tx) => {
      const claim = await tx.supportClaim.create({
        data: {
          userId,
          category: data.category,
          subject: data.subject,
          message: data.message,
          status: 'OPEN',
        },
      });

      // Create initial message from user
      await tx.supportMessage.create({
        data: {
          claimId: claim.id,
          authorId: userId,
          role: 'USER',
          content: data.message,
        },
      });

      return claim;
    });
  }

  async getUserClaims(userId: string) {
    return prisma.supportClaim.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Just the latest message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getClaimWithMessages(claimId: string, userId: string) {
    const claim = await prisma.supportClaim.findUnique({
      where: { id: claimId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!claim || claim.userId !== userId) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    return claim;
  }

  async addUserMessage(claimId: string, userId: string, content: string) {
    // Verify ownership
    const claim = await prisma.supportClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim || claim.userId !== userId) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    if (claim.status === 'CLOSED') {
      throw new Error('CLAIM_CLOSED');
    }

    // Add message and reopen if resolved
    return prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: {
          claimId,
          authorId: userId,
          role: 'USER',
          content,
        },
      });

      // Reopen if it was resolved (user is replying)
      if (claim.status === 'RESOLVED') {
        await tx.supportClaim.update({
          where: { id: claimId },
          data: { status: 'OPEN' },
        });
      }

      return message;
    });
  }
}
