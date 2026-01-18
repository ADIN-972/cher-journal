import { PrismaClient, ChapterStatus, VolumeStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface SchedulePublicationInput {
  entityType: 'chapter' | 'volume';
  entityId: string;
  scheduledFor: Date;
}

export interface ScheduleBulkPublicationInput {
  entityType: 'chapter' | 'volume';
  entityIds: string[];
  scheduledFor: Date;
}

export interface ScheduledItem {
  id: string;
  type: 'chapter' | 'volume';
  title: string;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  status?: ChapterStatus | VolumeStatus;
  chapterTitle?: string; // For volumes
  volumeNumber?: number; // For volumes
}

export const schedulingService = {
  /**
   * Schedule a chapter or volume for publication
   */
  async schedulePublication(input: SchedulePublicationInput) {
    const { entityType, entityId, scheduledFor } = input;

    if (scheduledFor <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    if (entityType === 'chapter') {
      const chapter = await prisma.chapter.findUnique({
        where: { id: entityId },
      });

      if (!chapter) {
        throw new Error('Chapter not found');
      }

      // Allow scheduling even for published chapters
      // This sets the date when the chapter becomes readable
      return prisma.chapter.update({
        where: { id: entityId },
        data: {
          scheduledFor,
          // Keep existing status if already published, otherwise set to IN_PROGRESS
          status: chapter.status === ChapterStatus.PUBLISHED ? ChapterStatus.PUBLISHED : ChapterStatus.IN_PROGRESS,
        },
      });
    } else {
      const volume = await prisma.volume.findUnique({
        where: { id: entityId },
      });

      if (!volume) {
        throw new Error('Volume not found');
      }

      // Allow scheduling even for published volumes
      // This sets the date when the volume becomes readable
      return prisma.volume.update({
        where: { id: entityId },
        data: {
          scheduledFor,
          // Keep existing status if already published, otherwise set to IN_PROGRESS
          status: volume.status === VolumeStatus.PUBLISHED ? VolumeStatus.PUBLISHED : VolumeStatus.IN_PROGRESS,
        },
      });
    }
  },

  /**
   * Schedule multiple entities for publication (bulk operation)
   */
  async scheduleBulkPublication(input: ScheduleBulkPublicationInput) {
    const { entityType, entityIds, scheduledFor } = input;

    if (scheduledFor <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    if (!entityIds || entityIds.length === 0) {
      throw new Error('No entities provided');
    }

    const results = {
      scheduled: [] as string[],
      errors: [] as { id: string; error: string }[],
    };

    if (entityType === 'chapter') {
      for (const entityId of entityIds) {
        try {
          const chapter = await prisma.chapter.findUnique({
            where: { id: entityId },
          });

          if (!chapter) {
            results.errors.push({ id: entityId, error: 'Chapter not found' });
            continue;
          }

          // Allow scheduling even for published chapters
          await prisma.chapter.update({
            where: { id: entityId },
            data: {
              scheduledFor,
              // Keep existing status if already published, otherwise set to IN_PROGRESS
              status: chapter.status === ChapterStatus.PUBLISHED ? ChapterStatus.PUBLISHED : ChapterStatus.IN_PROGRESS,
            },
          });

          results.scheduled.push(entityId);
        } catch (error: any) {
          results.errors.push({ id: entityId, error: error.message });
        }
      }
    } else {
      // Bulk update volumes
      for (const entityId of entityIds) {
        try {
          const volume = await prisma.volume.findUnique({
            where: { id: entityId },
          });

          if (!volume) {
            results.errors.push({ id: entityId, error: 'Volume not found' });
            continue;
          }

          // Allow scheduling even for published volumes
          // This sets the date when the volume becomes readable
          await prisma.volume.update({
            where: { id: entityId },
            data: {
              scheduledFor,
              // Keep existing status if already published, otherwise set to IN_PROGRESS
              status: volume.status === VolumeStatus.PUBLISHED ? VolumeStatus.PUBLISHED : VolumeStatus.IN_PROGRESS,
            },
          });

          results.scheduled.push(entityId);
        } catch (error: any) {
          results.errors.push({ id: entityId, error: error.message });
        }
      }
    }

    return results;
  },

  /**
   * Cancel scheduled publication
   */
  async cancelScheduledPublication(entityType: 'chapter' | 'volume', entityId: string) {
    if (entityType === 'chapter') {
      const chapter = await prisma.chapter.findUnique({
        where: { id: entityId },
      });

      if (!chapter) {
        throw new Error('Chapter not found');
      }

      return prisma.chapter.update({
        where: { id: entityId },
        data: {
          scheduledFor: null,
          // Only move back to draft if not already published
          status: chapter.status === ChapterStatus.PUBLISHED ? ChapterStatus.PUBLISHED : ChapterStatus.DRAFT,
        },
      });
    } else {
      const volume = await prisma.volume.findUnique({
        where: { id: entityId },
      });

      if (!volume) {
        throw new Error('Volume not found');
      }

      return prisma.volume.update({
        where: { id: entityId },
        data: {
          scheduledFor: null,
          // Only move back to draft if not already published
          status: volume.status === VolumeStatus.PUBLISHED ? VolumeStatus.PUBLISHED : VolumeStatus.DRAFT,
        },
      });
    }
  },

  /**
   * Get all scheduled items (chapters and volumes)
   */
  async getScheduledItems(): Promise<ScheduledItem[]> {
    const [chapters, volumes] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          scheduledFor: { not: null },
        },
        orderBy: { scheduledFor: 'asc' },
      }),
      prisma.volume.findMany({
        where: {
          scheduledFor: { not: null },
        },
        include: {
          chapter: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { scheduledFor: 'asc' },
      }),
    ]);

    const scheduledChapters: ScheduledItem[] = chapters.map((ch) => ({
      id: ch.id,
      type: 'chapter' as const,
      title: ch.title,
      scheduledFor: ch.scheduledFor,
      publishedAt: ch.publishedAt,
      status: ch.status,
    }));

    const scheduledVolumes: ScheduledItem[] = volumes.map((vol) => ({
      id: vol.id,
      type: 'volume' as const,
      title: vol.title,
      scheduledFor: vol.scheduledFor,
      publishedAt: vol.publishedAt,
      status: vol.status,
      chapterTitle: vol.chapter.title,
      volumeNumber: vol.volumeNumber,
    }));

    return [...scheduledChapters, ...scheduledVolumes].sort((a, b) => {
      if (!a.scheduledFor || !b.scheduledFor) return 0;
      return a.scheduledFor.getTime() - b.scheduledFor.getTime();
    });
  },

  /**
   * Get items due for publication (past scheduled date)
   * Only returns items that are not yet PUBLISHED (DRAFT or IN_PROGRESS)
   */
  async getDueForPublication() {
    const now = new Date();

    const [chapters, volumes] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          scheduledFor: { lte: now },
          status: { not: ChapterStatus.PUBLISHED },
        },
      }),
      prisma.volume.findMany({
        where: {
          scheduledFor: { lte: now },
          status: { not: VolumeStatus.PUBLISHED },
        },
      }),
    ]);

    return { chapters, volumes };
  },

  /**
   * Publish a chapter (used by cron job)
   */
  async publishChapter(chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    if (chapter.publishedAt) {
      throw new Error('Chapter is already published');
    }

    return prisma.chapter.update({
      where: { id: chapterId },
      data: {
        publishedAt: new Date(),
        status: ChapterStatus.PUBLISHED,
        scheduledFor: null, // Clear scheduled date
      },
    });
  },

  /**
   * Publish a volume (used by cron job)
   */
  async publishVolume(volumeId: string) {
    const volume = await prisma.volume.findUnique({
      where: { id: volumeId },
    });

    if (!volume) {
      throw new Error('Volume not found');
    }

    if (volume.status === VolumeStatus.PUBLISHED) {
      throw new Error('Volume is already published');
    }

    return prisma.volume.update({
      where: { id: volumeId },
      data: {
        publishedAt: new Date(),
        status: VolumeStatus.PUBLISHED,
        scheduledFor: null, // Clear scheduled date
      },
    });
  },

  /**
   * Process scheduled publications (called by cron job)
   */
  async processScheduledPublications() {
    const { chapters, volumes } = await this.getDueForPublication();

    const results = {
      publishedChapters: [] as string[],
      publishedVolumes: [] as string[],
      errors: [] as { id: string; type: string; error: string }[],
    };

    // Publish chapters
    for (const chapter of chapters) {
      try {
        await this.publishChapter(chapter.id);
        results.publishedChapters.push(chapter.id);
      } catch (error: any) {
        results.errors.push({
          id: chapter.id,
          type: 'chapter',
          error: error.message,
        });
      }
    }

    // Publish volumes
    for (const volume of volumes) {
      try {
        await this.publishVolume(volume.id);
        results.publishedVolumes.push(volume.id);
      } catch (error: any) {
        results.errors.push({
          id: volume.id,
          type: 'volume',
          error: error.message,
        });
      }
    }

    return results;
  },

  /**
   * Get calendar view (grouped by date)
   */
  async getCalendarView(startDate: Date, endDate: Date) {
    const [chapters, volumes] = await Promise.all([
      prisma.chapter.findMany({
        where: {
          scheduledFor: {
            gte: startDate,
            lte: endDate,
          },
          publishedAt: null,
        },
        orderBy: { scheduledFor: 'asc' },
      }),
      prisma.volume.findMany({
        where: {
          scheduledFor: {
            gte: startDate,
            lte: endDate,
          },
          publishedAt: null,
        },
        include: {
          chapter: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { scheduledFor: 'asc' },
      }),
    ]);

    // Group by date
    const calendar: Record<string, ScheduledItem[]> = {};

    chapters.forEach((ch) => {
      if (!ch.scheduledFor) return;
      const dateKey = ch.scheduledFor.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({
        id: ch.id,
        type: 'chapter',
        title: ch.title,
        scheduledFor: ch.scheduledFor,
        publishedAt: ch.publishedAt,
        status: ch.status,
      });
    });

    volumes.forEach((vol) => {
      if (!vol.scheduledFor) return;
      const dateKey = vol.scheduledFor.toISOString().split('T')[0];
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({
        id: vol.id,
        type: 'volume',
        title: vol.title,
        scheduledFor: vol.scheduledFor,
        publishedAt: vol.publishedAt,
        chapterTitle: vol.chapter.title,
        volumeNumber: vol.volumeNumber,
      });
    });

    return calendar;
  },
};
