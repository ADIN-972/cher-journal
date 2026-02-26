import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { ReaderController } from './reader.controller';

const controller = new ReaderController();

export async function readerRoutes(app: FastifyInstance) {
  app.get('/reader/volume-version', {
    preHandler: requireAuth,
    handler: controller.getVolumeVersion.bind(controller),
  });

  // Get text by volumeId (finds the appropriate version automatically)
  app.get('/reader/volumes/:volumeId/text', {
    preHandler: requireAuth,
    handler: controller.getVolumeTextByVolumeId.bind(controller),
  });

  app.get('/reader/volume-versions/:versionId/text', {
    preHandler: requireAuth,
    handler: controller.getVolumeText.bind(controller),
  });

  app.get('/reader/volume-versions/:versionId/render', {
    preHandler: requireAuth,
    handler: controller.renderVolumeText.bind(controller),
  });

  // Mark 65% scroll progress (enables canStartWait for next volume)
  app.post('/reader/mark-can-start-wait', {
    preHandler: requireAuth,
    handler: controller.markCanStartWait.bind(controller),
  });

  // Update reading progress (0-100%)
  app.post('/reader/update-progress', {
    preHandler: requireAuth,
    handler: controller.updateProgress.bind(controller),
  });

  // Get coloring assets for a chapter (with optional tag filter)
  app.get('/chapters/:chapterId/assets', {
    preHandler: requireAuth,
    handler: controller.getChapterColoringAssets.bind(controller),
  });
}
