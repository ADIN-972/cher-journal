import { FastifyRequest, FastifyReply } from 'fastify';
import { SupportService } from './support.service';

const service = new SupportService();

export class SupportController {
  async submitClaim(
    request: FastifyRequest<{
      Body: { category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER'; subject: string; message: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.createClaim(request.user!.id, request.body);
      return reply.status(201).send({ success: true, data: claim });
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        error: { code: 'CLAIM_SUBMISSION_ERROR', message: err.message },
      });
    }
  }

  async getUserClaims(request: FastifyRequest, reply: FastifyReply) {
    try {
      const claims = await service.getUserClaims(request.user!.id);
      return reply.send({ success: true, data: claims });
    } catch (err: any) {
      return reply.code(500).send({
        success: false,
        error: { code: 'CLAIMS_FETCH_ERROR', message: err.message },
      });
    }
  }

  async getClaimMessages(
    request: FastifyRequest<{ Params: { claimId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.getClaimWithMessages(
        request.params.claimId,
        request.user!.id
      );
      return reply.send({ success: true, data: claim });
    } catch (err: any) {
      if (err.message === 'CLAIM_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: { code: 'CLAIM_NOT_FOUND', message: 'Réclamation non trouvée' },
        });
      }
      return reply.code(500).send({
        success: false,
        error: { code: 'FETCH_ERROR', message: err.message },
      });
    }
  }

  async addMessage(
    request: FastifyRequest<{
      Params: { claimId: string };
      Body: { content: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const message = await service.addUserMessage(
        request.params.claimId,
        request.user!.id,
        request.body.content
      );
      return reply.status(201).send({ success: true, data: message });
    } catch (err: any) {
      if (err.message === 'CLAIM_NOT_FOUND') {
        return reply.code(404).send({
          success: false,
          error: { code: 'CLAIM_NOT_FOUND', message: 'Réclamation non trouvée' },
        });
      }
      if (err.message === 'CLAIM_CLOSED') {
        return reply.code(400).send({
          success: false,
          error: { code: 'CLAIM_CLOSED', message: 'Ce ticket est fermé' },
        });
      }
      return reply.code(500).send({
        success: false,
        error: { code: 'MESSAGE_ERROR', message: err.message },
      });
    }
  }
}
