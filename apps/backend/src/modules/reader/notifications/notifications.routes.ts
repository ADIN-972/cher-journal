import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { NotificationPreferencesController } from './notifications.controller';

const controller = new NotificationPreferencesController();

export async function readerNotificationRoutes(app: FastifyInstance) {
  // Notification preferences
  app.get('/me/notification-preferences', {
    preHandler: requireAuth,
    handler: controller.getPreferences.bind(controller),
  });

  app.put('/me/notification-preferences', {
    preHandler: requireAuth,
    handler: controller.updatePreferences.bind(controller),
  });

  // Push token management
  app.post('/me/push-token', {
    preHandler: requireAuth,
    handler: controller.savePushToken.bind(controller),
  });

  app.delete('/me/push-token', {
    preHandler: requireAuth,
    handler: controller.removePushToken.bind(controller),
  });

  // Test notification
  app.post('/me/test-notification', {
    preHandler: requireAuth,
    handler: controller.sendTestNotification.bind(controller),
  });
}
