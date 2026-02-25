import { FastifyRequest, FastifyReply } from 'fastify';
import { OrdersService } from './orders.service';

const service = new OrdersService();

export class OrdersController {
  async getUserOrders(request: FastifyRequest, reply: FastifyReply) {
    try {
      const orders = await service.getUserOrders(request.user!.id);
      return reply.send({ success: true, data: orders });
    } catch (err: any) {
      console.error('[OrdersController] Error fetching user orders:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'ORDERS_FETCH_ERROR',
          message: err.message || 'Failed to fetch orders',
        },
      });
    }
  }
}
