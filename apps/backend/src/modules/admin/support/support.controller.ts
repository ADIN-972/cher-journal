import { FastifyRequest, FastifyReply } from 'fastify';
import { SupportService } from './support.service';
import { SupportClaimStatus } from '@prisma/client';

const service = new SupportService();

interface UpdateStatusRequest {
  status: SupportClaimStatus;
}

interface RespondRequest {
  adminNote: string;
}

export class SupportController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const claims = await service.list();
      return reply.send({ success: true, data: claims });
    } catch (err: any) {
      console.error('[SupportController] Error listing claims:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'CLAIMS_FETCH_ERROR',
          message: err.message || 'Failed to fetch support claims',
        },
      });
    }
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.getById(request.params.id);
      return reply.send({ success: true, data: claim });
    } catch (err: any) {
      if (err.message === 'CLAIM_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CLAIM_NOT_FOUND', message: 'Support claim not found' },
        });
      }
      return reply.code(500).send({
        success: false,
        error: {
          code: 'CLAIM_FETCH_ERROR',
          message: err.message || 'Failed to fetch support claim',
        },
      });
    }
  }

  async updateStatus(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateStatusRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.updateStatus(
        request.params.id,
        request.body.status
      );
      return reply.send({ success: true, data: claim });
    } catch (err: any) {
      if (err.message === 'CLAIM_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CLAIM_NOT_FOUND', message: 'Support claim not found' },
        });
      }
      return reply.code(500).send({
        success: false,
        error: {
          code: 'STATUS_UPDATE_ERROR',
          message: err.message || 'Failed to update claim status',
        },
      });
    }
  }

  async respond(
    request: FastifyRequest<{
      Params: { id: string };
      Body: RespondRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.respond(
        request.params.id,
        request.body.adminNote,
        request.user!.id
      );
      return reply.send({ success: true, data: claim });
    } catch (err: any) {
      if (err.message === 'CLAIM_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CLAIM_NOT_FOUND', message: 'Support claim not found' },
        });
      }
      return reply.code(500).send({
        success: false,
        error: {
          code: 'RESPOND_ERROR',
          message: err.message || 'Failed to respond to claim',
        },
      });
    }
  }
}
