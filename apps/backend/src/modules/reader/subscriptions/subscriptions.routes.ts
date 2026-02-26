import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { SubscriptionsController } from './subscriptions.controller';

const controller = new SubscriptionsController();

export async function readerSubscriptionsRoutes(app: FastifyInstance) {
  app.get('/me/subscription', {
    preHandler: requireAuth,
    handler: controller.getUserSubscription.bind(controller),
  });

  app.post('/stripe/create-subscription-checkout', {
    preHandler: requireAuth,
    handler: controller.createSubscriptionCheckout.bind(controller),
  });

  app.post('/me/subscription/cancel', {
    preHandler: requireAuth,
    handler: controller.cancelSubscription.bind(controller),
  });
}
