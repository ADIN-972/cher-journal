import { FastifyRequest, FastifyReply } from 'fastify';
import { schedulingService } from './scheduling.service';

export const schedulingController = {
  /**
   * POST /admin/scheduling/schedule
   * Schedule a chapter or volume for publication
   */
  async schedulePublication(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId, scheduledFor } = req.body as any;

      if (!entityType || !entityId || !scheduledFor) {
        return reply.status(400).send({
          error: 'Missing required fields: entityType, entityId, scheduledFor',
        });
      }

      if (entityType !== 'chapter' && entityType !== 'volume') {
        return reply.status(400).send({
          error: 'Invalid entityType. Must be "chapter" or "volume"',
        });
      }

      const result = await schedulingService.schedulePublication({
        entityType,
        entityId,
        scheduledFor: new Date(scheduledFor),
      });

      return reply.send(result);
    } catch (error: any) {
      console.error('Error scheduling publication:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to schedule publication',
      });
    }
  },

  /**
   * POST /admin/scheduling/schedule-bulk
   * Schedule multiple entities for publication (bulk)
   */
  async scheduleBulkPublication(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityIds, scheduledFor } = req.body as any;

      if (!entityType || !entityIds || !scheduledFor) {
        return reply.status(400).send({
          error: 'Missing required fields: entityType, entityIds, scheduledFor',
        });
      }

      if (entityType !== 'chapter' && entityType !== 'volume') {
        return reply.status(400).send({
          error: 'Invalid entityType. Must be "chapter" or "volume"',
        });
      }

      if (!Array.isArray(entityIds) || entityIds.length === 0) {
        return reply.status(400).send({
          error: 'entityIds must be a non-empty array',
        });
      }

      const result = await schedulingService.scheduleBulkPublication({
        entityType,
        entityIds,
        scheduledFor: new Date(scheduledFor),
      });

      return reply.send(result);
    } catch (error: any) {
      console.error('Error scheduling bulk publication:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to schedule bulk publication',
      });
    }
  },

  /**
   * DELETE /admin/scheduling/schedule/:entityType/:entityId
   * Cancel scheduled publication
   */
  async cancelScheduledPublication(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId } = req.params as any;

      if (entityType !== 'chapter' && entityType !== 'volume') {
        return reply.status(400).send({
          error: 'Invalid entityType. Must be "chapter" or "volume"',
        });
      }

      const result = await schedulingService.cancelScheduledPublication(
        entityType,
        entityId
      );

      return reply.send(result);
    } catch (error: any) {
      console.error('Error canceling scheduled publication:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to cancel scheduled publication',
      });
    }
  },

  /**
   * GET /admin/scheduling/scheduled
   * Get all scheduled items
   */
  async getScheduledItems(req: FastifyRequest, reply: FastifyReply) {
    try {
      const items = await schedulingService.getScheduledItems();
      return reply.send(items);
    } catch (error: any) {
      console.error('Error getting scheduled items:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to get scheduled items',
      });
    }
  },

  /**
   * GET /admin/scheduling/calendar
   * Get calendar view
   */
  async getCalendarView(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate } = req.query as any;

      if (!startDate || !endDate) {
        return reply.status(400).send({
          error: 'Missing required query parameters: startDate, endDate',
        });
      }

      const calendar = await schedulingService.getCalendarView(
        new Date(startDate),
        new Date(endDate)
      );

      return reply.send(calendar);
    } catch (error: any) {
      console.error('Error getting calendar view:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to get calendar view',
      });
    }
  },

  /**
   * POST /admin/scheduling/process
   * Manually trigger processing of scheduled publications (for testing)
   */
  async processScheduledPublications(req: FastifyRequest, reply: FastifyReply) {
    try {
      const results = await schedulingService.processScheduledPublications();
      return reply.send(results);
    } catch (error: any) {
      console.error('Error processing scheduled publications:', error);
      return reply.status(500).send({
        error: error.message || 'Failed to process scheduled publications',
      });
    }
  },
};
