import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware';
import { StripeController } from './stripe.controller';

const controller = new StripeController();

export async function stripeRoutes(app: FastifyInstance) {
  app.post('/stripe/create-checkout-session', {
    preHandler: requireAuth,
    handler: controller.createCheckoutSession.bind(controller),
  });

  app.post('/stripe/webhook', {
    config: {
      // Need raw body for webhook signature verification
      rawBody: true,
    },
    handler: controller.webhook.bind(controller),
  });
}
