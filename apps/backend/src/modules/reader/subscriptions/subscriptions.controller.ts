import { FastifyRequest, FastifyReply } from 'fastify';
import { SubscriptionsService } from './subscriptions.service';

const service = new SubscriptionsService();

export class SubscriptionsController {
  async getClubInfo(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const info = await service.getClubInfo();
      return reply.send({ success: true, data: info });
    } catch (error: any) {
      console.error('Error fetching club info:', error);
      throw error;
    }
  }

  async getUserSubscription(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const subscription = await service.getUserSubscription(userId);

      return reply.send({ success: true, data: subscription });
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async createSubscriptionCheckout(
    request: FastifyRequest<{
      Body: {
        successUrl: string;
        cancelUrl: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { successUrl, cancelUrl } = request.body;

      const result = await service.createSubscriptionCheckout(
        userId,
        successUrl,
        cancelUrl
      );

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_PRICE_NOT_CONFIGURED') {
        return reply.status(500).send({
          success: false,
          error: {
            code: 'SUBSCRIPTION_PRICE_NOT_CONFIGURED',
            message: 'Subscription pricing is not configured',
          },
        });
      }
      console.error('Checkout error:', error);
      throw error;
    }
  }

  async cancelSubscription(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const subscription = await service.cancelSubscription(userId);

      return reply.send({ success: true, data: subscription });
    } catch (error: any) {
      if (error.message === 'NO_SUBSCRIPTION') {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription found',
          },
        });
      }
      if (error.message === 'ALREADY_CANCELLED') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'ALREADY_CANCELLED',
            message: 'Subscription is already scheduled for cancellation',
          },
        });
      }
      console.error('Cancel error:', error);
      throw error;
    }
  }
}
