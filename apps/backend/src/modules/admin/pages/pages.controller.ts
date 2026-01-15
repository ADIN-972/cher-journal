import { FastifyRequest, FastifyReply } from 'fastify';
import { PagesService } from './pages.service';
import { CreatePageInput, UpdatePageOrderInput } from './pages.schemas';

const service = new PagesService();

export class PagesController {
  async listByVersion(
    request: FastifyRequest<{ Params: { volumeVersionId: string } }>,
    reply: FastifyReply
  ) {
    const pages = await service.listByVersion(request.params.volumeVersionId);
    return reply.send({ success: true, data: pages });
  }

  async create(
    request: FastifyRequest<{ Body: CreatePageInput }>,
    reply: FastifyReply
  ) {
    const page = await service.create(request.body);
    return reply.status(201).send({ success: true, data: page });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    await service.delete(request.params.id);
    return reply.send({ success: true, data: { message: 'Page deleted' } });
  }

  async updateOrder(
    request: FastifyRequest<{ Body: UpdatePageOrderInput }>,
    reply: FastifyReply
  ) {
    await service.updateOrder(request.body);
    return reply.send({ success: true, data: { message: 'Order updated' } });
  }
}
