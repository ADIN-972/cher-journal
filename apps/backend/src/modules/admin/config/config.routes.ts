import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { ConfigController } from './config.controller';

const controller = new ConfigController();

export async function adminConfigRoutes(app: FastifyInstance) {
  // List all configurations (filtered)
  app.get('/admin/config', {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  // Get single configuration by key
  app.get('/admin/config/:key', {
    preHandler: requireAdmin,
    handler: controller.getByKey.bind(controller),
  });

  // Update configuration
  app.put('/admin/config', {
    preHandler: requireAdmin,
    handler: controller.update.bind(controller),
  });

  // Initialize default configurations
  app.post('/admin/config/initialize', {
    preHandler: requireAdmin,
    handler: controller.initialize.bind(controller),
  });

  // Get payment config (public endpoint for frontend)
  app.get('/config/payment', {
    handler: controller.getPaymentConfig.bind(controller),
  });

  // Get wait-to-read config (public endpoint for frontend)
  app.get('/config/wait', {
    handler: controller.getWaitConfig.bind(controller),
  });
}
