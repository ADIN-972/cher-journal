import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware';
import { StripeController } from './stripe.controller';

const controller = new StripeController();

export async function stripeRoutes(app: FastifyInstance) {
  app.post('/stripe/create-checkout-session', {
    preHandler: requireAuth,
    handler: controller.createCheckoutSession.bind(controller),
  });

  // PROTAGONIST-specific checkout (always uses priceProtagonistUnlock, ignores isFree)
  app.post('/stripe/create-protagonist-checkout-session', {
    preHandler: requireAuth,
    handler: controller.createProtagonistCheckoutSession.bind(controller),
  });

  // Register webhook route with custom parser to preserve raw body for Stripe signature verification
  await app.register(async (webhookPlugin) => {
    // Custom parser that preserves raw body exactly as received from Stripe
    webhookPlugin.addContentTypeParser('application/json', { parseAs: 'string' }, async (req: any, payload: string) => {
      // Store the exact raw body string for Stripe webhook signature verification
      req.rawBody = payload;
      // Parse and return JSON for request handling
      return JSON.parse(payload);
    });

    webhookPlugin.post('/stripe/webhook', {
      handler: controller.webhook.bind(controller),
    });
  });
}


