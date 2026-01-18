import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { schedulingController } from './scheduling.controller';

export async function schedulingRoutes(app: FastifyInstance) {
  // Schedule a publication
  app.post('/admin/scheduling/schedule', {
    preHandler: requireAdmin,
    handler: schedulingController.schedulePublication.bind(schedulingController),
  });

  // Schedule bulk publications
  app.post('/admin/scheduling/schedule-bulk', {
    preHandler: requireAdmin,
    handler: schedulingController.scheduleBulkPublication.bind(schedulingController),
  });

  // Cancel scheduled publication
  app.delete('/admin/scheduling/schedule/:entityType/:entityId', {
    preHandler: requireAdmin,
    handler: schedulingController.cancelScheduledPublication.bind(schedulingController),
  });

  // Get all scheduled items
  app.get('/admin/scheduling/scheduled', {
    preHandler: requireAdmin,
    handler: schedulingController.getScheduledItems.bind(schedulingController),
  });

  // Get calendar view
  app.get('/admin/scheduling/calendar', {
    preHandler: requireAdmin,
    handler: schedulingController.getCalendarView.bind(schedulingController),
  });

  // Manually process scheduled publications (for testing)
  app.post('/admin/scheduling/process', {
    preHandler: requireAdmin,
    handler: schedulingController.processScheduledPublications.bind(schedulingController),
  });
}
