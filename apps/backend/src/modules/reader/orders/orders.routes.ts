import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { OrdersController } from './orders.controller';

const controller = new OrdersController();

export async function readerOrdersRoutes(app: FastifyInstance) {
  app.get('/orders', {
    preHandler: requireAuth,
    handler: controller.getUserOrders.bind(controller),
  });
}
