import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { PagesController } from './pages.controller';
import { createPageSchema, updatePageOrderSchema } from './pages.schemas';

const controller = new PagesController();

export async function adminPagesRoutes(app: FastifyInstance) {
  app.get('/admin/volume-versions/:volumeVersionId/pages', {
    preHandler: requireAdmin,
    handler: controller.listByVersion.bind(controller),
  });

  app.post('/admin/pages', {
    preHandler: requireAdmin,
    // schema: { body: createPageSchema },
    handler: controller.create.bind(controller),
  });

  app.delete('/admin/pages/:id', {
    preHandler: requireAdmin,
    handler: controller.delete.bind(controller),
  });

  app.post('/admin/pages/reorder', {
    preHandler: requireAdmin,
    // schema: { body: updatePageOrderSchema },
    handler: controller.updateOrder.bind(controller),
  });
}
