import { FastifyInstance } from 'fastify';
import { settingsController } from './settings.controller';
import { requireAdmin } from '../../../lib/middleware';

export async function adminSettingsRoutes(app: FastifyInstance) {
  // Get all settings
  app.get('/admin/settings', {
    preHandler: requireAdmin,
    handler: settingsController.getAll.bind(settingsController),
  });

  // Get default prices
  app.get('/admin/settings/defaults/prices', {
    preHandler: requireAdmin,
    handler: settingsController.getDefaultPrices.bind(settingsController),
  });

  // Get specific setting
  app.get('/admin/settings/:key', {
    preHandler: requireAdmin,
    handler: settingsController.getByKey.bind(settingsController),
  });

  // Upsert setting
  app.patch('/admin/settings/:key', {
    preHandler: requireAdmin,
    handler: settingsController.upsert.bind(settingsController),
  });
}
