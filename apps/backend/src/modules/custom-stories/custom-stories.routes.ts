import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware';
import { CustomStoriesController } from './custom-stories.controller';

const controller = new CustomStoriesController();

export async function customStoriesRoutes(app: FastifyInstance) {
  // Photo upload endpoint (organized by story ID when available)
  // Can accept storyId as route parameter or query parameter
  app.post('/custom-stories/photos/upload', {
    preHandler: requireAuth,
    handler: controller.uploadPhoto.bind(controller),
  });

  // Alternative: upload to specific story (bypasses temp folder)
  app.post('/custom-stories/:storyId/photos/upload', {
    preHandler: requireAuth,
    handler: controller.uploadPhoto.bind(controller),
  });

  // User routes
  app.post('/custom-stories', {
    preHandler: requireAuth,
    handler: controller.create.bind(controller),
  });

  app.put('/custom-stories/:id', {
    preHandler: requireAuth,
    handler: controller.update.bind(controller),
  });

  app.get('/custom-stories/:id', {
    preHandler: requireAuth,
    handler: controller.getStory.bind(controller),
  });

  app.get('/custom-stories', {
    preHandler: requireAuth,
    handler: controller.listStories.bind(controller),
  });

  app.post('/custom-stories/:id/submit', {
    preHandler: requireAuth,
    handler: controller.submitStory.bind(controller),
  });

  app.delete('/custom-stories/:id', {
    preHandler: requireAuth,
    handler: controller.cancelStory.bind(controller),
  });

  // Admin routes
  app.get('/admin/custom-stories/stats', {
    preHandler: requireAuth,
    handler: controller.adminGetStats.bind(controller),
  });

  app.get('/admin/custom-stories', {
    preHandler: requireAuth,
    handler: controller.adminListAll.bind(controller),
  });

  app.get('/admin/custom-stories/pending', {
    preHandler: requireAuth,
    handler: controller.adminListPending.bind(controller),
  });

  app.post('/admin/custom-stories/:id/approve', {
    preHandler: requireAuth,
    handler: controller.adminApprove.bind(controller),
  });

  app.post('/admin/custom-stories/:id/reject', {
    preHandler: requireAuth,
    handler: controller.adminReject.bind(controller),
  });

  app.post('/admin/custom-stories/:id/under-review', {
    preHandler: requireAuth,
    handler: controller.adminUnderReview.bind(controller),
  });
}
