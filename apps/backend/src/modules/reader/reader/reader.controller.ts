import { FastifyRequest, FastifyReply } from 'fastify';
import { ReaderService } from './reader.service';
import { Perspective } from '@prisma/client';

const service = new ReaderService();

// DTO to filter sensitive fields from VolumeVersion response
interface VolumeVersionDTO {
  id: string;
  volumeId: string;
  perspective: Perspective;
  illustrationAssetId: string | null;
  createdAt: Date;
  // NEVER expose: text, textBlobId, textBlob
}

function sanitizeVolumeVersion(version: any): VolumeVersionDTO {
  return {
    id: version.id,
    volumeId: version.volumeId,
    perspective: version.perspective,
    illustrationAssetId: version.illustrationAssetId,
    createdAt: version.createdAt,
    // Explicitly NOT including: text, textBlob, textBlobId
  };
}

export class ReaderController {
  async renderVolumeText(
    request: FastifyRequest<{
      Params: { versionId: string };
      Querystring: {
        fontSize?: string;
        fontFamily?: string;
        width?: string;
        lineHeight?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      // Get version and check access by versionId
      const versionWithVolume = await service.getVolumeVersionById(request.params.versionId);

      // Check access
      const hasAccess = await service.canAccessVolume(
        request.user!.id,
        versionWithVolume.volume.chapterId,
        versionWithVolume.volume.volumeNumber,
        versionWithVolume.perspective
      );

      if (!hasAccess) {
        return reply.status(403).send({
          success: false,
          error: { code: 'NO_ACCESS', message: 'No access to this volume' },
        });
      }

      const imageBuffer = await service.renderVolumeText(request.params.versionId, {
        fontSize: request.query.fontSize ? parseInt(request.query.fontSize, 10) : undefined,
        fontFamily: request.query.fontFamily,
        width: request.query.width ? parseInt(request.query.width, 10) : undefined,
        lineHeight: request.query.lineHeight ? parseFloat(request.query.lineHeight) : undefined,
      });

      reply.type('image/png');
      return reply.send(imageBuffer);
    } catch (error: any) {
      if (error.message === 'NO_TEXT') {
        return reply.status(404).send({
          success: false,
          error: { code: 'NO_TEXT', message: 'No text available for this version' },
        });
      }
      if (error.message === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VERSION_NOT_FOUND', message: 'Version not found' },
        });
      }
      throw error;
    }
  }

  async getVolumeVersion(
    request: FastifyRequest<{
      Querystring: {
        chapterId: string;
        volumeNumber: string;
        perspective: Perspective;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const volumeNumber = parseInt(request.query.volumeNumber, 10);
      
      // Check access
      const hasAccess = await service.canAccessVolume(
        request.user!.id,
        request.query.chapterId,
        volumeNumber,
        request.query.perspective
      );

      if (!hasAccess) {
        return reply.status(403).send({
          success: false,
          error: { code: 'NO_ACCESS', message: 'No access to this volume' },
        });
      }

      const version = await service.getVolumeVersion(
        request.query.chapterId,
        volumeNumber,
        request.query.perspective
      );

      // SECURITY: Sanitize response to exclude text fields
      const sanitizedVersion = sanitizeVolumeVersion(version);

      return reply.send({ success: true, data: sanitizedVersion });
    } catch (error: any) {
      if (error.message === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VERSION_NOT_FOUND', message: 'Version not found' },
        });
      }
      throw error;
    }
  }
}
