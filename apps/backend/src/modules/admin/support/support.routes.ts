import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { SupportController } from './support.controller';

const controller = new SupportController();

export async function adminSupportRoutes(app: FastifyInstance) {
  app.get('/admin/support-claims', {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.get('/admin/support-claims/:id', {
    preHandler: requireAdmin,
    handler: controller.getById.bind(controller),
  });

  app.patch('/admin/support-claims/:id', {
    preHandler: requireAdmin,
    handler: controller.updateStatus.bind(controller),
  });

  app.post('/admin/support-claims/:id/respond', {
    preHandler: requireAdmin,
    handler: controller.respond.bind(controller),
  });
}
