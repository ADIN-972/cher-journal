import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { WaitController } from './wait.controller';
import { startWaitSchema, getWaitStatusSchema } from './wait.schemas';

const controller = new WaitController();

export async function waitRoutes(app: FastifyInstance) {
  app.post('/wait/start', {
    preHandler: requireAuth,
    // schema: { body: startWaitSchema },
    handler: controller.startWait.bind(controller),
  });

  app.get('/wait/status', {
    preHandler: requireAuth,
    // schema: { querystring: getWaitStatusSchema },
    handler: controller.getWaitStatus.bind(controller),
  });

  app.get('/wait/active', {
    preHandler: requireAuth,
    handler: controller.listActiveWaits.bind(controller),
  });
}
