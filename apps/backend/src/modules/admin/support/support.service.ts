import prisma from '../../../lib/prisma';
import { SupportClaimStatus } from '@prisma/client';

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
      },
      orderBy: [
        { status: 'asc' }, // OPEN first, then IN_PROGRESS, RESOLVED, CLOSED
        { createdAt: 'desc' }, // Most recent first
      ],
    });
  }

  async getById(id: string) {
    const claim = await prisma.supportClaim.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            publicId: true,
          },
        },
      },
    });

    if (!claim) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    return claim;
  }

  async updateStatus(id: string, status: SupportClaimStatus) {
    const claim = await prisma.supportClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    return prisma.supportClaim.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async respond(id: string, adminNote: string, adminId: string) {
    const claim = await prisma.supportClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new Error('CLAIM_NOT_FOUND');
    }

    return prisma.supportClaim.update({
      where: { id },
      data: {
        adminNote,
        respondedBy: adminId,
        respondedAt: new Date(),
        status: 'IN_PROGRESS' as SupportClaimStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
