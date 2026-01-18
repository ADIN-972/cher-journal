import prisma from '../../../lib/prisma';
import { ChapterStatus, EntitlementVersionScope, VolumeStatus } from '@prisma/client';

export class LibraryService {
  async getLibrary(userId: string) {
    // Get all chapters user has access to
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: {
        chapter: {
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
              orderBy: { volumeNumber: 'asc' },
            },
          },
        },
      },
    });

    // Get active waits/unlocks
    const unlocks = await prisma.unlock.findMany({
      where: { userId },
    });

    // Get reading progress
    const reads = await prisma.volumeRead.findMany({
      where: { userId },
    });

    const library = entitlements.map(ent => {
      const chapterUnlocks = unlocks.filter(u => u.chapterId === ent.chapterId);
      const chapterReads = reads.filter(r => r.chapterId === ent.chapterId);
      
      // Find current volume (last read or first)
      const lastRead = chapterReads.sort((a, b) => 
        b.firstOpenedAt.getTime() - a.firstOpenedAt.getTime()
      )[0];
      
      const currentVolume = lastRead ? lastRead.volumeNumber : ent.volumeFrom;

      // Available volumes (within entitlement range or unlocked)
      const availableVolumes: number[] = [];
      for (let v = ent.volumeFrom; v <= ent.volumeTo; v++) {
        const unlock = chapterUnlocks.find(u => u.volumeNumber === v);
        if (!unlock || unlock.unlocksAt <= new Date()) {
          availableVolumes.push(v);
        }
      }

      // Active wait
      const activeWait = chapterUnlocks.find(
        u => u.unlocksAt > new Date()
      );

      return {
        chapter: ent.chapter,
        availableVolumes,
        currentVolume,
        versionScope: ent.versionScope,
        waitStatus: activeWait ? {
          isActive: true,
          unlocksAt: activeWait.unlocksAt,
          remainingMs: activeWait.unlocksAt.getTime() - Date.now(),
        } : {
          isActive: false,
        },
      };
    });

    return library;
  }
}
