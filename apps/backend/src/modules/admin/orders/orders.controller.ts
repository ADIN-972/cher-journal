import { FastifyRequest, FastifyReply } from 'fastify';
import { OrdersService } from './orders.service';

const service = new OrdersService();

export class OrdersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const orders = await service.list();
    return reply.send({ success: true, data: orders });
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const order = await service.getById(request.params.id);
      return reply.send({ success: true, data: order });
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
        });
      }
      throw error;
    }
  }
}
