import prisma from '../../lib/prisma';
import { config } from '@cher-journal/config';
import Stripe from 'stripe';
import { OrderType, OrderStatus, EntitlementVersionScope, EntitlementSource } from '@prisma/client';
import { priceSchemaService } from '../admin/price-schemas/price-schemas.service';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16' as any,
});

interface CreateCheckoutOptions {
  userId: string;
  chapterId: string;
  type: OrderType;
  volumeNumber?: number;  // For VOLUME type orders
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

    // Get pricing from database
    const prices = await priceSchemaService.getChapterPrices(options.chapterId);

    // Get user's existing entitlements for this chapter
    const existingEntitlements = await prisma.entitlement.findMany({
      where: {
        userId: options.userId,
        chapterId: options.chapterId,
      },
    });

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

      // Check if user already has access
      const hasEntitlement = existingEntitlements.some(
        (ent) => options.volumeNumber! >= ent.volumeFrom && options.volumeNumber! <= ent.volumeTo
      );

      if (hasEntitlement) {
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
    } else if (options.type === OrderType.CHAPTER) {
      // Calculate total bundle price and subtract already owned volumes
      let bundleOriginalPrice = 0;
      let alreadyAccessiblePrice = 0;

      chapter.volumes.forEach((volume: any) => {
        if (!volume.isFree) {
          let volumePrice = 0;

          if (volume.volumeNumber <= 8) {
            volumePrice = prices.priceFreeToRead;
          } else if (volume.volumeNumber <= 10) {
            volumePrice = prices.pricePaywall;
          } else {
            volumePrice = prices.priceEpilogue;
          }

          bundleOriginalPrice += volumePrice;

          // Check if user already has access to this volume
          // Entitlements use volumeFrom and volumeTo to define a range
          const hasEntitlement = existingEntitlements.some(
            (ent) => volume.volumeNumber >= ent.volumeFrom && volume.volumeNumber <= ent.volumeTo
          );
          if (hasEntitlement) {
            alreadyAccessiblePrice += volumePrice;
          }
        }
      });

      // Subtract already owned volumes, then apply 25% discount
      const remainingPrice = bundleOriginalPrice - alreadyAccessiblePrice;
      let discountedPrice = Math.round(remainingPrice * 0.75);

      // Ensure minimum price of 50 cents
      if (discountedPrice < 50) {
        discountedPrice = 50;
      }

      // Debug logs
      console.log('[Stripe Debug] bundleOriginalPrice:', bundleOriginalPrice);
      console.log('[Stripe Debug] alreadyAccessiblePrice:', alreadyAccessiblePrice);
      console.log('[Stripe Debug] remainingPrice:', remainingPrice);
      console.log('[Stripe Debug] discountedPrice:', discountedPrice);
      console.log('[Stripe Debug] prices:', prices);
      console.log('[Stripe Debug] chapter.volumes:', chapter.volumes.length);
      console.log('[Stripe Debug] existingEntitlements:', existingEntitlements);

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${chapter.title} - Full Chapter`,
            description: options.versionScope === EntitlementVersionScope.ALL
              ? 'Narrator + Protagonist perspectives'
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
        versionScope: options.versionScope || EntitlementVersionScope.BASE,
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

    const { orderId, userId, chapterId, orderType, versionScope, volumeNumber } = metadata;
    console.log('[Stripe Webhook] Metadata:', { orderId, userId, chapterId, orderType, volumeNumber });

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

      // Check if user already has an entitlement for this volume
      const existingEntitlement = await prisma.entitlement.findFirst({
        where: {
          userId,
          chapterId,
          volumeFrom: { lte: volNum },
          volumeTo: { gte: volNum },
        },
      });

      if (existingEntitlement) {
        console.log('[Stripe Webhook] ℹ️  User already has access to volume', volNum);
      } else {
        // Create new entitlement for this specific volume
        console.log('[Stripe Webhook] Creating entitlement for volume', volNum);
        await prisma.entitlement.create({
          data: {
            userId,
            chapterId,
            volumeFrom: volNum,
            volumeTo: volNum,
            versionScope: versionScope as EntitlementVersionScope || EntitlementVersionScope.BASE,
            source: EntitlementSource.PURCHASE,
          },
        });
        console.log('[Stripe Webhook] ✅ Volume entitlement created');
      }

      // Create unlock for this volume (immediately accessible)
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
              versionScope: versionScope as EntitlementVersionScope,
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
              versionScope: versionScope as EntitlementVersionScope,
              source: EntitlementSource.PURCHASE,
            },
          });
          console.log('[Stripe Webhook] ✅ Entitlement created');
        }

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
}
