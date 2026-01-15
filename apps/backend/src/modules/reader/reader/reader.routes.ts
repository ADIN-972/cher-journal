import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { ReaderController } from './reader.controller';

const controller = new ReaderController();

export async function readerRoutes(app: FastifyInstance) {
  app.get('/reader/volume-version', {
    preHandler: requireAuth,
    handler: controller.getVolumeVersion.bind(controller),
  });

  app.get('/reader/volume-versions/:versionId/render', {
    preHandler: requireAuth,
    handler: controller.renderVolumeText.bind(controller),
  });
}
