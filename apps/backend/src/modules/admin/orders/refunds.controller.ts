import { FastifyRequest, FastifyReply } from 'fastify';
import { refundsService } from './refunds.service';
import { RefundStatus, RefundType } from '@prisma/client';

export const refundsController = {
  /**
   * POST /admin/refunds
   * Create a new refund
   */
  async createRefund(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        orderId,
        amountRefunded,
        type,
        reason,
        notes,
        revokeEntitlements,
      } = req.body as any;

      // Validation
      if (!orderId || !amountRefunded || !type) {
        return reply.status(400).send({
          error: 'Missing required fields: orderId, amountRefunded, type',
        });
      }

      if (amountRefunded <= 0) {
        return reply.status(400).send({
          error: 'Amount must be greater than 0',
        });
      }

      if (!Object.values(RefundType).includes(type)) {
        return reply.status(400).send({
          error: 'Invalid refund type',
        });
      }

      // Get admin user ID from request (assumes auth middleware sets req.user)
      const refundedBy = (req as any).user?.id;

      const refund = await refundsService.createRefund({
        orderId,
        amountRefunded,
        type,
        reason,
        notes,
        revokeEntitlements,
        refundedBy,
      });

      return reply.status(201).send(refund);
    } catch (error: any) {
      console.error('Error creating refund:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to create refund',
      });
    }
  },

  /**
   * GET /admin/refunds
   * List all refunds with filters
   */
  async listRefunds(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        orderId,
        status,
        type,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query as any;

      const filters: any = {};

      if (orderId) filters.orderId = orderId as string;
      if (status) filters.status = status as RefundStatus;
      if (type) filters.type = type as RefundType;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string, 10);
      if (offset) filters.offset = parseInt(offset as string, 10);

      const result = await refundsService.listRefunds(filters);

      return reply.send(result);
    } catch (error: any) {
      console.error('Error listing refunds:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to list refunds',
      });
    }
  },

  /**
   * GET /admin/refunds/:id
   * Get a specific refund by ID
   */
  async getRefundById(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;

      if (!id) {
        return reply.status(400).send({ error: 'Refund ID is required' });
      }

      const refund = await refundsService.getRefundById(id);

      return reply.send(refund);
    } catch (error: any) {
      console.error('Error getting refund:', error);

      if (error.message === 'Refund not found') {
        return reply.status(404).send({ error: 'Refund not found' });
      }

      return reply.status(500).send({
        error: error.message || 'Failed to get refund',
      });
    }
  },

  /**
   * GET /admin/orders/:orderId/refunds
   * Get all refunds for a specific order
   */
  async getRefundsByOrderId(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { orderId } = req.params as any;

      if (!orderId) {
        return reply.status(400).send({ error: 'Order ID is required' });
      }

      const refunds = await refundsService.getRefundsByOrderId(orderId);

      // Also get total refunded and remaining amount
      const totalRefunded = await refundsService.getTotalRefunded(orderId);

      return reply.send({
        refunds,
        totalRefunded,
      });
    } catch (error: any) {
      console.error('Error getting refunds for order:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to get refunds',
      });
    }
  },

  /**
   * POST /admin/refunds/:id/cancel
   * Cancel a pending refund
   */
  async cancelRefund(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;

      if (!id) {
        return reply.status(400).send({ error: 'Refund ID is required' });
      }

      const refund = await refundsService.cancelRefund(id);

      return reply.send(refund);
    } catch (error: any) {
      console.error('Error cancelling refund:', error);

      if (error.message === 'Refund not found') {
        return reply.status(404).send({ error: 'Refund not found' });
      }

      return reply.status(500).send({
        error: error.message || 'Failed to cancel refund',
      });
    }
  },

  /**
   * GET /admin/refunds/stats
   * Get refund statistics
   */
  async getRefundStats(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = req.query as any;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await refundsService.getRefundStats(
        filters.startDate,
        filters.endDate
      );

      return reply.send(stats);
    } catch (error: any) {
      console.error('Error getting refund stats:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to get refund stats',
      });
    }
  },
};
