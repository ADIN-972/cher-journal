import prisma from '../../../lib/prisma';
import { ChapterStatus } from '@prisma/client';

export class CatalogService {
  async listChapters() {
    return prisma.chapter.findMany({
      where: {
        status: ChapterStatus.PUBLISHED,
      },
      include: {
        coverAsset: true,
        _count: {
          select: {
            volumes: true,
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
