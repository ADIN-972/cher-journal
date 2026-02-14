import { FastifyRequest, FastifyReply } from 'fastify';
import { ContentConfigService } from './content-config.service';

const service = new ContentConfigService();

export class ContentConfigController {
  /**
   * Get current moment selection chapter
   */
  async getMomentSelection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const chapterId = await service.getMomentSelectionChapterId();
      return reply.send({
        success: true,
        data: {
          chapterId,
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
      });
    }
  }

  /**
   * Set moment selection chapter
   */
  async setMomentSelection(
    request: FastifyRequest<{
      Body: { chapterId: string | null };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { chapterId } = request.body;
      const userId = request.user!.id;

      await service.setMomentSelectionChapter(chapterId, userId);

      return reply.send({
        success: true,
        data: {
          chapterId,
          message: chapterId ? 'Moment selection updated' : 'Moment selection cleared',
        },
      });
    } catch (error: any) {
      if (error.message === 'CHAPTER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CHAPTER_NOT_FOUND', message: 'Chapter not found' },
        });
      }

      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message },
      });
    }
  }
}

export default new ContentConfigController();
