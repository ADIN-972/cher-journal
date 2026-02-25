import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { SupportController } from './support.controller';

const controller = new SupportController();

export async function readerSupportRoutes(app: FastifyInstance) {
  app.post('/support/claim', {
    preHandler: requireAuth,
    handler: controller.submitClaim.bind(controller),
  });

  app.get('/support/my-claims', {
    preHandler: requireAuth,
    handler: controller.getUserClaims.bind(controller),
  });
}
