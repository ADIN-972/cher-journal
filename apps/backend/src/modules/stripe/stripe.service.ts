import prisma from '../../lib/prisma';
import { config } from '@cher-journal/config';
import Stripe from 'stripe';
import { OrderType, OrderStatus, EntitlementVersionScope, EntitlementSource } from '@prisma/client';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-11-20.acacia',
});

interface CreateCheckoutOptions {
  userId: string;
  chapterId: string;
  type: OrderType;
  versionScope?: EntitlementVersionScope;
  successUrl: string;
  cancelUrl: string;
}

export class StripeService {
  async createCheckoutSession(options: CreateCheckoutOptions) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: options.chapterId },
      include: { volumes: true },
    });

    if (!chapter) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // Determine line items based on order type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    if (options.type === OrderType.CHAPTER) {
      const price = options.versionScope === EntitlementVersionScope.ALL ? 2999 : 1999; // $29.99 or $19.99
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${chapter.title} - Full Chapter`,
            description: options.versionScope === EntitlementVersionScope.ALL 
              ? 'Narrator + Protagonist perspectives'
              : 'Narrator perspective only',
          },
          unit_amount: price,
        },
        quantity: 1,
      });
    }

    // Create order record
    const order = await prisma.order.create({
      data: {
        userId: options.userId,
        type: options.type,
        status: OrderStatus.PENDING,
        provider: 'stripe',
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: {
        orderId: order.id,
        userId: options.userId,
        chapterId: options.chapterId,
        orderType: options.type,
        versionScope: options.versionScope || EntitlementVersionScope.BASE,
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerSessionId: session.id,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Check idempotence
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existingEvent) {
      return { processed: false, reason: 'duplicate' };
    }

    // Record event
    await prisma.webhookEvent.create({
      data: {
        provider: 'stripe',
        eventId: event.id,
        type: event.type,
      },
    });

    // Handle event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { processed: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    if (!metadata) return;

    const { orderId, userId, chapterId, orderType, versionScope } = metadata;

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        providerPaymentIntentId: session.payment_intent as string,
        currency: session.currency || 'usd',
        amountTotal: session.amount_total,
      },
    });

    // Grant entitlement
    if (orderType === 'CHAPTER') {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { volumes: true },
      });

      if (chapter && chapter.volumes.length > 0) {
        const minVolume = Math.min(...chapter.volumes.map(v => v.volumeNumber));
        const maxVolume = Math.max(...chapter.volumes.map(v => v.volumeNumber));

        await prisma.entitlement.create({
          data: {
            userId,
            chapterId,
            volumeFrom: minVolume,
            volumeTo: maxVolume,
            versionScope: versionScope as EntitlementVersionScope,
            source: EntitlementSource.PURCHASE,
          },
        });
      }
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Additional payment processing if needed
    console.log('Payment succeeded:', paymentIntent.id);
  }
}
