import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { refundsController } from './refunds.controller';

export async function refundsRoutes(app: FastifyInstance) {
  // Create a refund
  app.post('/admin/refunds', {
    preHandler: requireAdmin,
    handler: refundsController.createRefund.bind(refundsController),
  });

  // List all refunds
  app.get('/admin/refunds', {
    preHandler: requireAdmin,
    handler: refundsController.listRefunds.bind(refundsController),
  });

  // Get refund statistics
  app.get('/admin/refunds/stats', {
    preHandler: requireAdmin,
    handler: refundsController.getRefundStats.bind(refundsController),
  });

  // Get refunds for a specific order
  app.get('/admin/orders/:orderId/refunds', {
    preHandler: requireAdmin,
    handler: refundsController.getRefundsByOrderId.bind(refundsController),
  });

  // Get a specific refund
  app.get('/admin/refunds/:id', {
    preHandler: requireAdmin,
    handler: refundsController.getRefundById.bind(refundsController),
  });

  // Cancel a pending refund
  app.post('/admin/refunds/:id/cancel', {
    preHandler: requireAdmin,
    handler: refundsController.cancelRefund.bind(refundsController),
  });
}
