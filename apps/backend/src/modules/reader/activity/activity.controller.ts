import { FastifyRequest, FastifyReply } from 'fastify';
import { ActivityService } from './activity.service';
import { Perspective } from '@prisma/client';

const service = new ActivityService();

export class ActivityController {
  /**
   * POST /reader/reading-session/start
   * Start a new reading session or resume a recent one
   */
  async startSession(
    request: FastifyRequest<{
      Body: {
        chapterId: string;
        volumeNumber: number;
        perspective?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const { chapterId, volumeNumber, perspective } = request.body;
    const deviceType = request.headers['x-app'] as string | undefined;

    const sessionId = await service.startReadingSession(
      request.user!.id,
      chapterId,
      volumeNumber,
      (perspective || 'NARRATOR') as Perspective,
      deviceType
    );

    // Log activity
    await service.logEventWithMetadata(
      request.user!.id,
      'VOLUME_OPEN',
      { chapterId, volumeNumber, perspective: perspective || 'NARRATOR' },
      request as any
    ).catch(() => {});

    return reply.send({ success: true, data: { sessionId } });
  }

  /**
   * POST /reader/reading-session/heartbeat
   * Update reading session with elapsed time and progress
   */
  async heartbeat(
    request: FastifyRequest<{
      Body: {
        sessionId: string;
        elapsedSeconds: number;
        progress: number;
      };
    }>,
    reply: FastifyReply
  ) {
    const { sessionId, elapsedSeconds, progress } = request.body;

    const session = await service.heartbeat(
      sessionId,
      request.user!.id,
      elapsedSeconds,
      progress
    );

    if (!session) {
      return reply.status(404).send({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Reading session not found' },
      });
    }

    return reply.send({
      success: true,
      data: {
        totalSeconds: session.totalSeconds,
        progress: session.progress,
        isCompleted: session.isCompleted,
      },
    });
  }

  /**
   * GET /reader/reading-stats
   * Get current user's reading statistics
   */
  async getMyStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await service.getUserReadingStats(request.user!.id);
    return reply.send({ success: true, data: stats });
  }

  /**
   * GET /reader/activity
   * Get current user's recent activity log
   */
  async getMyActivity(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) {
    const limit = request.query.limit ? parseInt(request.query.limit, 10) : 50;
    const activity = await service.getUserActivity(request.user!.id, limit);
    return reply.send({ success: true, data: activity });
  }
}
