import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { AuditController } from './audit.controller';

const controller = new AuditController();

export async function adminAuditRoutes(app: FastifyInstance) {
  app.get('/admin/audit-logs', {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.get('/admin/audit-logs/export', {
    preHandler: requireAdmin,
    handler: controller.exportCSV.bind(controller),
  });
}
