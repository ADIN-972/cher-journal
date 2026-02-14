import { FastifyInstance } from 'fastify';
import { requireAuth, requireAdmin } from '../../../lib/middleware';
import contentConfigController from './content-config.controller';

export async function contentConfigRoutes(app: FastifyInstance) {
  /**
   * GET /admin/content-config/moment-selection
   * Get current moment selection chapter
   */
  app.get('/admin/content-config/moment-selection', {
    preHandler: [requireAuth, requireAdmin],
    handler: contentConfigController.getMomentSelection.bind(contentConfigController),
  });

  /**
   * POST /admin/content-config/moment-selection
   * Set moment selection chapter (SUPERADMIN only)
   * Body: { chapterId: string | null }
   */
  app.post('/admin/content-config/moment-selection', {
    preHandler: [requireAuth, requireAdmin],
    handler: contentConfigController.setMomentSelection.bind(contentConfigController),
  });
}
