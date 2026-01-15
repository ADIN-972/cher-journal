import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { CatalogController } from './catalog.controller';

const controller = new CatalogController();

export async function catalogRoutes(app: FastifyInstance) {
  app.get('/chapters', {
    preHandler: requireAuth,
    handler: controller.listChapters.bind(controller),
  });

  app.get('/chapters/:id', {
    preHandler: requireAuth,
    handler: controller.getChapter.bind(controller),
  });
}
