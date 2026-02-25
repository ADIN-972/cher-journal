import { FastifyRequest, FastifyReply } from 'fastify';
import { SupportService } from './support.service';

const service = new SupportService();

interface SubmitClaimRequest {
  category: 'TECHNICAL' | 'BILLING' | 'CONTENT' | 'OTHER';
  subject: string;
  message: string;
}

export class SupportController {
  async submitClaim(
    request: FastifyRequest<{ Body: SubmitClaimRequest }>,
    reply: FastifyReply
  ) {
    try {
      const claim = await service.createClaim(request.user!.id, request.body);
      return reply.status(201).send({ success: true, data: claim });
    } catch (err: any) {
      console.error('[SupportController] Error submitting claim:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'CLAIM_SUBMISSION_ERROR',
          message: err.message || 'Failed to submit support claim',
        },
      });
    }
  }

  async getUserClaims(request: FastifyRequest, reply: FastifyReply) {
    try {
      const claims = await service.getUserClaims(request.user!.id);
      return reply.send({ success: true, data: claims });
    } catch (err: any) {
      console.error('[SupportController] Error fetching user claims:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'CLAIMS_FETCH_ERROR',
          message: err.message || 'Failed to fetch support claims',
        },
      });
    }
  }
}
