import { PrismaClient, RefundStatus, RefundType, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

// Initialize Stripe (you'll need to configure this with your keys)
// For now, we'll use a conditional initialization
let stripe: Stripe | null = null;

const initStripe = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey && !stripe) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
};

export interface CreateRefundInput {
  orderId: string;
  amountRefunded: number; // in cents
  type: RefundType;
  reason?: string;
  notes?: string;
  revokeEntitlements?: boolean;
  refundedBy?: string; // Admin user ID
}

export interface RefundFilters {
  orderId?: string;
  status?: RefundStatus;
  type?: RefundType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export const refundsService = {
  /**
   * Create and process a refund
   */
  async createRefund(input: CreateRefundInput) {
    const {
      orderId,
      amountRefunded,
      type,
      reason,
      notes,
      revokeEntitlements = true,
      refundedBy,
    } = input;

    // 1. Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PAID) {
      throw new Error('Can only refund paid orders');
    }

    // 2. Validate refund amount
    const totalRefunded = await this.getTotalRefunded(orderId);
    const remainingAmount = (order.amountTotal || 0) - totalRefunded;

    if (amountRefunded > remainingAmount) {
      throw new Error(
        `Refund amount (${amountRefunded}) exceeds remaining refundable amount (${remainingAmount})`
      );
    }

    // 3. Create refund record
    const refund = await prisma.refund.create({
      data: {
        orderId,
        amountRefunded,
        currency: order.currency || 'eur',
        type,
        status: RefundStatus.PENDING,
        reason,
        notes,
        revokeEntitlements,
        refundedBy,
      },
    });

    // 4. Process Stripe refund (if payment intent exists)
    try {
      // If no payment intent, mark as completed immediately (manual refund)
      if (!order.providerPaymentIntentId) {
        console.warn(`No payment intent for order ${orderId}, marking refund as completed without Stripe processing`);

        await prisma.refund.update({
          where: { id: refund.id },
          data: {
            status: RefundStatus.COMPLETED,
            processedAt: new Date(),
            notes: notes
              ? `${notes}\n\n[Note: Remboursement manuel - aucun payment intent Stripe]`
              : '[Note: Remboursement manuel - aucun payment intent Stripe]',
          },
        });
      } else {
        // Process via Stripe
        const stripeInstance = initStripe();

        if (!stripeInstance) {
          throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
        }

        const stripeRefund = await stripeInstance.refunds.create({
          payment_intent: order.providerPaymentIntentId,
          amount: amountRefunded,
          reason: reason ? 'requested_by_customer' : undefined,
          metadata: {
            orderId: order.id,
            refundId: refund.id,
          },
        });

        // 5. Update refund with Stripe info
        await prisma.refund.update({
          where: { id: refund.id },
          data: {
            status: RefundStatus.COMPLETED,
            providerRefundId: stripeRefund.id,
            processedAt: new Date(),
          },
        });
      }

      // 6. Update order status if fully refunded
      const newTotalRefunded = totalRefunded + amountRefunded;
      if (newTotalRefunded >= (order.amountTotal || 0)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.REFUNDED },
        });
      }

      // 7. Revoke entitlements if requested
      if (revokeEntitlements) {
        await this.revokeEntitlementsForOrder(orderId);
      }

      return this.getRefundById(refund.id);
    } catch (error: any) {
      // Update refund status to FAILED
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: RefundStatus.FAILED,
          failureReason: error.message || 'Unknown error',
        },
      });

      throw new Error(`Failed to process refund: ${error.message}`);
    }
  },

  /**
   * Get total amount refunded for an order
   */
  async getTotalRefunded(orderId: string): Promise<number> {
    const refunds = await prisma.refund.findMany({
      where: {
        orderId,
        status: RefundStatus.COMPLETED,
      },
    });

    return refunds.reduce((sum, refund) => sum + refund.amountRefunded, 0);
  },

  /**
   * Revoke entitlements for an order
   */
  async revokeEntitlementsForOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Delete entitlements that were granted from this purchase
    // Note: This is a simplified implementation. You may need to track
    // which entitlements were granted by which order for more precision
    await prisma.entitlement.deleteMany({
      where: {
        userId: order.userId,
        source: 'PURCHASE',
        grantedAt: {
          gte: order.createdAt,
        },
      },
    });

    return true;
  },

  /**
   * Get refund by ID
   */
  async getRefundById(id: string) {
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    return refund;
  },

  /**
   * List refunds with filters
   */
  async listRefunds(filters: RefundFilters = {}) {
    const {
      orderId,
      status,
      type,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const where: any = {};

    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.refundedAt = {};
      if (startDate) where.refundedAt.gte = startDate;
      if (endDate) where.refundedAt.lte = endDate;
    }

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { refundedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.refund.count({ where }),
    ]);

    return {
      refunds,
      total,
      limit,
      offset,
    };
  },

  /**
   * Get refunds for a specific order
   */
  async getRefundsByOrderId(orderId: string) {
    return prisma.refund.findMany({
      where: { orderId },
      orderBy: { refundedAt: 'desc' },
    });
  },

  /**
   * Cancel a pending refund
   */
  async cancelRefund(refundId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new Error('Can only cancel pending refunds');
    }

    return prisma.refund.update({
      where: { id: refundId },
      data: { status: RefundStatus.CANCELLED },
    });
  },

  /**
   * Get refund statistics
   */
  async getRefundStats(startDate?: Date, endDate?: Date) {
    const where: any = {
      status: RefundStatus.COMPLETED,
    };

    if (startDate || endDate) {
      where.refundedAt = {};
      if (startDate) where.refundedAt.gte = startDate;
      if (endDate) where.refundedAt.lte = endDate;
    }

    const refunds = await prisma.refund.findMany({
      where,
      select: {
        amountRefunded: true,
        type: true,
      },
    });

    const totalRefunded = refunds.reduce(
      (sum, r) => sum + r.amountRefunded,
      0
    );
    const totalCount = refunds.length;
    const fullRefunds = refunds.filter((r) => r.type === RefundType.FULL).length;
    const partialRefunds = refunds.filter(
      (r) => r.type === RefundType.PARTIAL
    ).length;

    return {
      totalRefunded,
      totalCount,
      fullRefunds,
      partialRefunds,
      averageRefund: totalCount > 0 ? totalRefunded / totalCount : 0,
    };
  },
};
