import { FastifyRequest, FastifyReply } from 'fastify';
import { LibraryService } from './library.service';

const service = new LibraryService();

export class LibraryController {
  async getLibrary(request: FastifyRequest, reply: FastifyReply) {
    const library = await service.getLibrary(request.user!.id);
    return reply.send({ success: true, data: library });
  }
}
