import prisma from '../../../lib/prisma';
import { config } from '@cher-journal/config';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';
import { SubscriptionData } from '@cher-journal/types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16' as any,
});

export class SubscriptionsService {
  /**
   * Get current user's subscription status
   */
  async getUserSubscription(userId: string): Promise<SubscriptionData | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status as any,
      planName: subscription.planName,
      priceAmountCents: subscription.priceAmountCents,
      currency: subscription.currency,
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  /**
   * Create a Stripe Checkout session for subscription purchase
   */
  async createSubscriptionCheckout(
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string | null }> {
    if (!config.stripe.subscriptionPriceId) {
      throw new Error('SUBSCRIPTION_PRICE_NOT_CONFIGURED');
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: config.stripe.subscriptionPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      // Pass userId to subscription metadata so webhook can identify user
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Cancel user's active subscription at period end
   */
  async cancelSubscription(userId: string): Promise<SubscriptionData> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new Error('NO_SUBSCRIPTION');
    }

    if (subscription.cancelAtPeriodEnd) {
      throw new Error('ALREADY_CANCELLED');
    }

    // Update Stripe subscription to cancel at period end
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update local subscription record
    const updated = await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return {
      id: updated.id,
      status: updated.status as any,
      planName: updated.planName,
      priceAmountCents: updated.priceAmountCents,
      currency: updated.currency,
      currentPeriodEnd: updated.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
    };
  }
}
