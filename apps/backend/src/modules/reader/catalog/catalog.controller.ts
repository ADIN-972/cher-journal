import { FastifyRequest, FastifyReply } from 'fastify';
import { CatalogService } from './catalog.service';

const service = new CatalogService();

export class CatalogController {
  async listChapters(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    const chapters = await service.listChapters(userId);
    return reply.send({ success: true, data: chapters });
  }

  async getChapter(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user?.id;
      const chapter = await service.getChapter(request.params.id, userId);
      return reply.send({ success: true, data: chapter });
    } catch (error: any) {
      if (error.message === 'CHAPTER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CHAPTER_NOT_FOUND', message: 'Chapter not found' },
        });
      }
      throw error;
    }
  }
}
