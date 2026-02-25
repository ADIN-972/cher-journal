import prisma from '../../../lib/prisma';
import { SupportClaimCategory } from '@prisma/client';

interface CreateClaimData {
  category: SupportClaimCategory;
  subject: string;
  message: string;
}

export class SupportService {
  async createClaim(userId: string, data: CreateClaimData) {
    return prisma.supportClaim.create({
      data: {
        userId,
        category: data.category,
        subject: data.subject,
        message: data.message,
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserClaims(userId: string) {
    return prisma.supportClaim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
