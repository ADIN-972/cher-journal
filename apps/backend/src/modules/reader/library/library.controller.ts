import { FastifyRequest, FastifyReply } from 'fastify';
import { LibraryService } from './library.service';

const service = new LibraryService();

export class LibraryController {
  async getLibrary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const library = await service.getLibrary(request.user!.id);
      return reply.send({ success: true, data: library });
    } catch (err: any) {
      console.error('[LibraryController] Error fetching library:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'LIBRARY_FETCH_ERROR',
          message: err.message || 'Failed to fetch library',
        },
      });
    }
  }
}
