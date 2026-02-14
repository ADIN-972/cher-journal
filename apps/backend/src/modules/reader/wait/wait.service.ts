import prisma from '../../../lib/prisma';
import { config } from '@cher-journal/config';
import { UnlockTriggeredBy } from '@prisma/client';
import { StartWaitInput, GetWaitStatusInput } from './wait.schemas';
import { ConfigService } from '../../admin/config/config.service';
import { priceSchemaService } from '../../admin/price-schemas/price-schemas.service';

export class WaitService {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }
  async startWait(userId: string, data: StartWaitInput) {
    // Check if chapter exists and get all volumes
    const chapter = await prisma.chapter.findUnique({
      where: { id: data.chapterId },
      include: { volumes: true },
    });

    if (!chapter || chapter.volumes.length === 0) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // Check if volumeNumber is valid (default to 1 if not provided)
    const volumeNumber = data.volumeNumber || 1;
    const volume = chapter.volumes.find(v => v.volumeNumber === volumeNumber);

    if (!volume) {
      throw new Error('VOLUME_NOT_FOUND');
    }

    // If volume is free, no wait needed - it's already accessible
    if (volume.isFree) {
      throw new Error('VOLUME_IS_FREE');
    }

    // If volume has final paywall, user needs to upgrade
    if (volume.isFinalPaywall) {
      throw new Error('REQUIRES_UPGRADE');
    }

    // Check if user already has an entitlement (purchased or free)
    let entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId: data.chapterId,
      },
    });

    // If no entitlement, create a FREE one via wait-to-read
    if (!entitlement) {
      const minVolume = Math.min(...chapter.volumes.map(v => v.volumeNumber));
      const maxVolume = Math.max(...chapter.volumes.map(v => v.volumeNumber));

      entitlement = await prisma.entitlement.create({
        data: {
          userId,
          chapterId: data.chapterId,
          volumeFrom: minVolume,
          volumeTo: maxVolume,
          versionScope: 'BASE', // Free users get only narrator perspective
          source: 'SUBSCRIPTION', // Using SUBSCRIPTION as a proxy for "free wait-to-read"
        },
      });
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

    // Check if there's an active wait for this chapter (1 volume per chapter)
    const activeWaitInChapter = await prisma.unlock.findFirst({
      where: {
        userId,
        chapterId: data.chapterId,
        triggeredBy: UnlockTriggeredBy.WAIT,
        unlocksAt: { gt: new Date() },
      },
    });

    if (activeWaitInChapter) {
      throw new Error('WAIT_ALREADY_ACTIVE');
    }

    // Get max simultaneous timers from config
    const waitConfig = await this.configService.getWaitConfig();
    const maxSimultaneousTimers = waitConfig.maxSimultaneousTimers;

    // Check how many DIFFERENT chapters have active waits
    const activeWaitsInOtherChapters = await prisma.unlock.groupBy({
      by: ['chapterId'],
      where: {
        userId,
        chapterId: { not: data.chapterId }, // Exclude current chapter
        triggeredBy: UnlockTriggeredBy.WAIT,
        unlocksAt: { gt: new Date() },
      },
    });

    if (activeWaitsInOtherChapters.length >= maxSimultaneousTimers) {
      throw new Error('MAX_PENDING_CHAPTERS_REACHED');
    }

    // Calculate unlock time based on NOW + current volume's waitDuration
    // The timer starts when the user clicks the button, regardless of previous volumes
    const waitDurationMs = Number(volume.waitDuration);

    // Timer starts at the moment of the click + waitDuration
    const unlocksAt = new Date(Date.now() + waitDurationMs);

    const unlock = await prisma.unlock.create({
      data: {
        userId,
        chapterId: data.chapterId,
        volumeNumber: data.volumeNumber,
        unlocksAt,
        triggeredBy: UnlockTriggeredBy.WAIT,
      },
    });

    // Create VolumeRead if it doesn't exist yet
    // Use try-catch to handle race condition where another request creates the record concurrently
    try {
      await prisma.volumeRead.create({
        data: {
          userId,
          chapterId: data.chapterId,
          volumeNumber: data.volumeNumber,
        },
      });
    } catch (error: any) {
      // If unique constraint violation (record already exists), that's fine - ignore it
      if (error.code !== 'P2002') {
        throw error;
      }
    }

    return {
      unlocksAt: unlock.unlocksAt,
      remainingMs: Math.max(0, unlock.unlocksAt.getTime() - Date.now()),
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
        chapter: {
          include: {
            volumes: true,
          },
        },
      },
    });

    return Promise.all(unlocks.map(async (unlock) => {
      // Get volume for determining price category
      const volume = unlock.chapter.volumes.find(v => v.volumeNumber === unlock.volumeNumber);

      // Get prices for this chapter
      const prices = await priceSchemaService.getChapterPrices(unlock.chapterId);

      // Determine which price applies to this volume
      let volumePrice = 0;
      if (volume && !volume.isFree) {
        if (volume.volumeNumber <= 8) {
          volumePrice = prices.priceFreeToRead;
        } else if (volume.volumeNumber <= 10) {
          volumePrice = prices.pricePaywall;
        } else {
          volumePrice = prices.priceEpilogue;
        }
      }

      // Calculate chapter price (all non-free volumes)
      let chapterPrice = 0;
      unlock.chapter.volumes.forEach(vol => {
        if (!vol.isFree) {
          if (vol.volumeNumber <= 8) {
            chapterPrice += prices.priceFreeToRead;
          } else if (vol.volumeNumber <= 10) {
            chapterPrice += prices.pricePaywall;
          } else {
            chapterPrice += prices.priceEpilogue;
          }
        }
      });

      return {
        chapterId: unlock.chapterId,
        chapterTitle: unlock.chapter.title,
        volumeNumber: unlock.volumeNumber,
        unlocksAt: unlock.unlocksAt,
        remainingMs: unlock.unlocksAt.getTime() - Date.now(),
        volumePrice,
        chapterPrice,
      };
    }));
  }

  async listCompletedWaits(userId: string) {
    const unlocks = await prisma.unlock.findMany({
      where: {
        userId,
        triggeredBy: UnlockTriggeredBy.WAIT,
        unlocksAt: { lte: new Date() },
      },
      include: {
        chapter: true,
      },
      orderBy: {
        unlocksAt: 'desc',
      },
      take: 50, // Limit to last 50 completed timers
    });

    return unlocks.map(unlock => ({
      chapterId: unlock.chapterId,
      chapterTitle: unlock.chapter.title,
      volumeNumber: unlock.volumeNumber,
      unlocksAt: unlock.unlocksAt,
      completedAt: unlock.unlocksAt,
    }));
  }

  async listAllWaits(userId: string) {
    const unlocks = await prisma.unlock.findMany({
      where: {
        userId,
        triggeredBy: UnlockTriggeredBy.WAIT,
      },
      include: {
        chapter: true,
      },
      orderBy: {
        unlocksAt: 'desc',
      },
    });

    return unlocks.map(unlock => {
      const isCompleted = unlock.unlocksAt <= new Date();
      return {
        chapterId: unlock.chapterId,
        chapterTitle: unlock.chapter.title,
        volumeNumber: unlock.volumeNumber,
        unlocksAt: unlock.unlocksAt,
        remainingMs: isCompleted ? 0 : unlock.unlocksAt.getTime() - Date.now(),
        isCompleted,
      };
    });
  }
}
