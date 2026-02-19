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
  characterCount?: number;
  // NEVER expose: text, textBlobId, textBlob
}

function sanitizeVolumeVersion(version: any): VolumeVersionDTO {
  return {
    id: version.id,
    volumeId: version.volumeId,
    perspective: version.perspective,
    illustrationAssetId: version.illustrationAssetId,
    createdAt: version.createdAt,
    characterCount: version.characterCount,
    // Explicitly NOT including: text, textBlob, textBlobId
  };
}

export class ReaderController {
  /**
   * Get volume text by volumeId (automatically finds the right version)
   */
  async getVolumeTextByVolumeId(
    request: FastifyRequest<{
      Params: { volumeId: string };
      Querystring: { perspective?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const perspective = (request.query.perspective || 'NARRATOR') as Perspective;

      const volumeData = await service.getVolumeTextByVolumeId(
        request.params.volumeId,
        request.user!.id,
        perspective
      );

      return reply.send({ success: true, data: volumeData });
    } catch (error: any) {
      if (error.message === 'VOLUME_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VOLUME_NOT_FOUND', message: 'Volume not found' },
        });
      }
      if (error.message === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VERSION_NOT_FOUND', message: 'Version not found for this perspective' },
        });
      }
      if (error.message === 'NO_ACCESS') {
        return reply.status(403).send({
          success: false,
          error: { code: 'NO_ACCESS', message: 'No access to this volume' },
        });
      }
      if (error.message === 'NO_TEXT') {
        return reply.status(404).send({
          success: false,
          error: { code: 'NO_TEXT', message: 'No text available for this version' },
        });
      }
      throw error;
    }
  }

  async getVolumeText(
    request: FastifyRequest<{
      Params: { versionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const volumeData = await service.getVolumeText(
        request.params.versionId,
        request.user!.id
      );

      return reply.send({ success: true, data: volumeData });
    } catch (error: any) {
      if (error.message === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VERSION_NOT_FOUND', message: 'Version not found' },
        });
      }
      if (error.message === 'NO_ACCESS') {
        return reply.status(403).send({
          success: false,
          error: { code: 'NO_ACCESS', message: 'No access to this volume' },
        });
      }
      if (error.message === 'NO_TEXT') {
        return reply.status(404).send({
          success: false,
          error: { code: 'NO_TEXT', message: 'No text available for this version' },
        });
      }
      throw error;
    }
  }

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

      // Track volume read (no automatic unlock creation)
      await service.trackVolumeRead(
        request.user!.id,
        request.query.chapterId,
        volumeNumber
      );

      // SECURITY: Sanitize response to exclude text fields
      const sanitizedVersion = sanitizeVolumeVersion(version);

      return reply.send({
        success: true,
        data: sanitizedVersion,
      });
    } catch (error: any) {
      if (error.message === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VERSION_NOT_FOUND', message: 'Version not found' },
        });
      }
      if (error.message === 'VOLUME_NOT_AVAILABLE') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VOLUME_NOT_AVAILABLE', message: 'Volume is not available yet or not published' },
        });
      }
      throw error;
    }
  }

  /**
   * Mark that user reached 65% scroll (enables canStartWait for next volume)
   */
  async markCanStartWait(
    request: FastifyRequest<{
      Body: {
        chapterId: string;
        volumeNumber: number;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      await service.markCanStartWait(
        request.user!.id,
        request.body.chapterId,
        request.body.volumeNumber
      );

      return reply.send({ success: true });
    } catch (error: any) {
      if (error.message === 'VOLUME_NOT_READ') {
        return reply.status(400).send({
          success: false,
          error: { code: 'VOLUME_NOT_READ', message: 'Volume not read yet' }
        });
      }
      if (error.message === 'READ_TOO_FAST') {
        return reply.status(400).send({
          success: false,
          error: { code: 'READ_TOO_FAST', message: 'Volume read too quickly - potential hack attempt' }
        });
      }
      if (error.message === 'INVALID_VOLUME_FOR_WAIT') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_VOLUME_FOR_WAIT', message: 'Only volumes 1-7 can enable wait for next volume' }
        });
      }
      throw error;
    }
  }

  /**
   * Update reading progress for a volume
   */
  async updateProgress(
    request: FastifyRequest<{
      Body: {
        chapterId: string;
        volumeNumber: number;
        progress: number;
        perspective?: 'NARRATOR' | 'PROTAGONIST';
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.updateProgress(
        request.user!.id,
        request.body.chapterId,
        request.body.volumeNumber,
        request.body.progress,
        request.body.perspective || 'NARRATOR'
      );

      return reply.send(result);
    } catch (error: any) {
      if (error.message === 'INVALID_PROGRESS') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_PROGRESS', message: 'Progress must be between 0 and 100' }
        });
      }
      throw error;
    }
  }
}
