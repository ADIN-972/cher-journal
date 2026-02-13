import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { PromotionsController } from './promotions.controller';

const controller = new PromotionsController();

/**
 * GET /promotions/applicable
 * Fetch promotions applicable to the current user
 * Filters by: date validity, targeting, usage limits, and ownership
 */
export async function promotionsRoutes(app: FastifyInstance) {
  app.get('/promotions/applicable', {
    preHandler: requireAuth,
    handler: controller.getApplicablePromotions.bind(controller),
  });
}
