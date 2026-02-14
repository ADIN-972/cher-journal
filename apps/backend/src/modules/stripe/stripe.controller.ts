import { FastifyRequest, FastifyReply } from 'fastify';
import { StripeService } from './stripe.service';
import { OrderType, EntitlementVersionScope } from '@prisma/client';

const service = new StripeService();

export class StripeController {
  async createCheckoutSession(
    request: FastifyRequest<{
      Body: {
        chapterId: string;
        type: OrderType;
        volumeNumber?: number;  // For VOLUME type orders
        versionScope?: EntitlementVersionScope;
        successUrl: string;
        cancelUrl: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.createCheckoutSession({
        userId: request.user!.id,
        ...request.body,
      });

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'CHAPTER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CHAPTER_NOT_FOUND', message: 'Chapter not found' },
        });
      }
      if (error.message === 'VOLUME_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VOLUME_NOT_FOUND', message: 'Volume not found' },
        });
      }
      if (error.message === 'VOLUME_NUMBER_REQUIRED') {
        return reply.status(400).send({
          success: false,
          error: { code: 'VOLUME_NUMBER_REQUIRED', message: 'Volume number is required for VOLUME order type' },
        });
      }
      if (error.message === 'VOLUME_IS_FREE') {
        return reply.status(400).send({
          success: false,
          error: { code: 'VOLUME_IS_FREE', message: 'This volume is free and does not need to be purchased' },
        });
      }
      if (error.message === 'USER_ALREADY_HAS_ACCESS') {
        return reply.status(400).send({
          success: false,
          error: { code: 'USER_ALREADY_HAS_ACCESS', message: 'You already have access to this volume' },
        });
      }
      if (error.message.startsWith('INVALID_AMOUNT')) {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_AMOUNT', message: error.message },
        });
      }
      throw error;
    }
  }

  async webhook(request: FastifyRequest, reply: FastifyReply) {
    const signature = request.headers['stripe-signature'] as string;

    if (!signature) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_SIGNATURE', message: 'Missing Stripe signature' },
      });
    }

    try {
      const rawBody = (request as any).rawBody;
      if (!rawBody) {
        return reply.status(400).send({
          success: false,
          error: { code: 'MISSING_RAW_BODY', message: 'Missing raw body for signature verification' },
        });
      }

      const result = await service.handleWebhook(rawBody, signature);

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      console.error('Webhook error:', error);
      return reply.status(400).send({
        success: false,
        error: { code: 'WEBHOOK_ERROR', message: error.message },
      });
    }
  }
}
