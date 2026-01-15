import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { LibraryController } from './library.controller';

const controller = new LibraryController();

export async function libraryRoutes(app: FastifyInstance) {
  app.get('/library', {
    preHandler: requireAuth,
    handler: controller.getLibrary.bind(controller),
  });
}
