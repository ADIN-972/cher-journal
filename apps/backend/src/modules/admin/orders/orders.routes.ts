import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { OrdersController } from './orders.controller';

const controller = new OrdersController();

export async function adminOrdersRoutes(app: FastifyInstance) {
  app.get('/admin/orders', {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.get('/admin/orders/:id', {
    preHandler: requireAdmin,
    handler: controller.getById.bind(controller),
  });
}
