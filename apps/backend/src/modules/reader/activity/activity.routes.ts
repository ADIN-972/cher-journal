import { FastifyInstance } from 'fastify';
import { ActivityController } from './activity.controller';
import { requireAuth } from '../../../lib/middleware';

const controller = new ActivityController();

export async function activityRoutes(app: FastifyInstance) {
  // Reading session tracking
  app.post('/reader/reading-session/start', {
    preHandler: [requireAuth],
    handler: controller.startSession.bind(controller),
  });

  app.post('/reader/reading-session/heartbeat', {
    preHandler: [requireAuth],
    handler: controller.heartbeat.bind(controller),
  });

  // User stats
  app.get('/reader/reading-stats', {
    preHandler: [requireAuth],
    handler: controller.getMyStats.bind(controller),
  });

  app.get('/reader/activity', {
    preHandler: [requireAuth],
    handler: controller.getMyActivity.bind(controller),
  });
}
