import prisma from '../../lib/prisma';
import { config } from '@cher-journal/config';
import Stripe from 'stripe';
import { OrderType, OrderStatus, EntitlementSource, UnlockTriggeredBy, SubscriptionStatus } from '@prisma/client';
import { priceSchemaService } from '../admin/price-schemas/price-schemas.service';
import { AccessControlService, SUBSCRIBER_PROTAGONIST_DISCOUNT } from '../../lib/accessControl';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16' as any,
});

interface CreateCheckoutOptions {
  userId: string;
  chapterId: string;
  type: OrderType;
  volumeNumber?: number;  // For VOLUME type orders
  scopes?: string[];       // Entitlement scopes to grant (e.g. ['BASE'] or ['BASE','POV'])
  successUrl: string;
  cancelUrl: string;
}

export class StripeService {
  private accessControl = new AccessControlService();

  async createCheckoutSession(options: CreateCheckoutOptions) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: options.chapterId },
      include: { volumes: true },
    });

    if (!chapter) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // Get pricing from database
    const prices = await priceSchemaService.getChapterPrices(options.chapterId);

    // Determine line items based on order type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (options.type === OrderType.VOLUME) {
      // Handle individual volume purchase
      if (!options.volumeNumber) {
        throw new Error('VOLUME_NUMBER_REQUIRED');
      }

      const volume = chapter.volumes.find((v: any) => v.volumeNumber === options.volumeNumber);
      if (!volume) {
        throw new Error('VOLUME_NOT_FOUND');
      }

      // Determine volume price based on volume type
      let volumePrice = 0;
      let volumeTypeLabel = '';

      if (volume.isFree) {
        // Free volumes can't be purchased
        throw new Error('VOLUME_IS_FREE');
      } else if (volume.volumeNumber <= 8) {
        volumePrice = prices.priceFreeToRead;
        volumeTypeLabel = 'Free-to-Read Volume';
      } else if (volume.volumeNumber <= 10) {
        volumePrice = prices.pricePaywall;
        volumeTypeLabel = 'Paywall Volume';
      } else {
        volumePrice = prices.priceEpilogue;
        volumeTypeLabel = 'Epilogue Volume';
      }

      // Check if user already PURCHASED this volume
      // Allow purchase even if user has FREE entitlement (from wait-to-read)
      const entitlement = await this.accessControl.getUserEntitlement(
        options.userId,
        options.chapterId
      );

      if (
        entitlement &&
        entitlement.source === EntitlementSource.PURCHASE &&
        options.volumeNumber! >= entitlement.volumeFrom &&
        options.volumeNumber! <= entitlement.volumeTo
      ) {
        throw new Error('USER_ALREADY_HAS_ACCESS');
      }

      if (volumePrice < 50) {
        throw new Error('INVALID_AMOUNT: Le montant calculé est inférieur à 0.50€');
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Volume ${options.volumeNumber} (${volumeTypeLabel})`,
            description: `Unlock single volume ${options.volumeNumber} from "${chapter.title}"`,
          },
          unit_amount: volumePrice,
        },
        quantity: 1,
      });
    } else if (options.type === OrderType.PERSPECTIVE) {
      // Handle protagonist perspective unlock
      if (!options.volumeNumber) {
        throw new Error('VOLUME_NUMBER_REQUIRED');
      }

      const volume = chapter.volumes.find((v: any) => v.volumeNumber === options.volumeNumber);
      if (!volume) {
        throw new Error('VOLUME_NOT_FOUND');
      }

      // Check if user has access to this volume
      const canAccessVolume = await this.accessControl.canAccessVolume(
        options.userId,
        options.chapterId,
        options.volumeNumber,
        'NARRATOR' as any
      );

      if (!canAccessVolume.hasAccess) {
        throw new Error('NO_VOLUME_ACCESS');
      }

      // Check if user already has protagonist access
      const canAccessProtagonist = await this.accessControl.canAccessVolume(
        options.userId,
        options.chapterId,
        options.volumeNumber,
        'PROTAGONIST' as any
      );

      if (canAccessProtagonist.hasAccess) {
        throw new Error('ALREADY_HAS_PROTAGONIST_ACCESS');
      }

      // Get protagonist unlock price
      let protagonistPrice = prices.priceProtagonistUnlock || 99;

      // Club Privé subscribers get 30% discount on protagonist purchases
      const isSubscriber = await this.accessControl.hasActiveSubscription(options.userId);
      if (isSubscriber) {
        protagonistPrice = Math.round(protagonistPrice * (1 - SUBSCRIBER_PROTAGONIST_DISCOUNT));
        console.log(`[Stripe] Subscriber discount applied: -${SUBSCRIBER_PROTAGONIST_DISCOUNT * 100}% → ${protagonistPrice} cents`);
      }

      if (protagonistPrice < 50) {
        throw new Error('INVALID_AMOUNT: Le montant calculé est inférieur à 0.50€');
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Volume ${options.volumeNumber} - Perspective Protagoniste${isSubscriber ? ' (Club -30%)' : ''}`,
            description: `Unlock protagonist perspective for volume ${options.volumeNumber}${isSubscriber ? ' — Club Privé discount applied' : ''}`,
          },
          unit_amount: protagonistPrice,
        },
        quantity: 1,
      });
    } else if (options.type === OrderType.CHAPTER) {
      // Calculate total bundle price and subtract already owned volumes
      let bundleOriginalPrice = 0;
      let alreadyAccessiblePrice = 0;

      // Get user's entitlements for this chapter (for bundle pricing calculation)
      const entitlement = await this.accessControl.getUserEntitlement(
        options.userId,
        options.chapterId
      );

      // For PROTAGONIST perspective (POV scope), calculate price based on non-accessible volumes for that perspective
      const isProtagonistBundle = options.scopes?.includes('POV') ?? false;

      // For PROTAGONIST bundles, we need to check which volumes are already accessible for that perspective
      for (const volume of chapter.volumes) {
        if (!volume.isFree) {
          let volumePrice = 0;

          if (isProtagonistBundle) {
            // For PROTAGONIST: All volumes cost the same (priceProtagonistUnlock)
            volumePrice = prices.priceProtagonistUnlock || 99;
          } else {
            // For NARRATOR: Price varies by volume type
            if (volume.volumeNumber <= 8) {
              volumePrice = prices.priceFreeToRead;
            } else if (volume.volumeNumber <= 10) {
              volumePrice = prices.pricePaywall;
            } else {
              volumePrice = prices.priceEpilogue;
            }
          }

          bundleOriginalPrice += volumePrice;

          if (isProtagonistBundle) {
            // For PROTAGONIST: Check if user has access to this volume for PROTAGONIST perspective
            const protagonistAccess = await this.accessControl.getVolumeAccessInfo(
              options.userId,
              options.chapterId,
              volume.volumeNumber,
              'PROTAGONIST' as any
            );

            if (protagonistAccess.isAccessible) {
              alreadyAccessiblePrice += volumePrice;
            }
          } else {
            // For NARRATOR: Check if user already PURCHASED this volume
            // Only count PURCHASE entitlements (not free wait-to-read ones)
            const hasPurchasedVolume =
              entitlement &&
              entitlement.source === EntitlementSource.PURCHASE &&
              volume.volumeNumber >= entitlement.volumeFrom &&
              volume.volumeNumber <= entitlement.volumeTo;

            if (hasPurchasedVolume) {
              alreadyAccessiblePrice += volumePrice;
            }
          }
        }
      }

      // Subtract already owned volumes (no discount applied)
      const remainingPrice = bundleOriginalPrice - alreadyAccessiblePrice;
      let discountedPrice = remainingPrice;

      // Club Privé subscribers get 30% discount on protagonist bundle purchases
      let subscriberDiscountApplied = false;
      if (isProtagonistBundle) {
        const isSubscriber = await this.accessControl.hasActiveSubscription(options.userId);
        if (isSubscriber) {
          discountedPrice = Math.round(discountedPrice * (1 - SUBSCRIBER_PROTAGONIST_DISCOUNT));
          subscriberDiscountApplied = true;
          console.log(`[Stripe] Subscriber discount on protagonist bundle: -${SUBSCRIBER_PROTAGONIST_DISCOUNT * 100}% → ${discountedPrice} cents`);
        }
      }

      // Ensure minimum price of 50 cents
      if (discountedPrice < 50) {
        discountedPrice = 50;
      }

      // Debug logs
      console.log('[Stripe Debug] bundleOriginalPrice:', bundleOriginalPrice);
      console.log('[Stripe Debug] alreadyAccessiblePrice:', alreadyAccessiblePrice);
      console.log('[Stripe Debug] remainingPrice:', remainingPrice);
      console.log('[Stripe Debug] discountedPrice (after min check):', discountedPrice);
      console.log('[Stripe Debug] prices:', prices);
      console.log('[Stripe Debug] chapter.volumes:', chapter.volumes.length);

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Full Chapter${subscriberDiscountApplied ? ' (Club -30%)' : ''}`,
            description: options.scopes?.includes('POV')
              ? `Protagonist perspective${subscriberDiscountApplied ? ' — Club Privé discount applied' : ''}`
              : 'Narrator perspective only',
          },
          unit_amount: discountedPrice,
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
        refId: options.chapterId, // Reference to the purchased content
        volumeNumber: options.volumeNumber || undefined, // For VOLUME type orders
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
        scopes: (options.scopes || ['BASE']).join(','),
        ...(options.volumeNumber && { volumeNumber: String(options.volumeNumber) }),
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

  /**
   * Create checkout session for PROTAGONIST purchases
   * Always uses versionScope="ALL" and priceProtagonistUnlock
   * Ignores isFree flag since PROTAGONIST volumes are never free
   */
  async createProtagonistCheckoutSession(options: {
    userId: string;
    chapterId: string;
    type: OrderType;
    volumeNumber?: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    // Fetch chapter with all volumes
    const chapter = await prisma.chapter.findUnique({
      where: { id: options.chapterId },
      include: {
        volumes: {
          orderBy: { volumeNumber: 'asc' },
        },
      },
    });

    if (!chapter) {
      throw new Error('CHAPTER_NOT_FOUND');
    }

    // Get pricing from database
    const prices = await priceSchemaService.getChapterPrices(options.chapterId);

    // Determine line items based on order type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (options.type === OrderType.VOLUME) {
      // Handle individual PROTAGONIST volume purchase
      if (!options.volumeNumber) {
        throw new Error('VOLUME_NUMBER_REQUIRED');
      }

      const volume = chapter.volumes.find((v: any) => v.volumeNumber === options.volumeNumber);
      if (!volume) {
        throw new Error('VOLUME_NOT_FOUND');
      }

      // PROTAGONIST volumes always cost priceProtagonistUnlock (ignore isFree)
      let volumePrice = prices.priceProtagonistUnlock || 99;

      // Check if user already has PROTAGONIST access to this volume
      const protagonistAccess = await this.accessControl.getVolumeAccessInfo(
        options.userId,
        options.chapterId,
        options.volumeNumber,
        'PROTAGONIST' as any
      );

      if (protagonistAccess.isAccessible) {
        throw new Error('USER_ALREADY_HAS_ACCESS');
      }

      // Club Privé subscribers get 30% discount on protagonist purchases
      const isSubscriber = await this.accessControl.hasActiveSubscription(options.userId);
      if (isSubscriber) {
        volumePrice = Math.round(volumePrice * (1 - SUBSCRIBER_PROTAGONIST_DISCOUNT));
        console.log(`[Stripe] Subscriber discount on protagonist volume: -${SUBSCRIBER_PROTAGONIST_DISCOUNT * 100}% → ${volumePrice} cents`);
      }

      if (volumePrice < 50) {
        throw new Error(`INVALID_AMOUNT: Le montant calculé est inférieur à 0.50€ (${volumePrice})`);
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Volume ${options.volumeNumber} (Protagoniste)${isSubscriber ? ' (Club -30%)' : ''}`,
            description: `Unlock PROTAGONIST perspective for volume ${options.volumeNumber}${isSubscriber ? ' — Club Privé discount applied' : ''}`,
          },
          unit_amount: volumePrice,
        },
        quantity: 1,
      });
    } else if (options.type === OrderType.CHAPTER) {
      // Handle full chapter PROTAGONIST purchase (all volumes)
      const protagonistPrice = prices.priceProtagonistUnlock || 99;
      let bundleOriginalPrice = 0;
      let alreadyAccessiblePrice = 0;

      // Calculate which volumes need to be purchased
      for (const volume of chapter.volumes) {
        if (!volume.isFree) {
          // PROTAGONIST volumes cost priceProtagonistUnlock
          bundleOriginalPrice += protagonistPrice;

          // Check if user already has PROTAGONIST access
          const protagonistAccess = await this.accessControl.getVolumeAccessInfo(
            options.userId,
            options.chapterId,
            volume.volumeNumber,
            'PROTAGONIST' as any
          );

          if (protagonistAccess.isAccessible) {
            alreadyAccessiblePrice += protagonistPrice;
          }
        }
      }

      // Subtract already owned volumes (no discount applied)
      const remainingPrice = bundleOriginalPrice - alreadyAccessiblePrice;
      let discountedPrice = remainingPrice;

      // Club Privé subscribers get 30% discount on protagonist bundle
      const isSubscriber = await this.accessControl.hasActiveSubscription(options.userId);
      if (isSubscriber) {
        discountedPrice = Math.round(discountedPrice * (1 - SUBSCRIBER_PROTAGONIST_DISCOUNT));
        console.log(`[Stripe] Subscriber discount on protagonist chapter bundle: -${SUBSCRIBER_PROTAGONIST_DISCOUNT * 100}% → ${discountedPrice} cents`);
      }

      // Ensure minimum price of 50 cents
      if (discountedPrice < 50) {
        discountedPrice = 50;
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Full Chapter (Protagoniste)${isSubscriber ? ' (Club -30%)' : ''}`,
            description: `PROTAGONIST perspective for all volumes${isSubscriber ? ' — Club Privé discount applied' : ''}`,
          },
          unit_amount: discountedPrice,
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
        refId: options.chapterId,
        volumeNumber: options.volumeNumber || undefined,
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
        scopes: 'BASE,POV',
        perspective: 'PROTAGONIST',
        ...(options.volumeNumber && { volumeNumber: String(options.volumeNumber) }),
      },
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { providerSessionId: session.id },
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
    console.log(`[Stripe Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('[Stripe Webhook] Checkout session completed');
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        console.log('[Stripe Webhook] ✅ Checkout processing completed');
        break;

      case 'payment_intent.succeeded':
        console.log('[Stripe Webhook] Payment intent succeeded');
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('[Stripe Webhook] Subscription event');
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        console.log('[Stripe Webhook] Subscription deleted');
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return { processed: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    if (!metadata) {
      console.log('[Stripe Webhook] No metadata in session');
      return;
    }

    const { orderId, userId, chapterId, orderType, scopes: scopesStr, volumeNumber } = metadata;
    const scopes: string[] = scopesStr ? scopesStr.split(',') : ['BASE'];
    console.log('[Stripe Webhook] Metadata:', { orderId, userId, chapterId, orderType, scopes, volumeNumber });

    // Update order
    console.log('[Stripe Webhook] Updating order status to PAID...');
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        providerPaymentIntentId: session.payment_intent as string,
        currency: session.currency || 'eur',
        amountTotal: session.amount_total,
      },
    });
    console.log('[Stripe Webhook] ✅ Order updated');

    // Grant entitlement
    if (orderType === 'VOLUME') {
      // Handle individual volume purchase
      if (!volumeNumber) {
        console.log('[Stripe Webhook] ❌ Missing volumeNumber for VOLUME purchase');
        return;
      }

      const volNum = parseInt(volumeNumber as string, 10);
      console.log('[Stripe Webhook] Granting volume entitlement for volume', volNum);

      // Check if user already has a PURCHASE entitlement for this volume
      const existingPurchaseEntitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId,
          volumeFrom: { lte: volNum },
          volumeTo: { gte: volNum },
          source: EntitlementSource.PURCHASE,
        },
      });

      if (!existingPurchaseEntitlement) {
        // Create new PURCHASE entitlement for this specific volume
        // (don't update existing FREE entitlements, just add a PURCHASE one)
        console.log('[Stripe Webhook] Creating PURCHASE entitlement for volume', volNum);
        await prisma.entitlement.create({
          data: {
            userId,
            chapterId,
            volumeFrom: volNum,
            volumeTo: volNum,
            scopes,
            source: EntitlementSource.PURCHASE,
          },
        });
        console.log('[Stripe Webhook] ✅ PURCHASE entitlement created for volume', volNum);
      } else {
        console.log('[Stripe Webhook] ℹ️  User already has PURCHASE access to volume', volNum);
      }

      // Create/update unlock for this volume (immediately accessible)
      const existingUnlock = await prisma.unlock.findUnique({
        where: {
          userId_chapterId_volumeNumber: {
            userId,
            chapterId,
            volumeNumber: volNum,
          },
        },
      });

      if (!existingUnlock) {
        await prisma.unlock.create({
          data: {
            userId,
            chapterId,
            volumeNumber: volNum,
            unlocksAt: new Date(), // Unlock immediately
            triggeredBy: 'PURCHASE',
          },
        });
        console.log('[Stripe Webhook] ✅ Unlock created for volume', volNum);
      } else if (existingUnlock.triggeredBy === UnlockTriggeredBy.WAIT) {
        // Replace wait-triggered unlock with purchase unlock (immediate access)
        console.log('[Stripe Webhook] Replacing WAIT unlock with PURCHASE unlock');
        await prisma.unlock.update({
          where: {
            userId_chapterId_volumeNumber: {
              userId,
              chapterId,
              volumeNumber: volNum,
            },
          },
          data: {
            unlocksAt: new Date(), // Unlock immediately
            triggeredBy: 'PURCHASE',
          },
        });
        console.log('[Stripe Webhook] ✅ Unlock updated to PURCHASE with immediate access');
      }
    } else if (orderType === 'PERSPECTIVE') {
      // Handle protagonist perspective unlock
      if (!volumeNumber) {
        console.log('[Stripe Webhook] ❌ Missing volumeNumber for PERSPECTIVE purchase');
        return;
      }

      const volNum = parseInt(volumeNumber as string, 10);
      console.log('[Stripe Webhook] Granting protagonist perspective for volume', volNum);

      // Find existing entitlement for this volume
      const existingEntitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId,
          volumeFrom: { lte: volNum },
          volumeTo: { gte: volNum },
        },
      });

      if (existingEntitlement) {
        // Update existing entitlement to include POV scope
        console.log('[Stripe Webhook] Updating entitlement scopes to include POV');
        const updatedScopes = [...new Set([...(existingEntitlement.scopes || ['BASE']), 'POV'])];
        await prisma.entitlement.update({
          where: { id: existingEntitlement.id },
          data: {
            scopes: updatedScopes,
          },
        });
        console.log('[Stripe Webhook] ✅ Entitlement updated with protagonist perspective');
      } else {
        console.log('[Stripe Webhook] ⚠️  No entitlement found for volume', volNum);
        // This shouldn't happen if checks were done correctly on checkout creation
        throw new Error('NO_ENTITLEMENT_FOR_PERSPECTIVE_UNLOCK');
      }
    } else if (orderType === 'CHAPTER') {
      console.log('[Stripe Webhook] Granting chapter entitlement...');
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { volumes: true },
      });

      if (chapter && chapter.volumes.length > 0) {
        const minVolume = Math.min(...chapter.volumes.map(v => v.volumeNumber));
        const maxVolume = Math.max(...chapter.volumes.map(v => v.volumeNumber));
        console.log('[Stripe Webhook] Volume range:', { minVolume, maxVolume });

        // Check if user already has an entitlement (e.g., from wait-to-read)
        const existingEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId,
            chapterId,
          },
        });

        if (existingEntitlement) {
          // Update existing entitlement to PURCHASE (upgrade from free wait-to-read)
          console.log('[Stripe Webhook] Updating existing entitlement to PURCHASE');
          await prisma.entitlement.update({
            where: { id: existingEntitlement.id },
            data: {
              source: EntitlementSource.PURCHASE,
              volumeFrom: minVolume,
              volumeTo: maxVolume,
              scopes,
            },
          });
          console.log('[Stripe Webhook] ✅ Entitlement updated');
        } else {
          // Create new entitlement
          console.log('[Stripe Webhook] Creating new entitlement');
          await prisma.entitlement.create({
            data: {
              userId,
              chapterId,
              volumeFrom: minVolume,
              volumeTo: maxVolume,
              scopes,
              source: EntitlementSource.PURCHASE,
            },
          });
          console.log('[Stripe Webhook] ✅ Entitlement created');
        }

        // Clear all wait-to-read timers (unlock future dates) for this chapter
        // Since user now has full access to the chapter, any pending wait timers should be removed
        console.log('[Stripe Webhook] Clearing wait-to-read timers for chapter...');
        const now = new Date();
        const futureUnlocks = await prisma.unlock.deleteMany({
          where: {
            userId,
            chapterId,
            unlocksAt: { gt: now }, // Delete unlocks that are still in the future
          },
        });
        console.log(`[Stripe Webhook] ✅ Cleared ${futureUnlocks.count} pending wait-to-read timers`);

        // Create initial unlock for volume 1 (immediately accessible)
        console.log('[Stripe Webhook] Creating unlock for volume 1...');
        const existingUnlock = await prisma.unlock.findUnique({
          where: {
            userId_chapterId_volumeNumber: {
              userId,
              chapterId,
              volumeNumber: 1,
            },
          },
        });

        if (!existingUnlock) {
          await prisma.unlock.create({
            data: {
              userId,
              chapterId,
              volumeNumber: 1,
              unlocksAt: new Date(), // Unlock immediately
              triggeredBy: 'PURCHASE',
            },
          });
          console.log('[Stripe Webhook] ✅ Unlock created for volume 1');
        } else {
          console.log('[Stripe Webhook] ℹ️  Unlock for volume 1 already exists');
        }
      }
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Additional payment processing if needed
    console.log('Payment succeeded:', paymentIntent.id);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    const userId = stripeSubscription.metadata?.userId;
    if (!userId) {
      console.log('[Stripe Webhook] ❌ No userId in subscription metadata');
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELLED,
      trialing: SubscriptionStatus.TRIALING,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };

    const status = statusMap[stripeSubscription.status] ?? SubscriptionStatus.INCOMPLETE;
    const priceItem = stripeSubscription.items.data[0];

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer as string,
        status,
        planName: 'Premium',
        priceAmountCents: priceItem?.price?.unit_amount ?? 0,
        currency: (priceItem?.price?.currency ?? 'eur').toUpperCase(),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer as string,
        status,
        priceAmountCents: priceItem?.price?.unit_amount ?? 0,
        currency: (priceItem?.price?.currency ?? 'eur').toUpperCase(),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        cancelledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : undefined,
      },
    });

    console.log('[Stripe Webhook] ✅ Subscription updated/created for user:', userId);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    console.log('[Stripe Webhook] ✅ Subscription deleted/cancelled');
  }
}
