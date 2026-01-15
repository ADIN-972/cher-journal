import prisma from '../../../lib/prisma';
import { config } from '@cher-journal/config';
import { UnlockTriggeredBy } from '@prisma/client';
import { StartWaitInput, GetWaitStatusInput } from './wait.schemas';

export class WaitService {
  async startWait(userId: string, data: StartWaitInput) {
    // Check if volume exists
    const volume = await prisma.volume.findFirst({
      where: {
        chapterId: data.chapterId,
        volumeNumber: data.volumeNumber,
      },
    });

    if (!volume) {
      throw new Error('VOLUME_NOT_FOUND');
    }

    // Check if user has entitlement to this chapter
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId: data.chapterId,
        volumeFrom: { lte: data.volumeNumber },
        volumeTo: { gte: data.volumeNumber },
      },
    });

    if (!entitlement) {
      throw new Error('NO_ACCESS');
    }

    // Check if wait already exists
    const existingUnlock = await prisma.unlock.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId: data.chapterId,
          volumeNumber: data.volumeNumber,
        },
      },
    });

    if (existingUnlock) {
      // Already started
      return {
        unlocksAt: existingUnlock.unlocksAt,
        remainingMs: Math.max(0, existingUnlock.unlocksAt.getTime() - Date.now()),
      };
    }

    // Check if there's an active wait for this chapter
    const activeWait = await prisma.unlock.findFirst({
      where: {
        userId,
        chapterId: data.chapterId,
        triggeredBy: UnlockTriggeredBy.WAIT,
        unlocksAt: { gt: new Date() },
      },
    });

    if (activeWait) {
      throw new Error('WAIT_ALREADY_ACTIVE');
    }

    // Create unlock with wait duration
    const unlocksAt = new Date(Date.now() + config.waitDuration);
    
    const unlock = await prisma.unlock.create({
      data: {
        userId,
        chapterId: data.chapterId,
        volumeNumber: data.volumeNumber,
        unlocksAt,
        triggeredBy: UnlockTriggeredBy.WAIT,
      },
    });

    // Create or update VolumeRead
    await prisma.volumeRead.upsert({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId: data.chapterId,
          volumeNumber: data.volumeNumber,
        },
      },
      create: {
        userId,
        chapterId: data.chapterId,
        volumeNumber: data.volumeNumber,
      },
      update: {
        // Just update timestamp if already exists
      },
    });

    return {
      unlocksAt: unlock.unlocksAt,
      remainingMs: config.waitDuration,
    };
  }

  async getWaitStatus(userId: string, data: GetWaitStatusInput) {
    const unlock = await prisma.unlock.findUnique({
      where: {
        userId_chapterId_volumeNumber: {
          userId,
          chapterId: data.chapterId,
          volumeNumber: data.volumeNumber,
        },
      },
    });

    if (!unlock) {
      return {
        isActive: false,
      };
    }

    const remainingMs = Math.max(0, unlock.unlocksAt.getTime() - Date.now());
    const isActive = remainingMs > 0;

    return {
      isActive,
      unlocksAt: unlock.unlocksAt,
      remainingMs,
    };
  }

  async listActiveWaits(userId: string) {
    const unlocks = await prisma.unlock.findMany({
      where: {
        userId,
        triggeredBy: UnlockTriggeredBy.WAIT,
        unlocksAt: { gt: new Date() },
      },
      include: {
        chapter: true,
      },
    });

    return unlocks.map(unlock => ({
      chapterId: unlock.chapterId,
      chapterTitle: unlock.chapter.title,
      volumeNumber: unlock.volumeNumber,
      unlocksAt: unlock.unlocksAt,
      remainingMs: unlock.unlocksAt.getTime() - Date.now(),
    }));
  }
}
