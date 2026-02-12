import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware';
import { StripeController } from './stripe.controller';

const controller = new StripeController();

export async function stripeRoutes(app: FastifyInstance) {
  app.post('/stripe/create-checkout-session', {
    preHandler: requireAuth,
    handler: controller.createCheckoutSession.bind(controller),
  });

  // Create a sub-plugin for webhook with custom content parser
  await app.register(async (webhookPlugin) => {
    // Add custom content type parser that preserves raw body
    webhookPlugin.addContentTypeParser('application/json', { parseAs: 'buffer' }, async (req: any, body: Buffer) => {
      // Store raw body for Stripe webhook verification
      req.rawBody = body.toString('utf8');
      // Parse and return JSON for normal handling
      return JSON.parse(req.rawBody);
    });

    webhookPlugin.post('/stripe/webhook', {
      handler: controller.webhook.bind(controller),
    });
  });
}


