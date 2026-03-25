import prisma from '../../../lib/prisma';
import crypto from 'crypto';
import { Perspective } from '@prisma/client';

export class ActivityService {
  /**
   * Log a user activity event
   */
  async logEvent(
    userId: string,
    eventType: string,
    request?: { headers: Record<string, any>; ip?: string }
  ) {
    const deviceType = request?.headers?.['x-app'] || null;
    const origin = request?.headers?.origin || null;
    const ipHash = request?.ip
      ? crypto.createHash('sha256').update(request.ip).digest('hex')
      : null;

    await prisma.userActivityLog.create({
      data: {
        userId,
        eventType,
        deviceType,
        origin,
        ipHash,
      },
    });
  }

  /**
   * Log event with metadata
   */
  async logEventWithMetadata(
    userId: string,
    eventType: string,
    metadata: Record<string, any>,
    request?: { headers: Record<string, any>; ip?: string }
  ) {
    const deviceType = request?.headers?.['x-app'] || null;
    const origin = request?.headers?.origin || null;
    const ipHash = request?.ip
      ? crypto.createHash('sha256').update(request.ip).digest('hex')
      : null;

    await prisma.userActivityLog.create({
      data: {
        userId,
        eventType,
        deviceType,
        origin,
        ipHash,
        metadata,
      },
    });
  }

  /**
   * Start or resume a reading session.
   * Returns the session ID for subsequent heartbeats.
   */
  async startReadingSession(
    userId: string,
    chapterId: string,
    volumeNumber: number,
    perspective: Perspective,
    deviceType?: string
  ): Promise<string> {
    // Look for a recent session (less than 5 min since last heartbeat)
    const recentSession = await prisma.readingSession.findFirst({
      where: {
        userId,
        chapterId,
        volumeNumber,
        perspective,
        lastHeartbeatAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
        isCompleted: false,
      },
      orderBy: { lastHeartbeatAt: 'desc' },
    });

    if (recentSession) {
      return recentSession.id;
    }

    // Create new reading session
    const session = await prisma.readingSession.create({
      data: {
        userId,
        chapterId,
        volumeNumber,
        perspective,
        deviceType: deviceType || null,
      },
    });

    return session.id;
  }

  /**
   * Heartbeat: update reading session with elapsed time and progress
   */
  async heartbeat(
    sessionId: string,
    userId: string,
    elapsedSeconds: number,
    progress: number
  ) {
    const session = await prisma.readingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return null;
    }

    return prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        lastHeartbeatAt: new Date(),
        totalSeconds: { increment: elapsedSeconds },
        progress: Math.min(progress, 100),
        isCompleted: progress >= 95,
      },
    });
  }

  /**
   * Get reading stats for a user
   */
  async getUserReadingStats(userId: string) {
    const sessions = await prisma.readingSession.findMany({
      where: { userId },
    });

    const totalSeconds = sessions.reduce((sum, s) => sum + s.totalSeconds, 0);
    const completedSessions = sessions.filter((s) => s.isCompleted).length;
    const uniqueChapters = new Set(sessions.map((s) => s.chapterId)).size;

    // Group by chapter
    const byChapter: Record<string, { totalSeconds: number; sessions: number }> = {};
    for (const s of sessions) {
      if (!byChapter[s.chapterId]) {
        byChapter[s.chapterId] = { totalSeconds: 0, sessions: 0 };
      }
      byChapter[s.chapterId].totalSeconds += s.totalSeconds;
      byChapter[s.chapterId].sessions += 1;
    }

    return {
      totalReadingTimeSeconds: totalSeconds,
      totalReadingTimeMinutes: Math.round(totalSeconds / 60),
      totalSessions: sessions.length,
      completedSessions,
      uniqueChaptersRead: uniqueChapters,
      byChapter,
    };
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(userId: string, limit: number = 50) {
    return prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get global reading stats (admin)
   */
  async getGlobalReadingStats() {
    const totalSessions = await prisma.readingSession.count();
    const totalSeconds = await prisma.readingSession.aggregate({
      _sum: { totalSeconds: true },
    });
    const completedSessions = await prisma.readingSession.count({
      where: { isCompleted: true },
    });
    const uniqueReaders = await prisma.readingSession.groupBy({
      by: ['userId'],
    });

    // By device
    const byDevice = await prisma.readingSession.groupBy({
      by: ['deviceType'],
      _sum: { totalSeconds: true },
      _count: true,
    });

    return {
      totalSessions,
      totalReadingTimeMinutes: Math.round((totalSeconds._sum.totalSeconds || 0) / 60),
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      uniqueReaders: uniqueReaders.length,
      byDevice: byDevice.map((d) => ({
        device: d.deviceType || 'unknown',
        sessions: d._count,
        totalMinutes: Math.round((d._sum.totalSeconds || 0) / 60),
      })),
    };
  }
}
