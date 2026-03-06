import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomStoriesService } from './custom-stories.service';
import { CreateStoryDto, UpdateStoryDto } from './dto/create-story.dto';

const service = new CustomStoriesService();

export class CustomStoriesController {
  /**
   * Create a new story (draft)
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const dto = request.body as CreateStoryDto;
    if (!dto.rgpdConsent || !dto.ccpaConsent) {
      return reply.status(400).send({ error: 'RGPD/CCPA consent required' });
    }

    const userIp = request.ip;
    const userAgent = request.headers['user-agent'] || '';

    try {
      const story = await service.createStory(userId, dto, userIp, userAgent);
      return reply.status(201).send(story);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Update draft story
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const storyId = (request.params as any).id;
    const dto = request.body as UpdateStoryDto;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const story = await service.getStory(storyId, userId);
      if (!story || story.userId !== userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      if (story.status !== 'PENDING' && story.status !== 'DRAFT') {
        return reply.status(400).send({ error: 'Cannot modify submitted request' });
      }

      const updated = await service.updateStory(storyId, userId, dto);
      return reply.send(updated);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Get story
   */
  async getStory(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const storyId = (request.params as any).id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const story = await service.getStory(storyId, userId);
      if (!story || story.userId !== userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      return reply.send(story);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * List user's stories
   */
  async listStories(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const stories = await service.listUserStories(userId);
      return reply.send(stories);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Submit story for review
   */
  async submitStory(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const storyId = (request.params as any).id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const story = await service.getStory(storyId, userId);
      if (!story || story.userId !== userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const submitted = await service.submitStory(storyId, userId);
      return reply.send(submitted);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Cancel story
   */
  async cancelStory(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const storyId = (request.params as any).id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const story = await service.getStory(storyId, userId);
      if (!story || story.userId !== userId) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const cancelled = await service.cancelStory(storyId, userId);
      return reply.send(cancelled);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: List stories for moderation
   */
  async adminListPending(request: FastifyRequest, reply: FastifyReply) {
    // TODO: Add admin guard check
    try {
      const stories = await service.listForModeration('PENDING');
      return reply.send(stories);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: Approve story
   */
  async adminApprove(request: FastifyRequest, reply: FastifyReply) {
    const adminId = (request.user as any)?.id;
    const storyId = (request.params as any).id;

    // TODO: Add admin guard check

    try {
      const approved = await service.approveStory(storyId, adminId);
      return reply.send(approved);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: Reject story
   */
  async adminReject(request: FastifyRequest, reply: FastifyReply) {
    const adminId = (request.user as any)?.id;
    const storyId = (request.params as any).id;
    const body = request.body as { reason: string; notes?: string };

    // TODO: Add admin guard check

    try {
      const rejected = await service.rejectStory(storyId, adminId, body.reason, body.notes);
      return reply.send(rejected);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: Mark as under review
   */
  async adminUnderReview(request: FastifyRequest, reply: FastifyReply) {
    const storyId = (request.params as any).id;

    // TODO: Add admin guard check

    try {
      const underReview = await service.markUnderReview(storyId);
      return reply.send(underReview);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: List all stories with pagination and filtering
   */
  async adminListAll(request: FastifyRequest, reply: FastifyReply) {
    // TODO: Add admin guard check
    const query = request.query as {
      status?: string;
      page?: string;
      limit?: string;
    };

    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const status = query.status;

      const stories = await service.listForModerationPaginated(status, page, limit);
      return reply.send(stories);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }

  /**
   * Admin: Get statistics
   */
  async adminGetStats(request: FastifyRequest, reply: FastifyReply) {
    // TODO: Add admin guard check
    try {
      const stats = await service.getStoryStats();
      return reply.send(stats);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }
}
