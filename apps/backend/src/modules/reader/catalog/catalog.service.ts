import prisma from '../../../lib/prisma';
import { ChapterStatus, VolumeStatus } from '@prisma/client';

export class CatalogService {
  async listChapters() {
    return prisma.chapter.findMany({
      where: {
        status: ChapterStatus.PUBLISHED,
        // Chapter must be either without scheduledFor OR scheduled date has passed
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lte: new Date() } }
        ]
      },
      include: {
        coverAsset: true,
        _count: {
          select: {
            volumes: {
              where: {
                // Only count volumes that are published and accessible
                status: VolumeStatus.PUBLISHED,
                OR: [
                  { scheduledFor: null },
                  { scheduledFor: { lte: new Date() } }
                ]
              }
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChapter(id: string, userId?: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        coverAsset: true,
        volumes: {
          where: {
            // Only include volumes that are published and accessible
            status: VolumeStatus.PUBLISHED,
            OR: [
              { scheduledFor: null },
              { scheduledFor: { lte: new Date() } }
            ]
          },
          include: {
            illustrationAsset: true,
          },
          orderBy: { volumeNumber: 'asc' },
        },
      },
    });

    if (!chapter) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // If user authenticated, check entitlements
    let hasAccess = false;
    let versionScope = null;

    if (userId) {
      const entitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId: id,
        },
      });

      if (entitlement) {
        hasAccess = true;
        versionScope = entitlement.versionScope;
      }
    }

    return {
      ...chapter,
      hasAccess,
      versionScope,
    };
  }
}
