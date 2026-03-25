import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { DashboardController } from './dashboard.controller';

const controller = new DashboardController();

export async function adminDashboardRoutes(app: FastifyInstance) {
  app.get('/admin/dashboard', {
    preHandler: requireAdmin,
    handler: controller.getStats.bind(controller),
  });

  app.get('/admin/dashboard/kpis', {
    preHandler: requireAdmin,
    handler: controller.getKPIs.bind(controller),
  });

  app.get('/admin/dashboard/insights', {
    preHandler: requireAdmin,
    handler: controller.getInsights.bind(controller),
  });
}
