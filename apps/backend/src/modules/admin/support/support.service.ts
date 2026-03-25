import prisma from '../../../lib/prisma';
import { SupportClaimStatus } from '@prisma/client';

const claimInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      publicId: true,
    },
  },
  messages: {
    orderBy: { createdAt: 'asc' as const },
  },
  _count: {
    select: { messages: true },
  },
};

export class SupportService {
  async list() {
    return prisma.supportClaim.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Latest message for preview
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  async getById(id: string) {
    const claim = await prisma.supportClaim.findUnique({
      where: { id },
      include: claimInclude,
    });

    if (!claim) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    return claim;
  }

  async updateStatus(id: string, status: SupportClaimStatus) {
    const claim = await prisma.supportClaim.findUnique({ where: { id } });
    if (!claim) throw new Error('CLAIM_NOT_FOUND');

    return prisma.supportClaim.update({
      where: { id },
      data: { status },
      include: claimInclude,
    });
  }

  async respond(id: string, adminNote: string, adminId: string) {
    const claim = await prisma.supportClaim.findUnique({ where: { id } });
    if (!claim) throw new Error('CLAIM_NOT_FOUND');

    // Create message + update claim in transaction
    return prisma.$transaction(async (tx) => {
      // Add admin message
      await tx.supportMessage.create({
        data: {
          claimId: id,
          authorId: adminId,
          role: 'ADMIN',
          content: adminNote,
        },
      });

      // Update claim status and legacy fields
      const updated = await tx.supportClaim.update({
        where: { id },
        data: {
          adminNote, // Keep legacy field updated with latest response
          respondedBy: adminId,
          respondedAt: new Date(),
          status: claim.status === 'OPEN' ? 'IN_PROGRESS' : claim.status,
        },
        include: claimInclude,
      });

      return updated;
    });
  }
}
