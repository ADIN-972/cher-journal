import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { PromotionsController } from './promotions.controller';

const controller = new PromotionsController();

/**
 * GET /promotions/applicable
 * Fetch promotions applicable to the current user
 * Filters by: date validity, targeting, usage limits, and ownership
 */

/**
 * GET /promotions/applied
 * Fetch promotions already applied by the current user
 */

/**
 * POST /promotions/use/:promotionId
 * Apply a promotion to the user's account
 */
export async function promotionsRoutes(app: FastifyInstance) {
  app.get('/promotions/applicable', {
    preHandler: requireAuth,
    handler: controller.getApplicablePromotions.bind(controller),
  });

  app.get('/promotions/applied', {
    preHandler: requireAuth,
    handler: controller.getAppliedPromotions.bind(controller),
  });

  app.post('/promotions/use/:promotionId', {
    preHandler: requireAuth,
    handler: controller.usePromotion.bind(controller),
  });
}
