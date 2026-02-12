import { FastifyRequest, FastifyReply } from 'fastify';
import { WaitService } from './wait.service';
import { StartWaitInput, GetWaitStatusInput } from './wait.schemas';

const service = new WaitService();

export class WaitController {
  async startWait(
    request: FastifyRequest<{ Body: StartWaitInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.startWait(request.user!.id, request.body);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'VOLUME_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'VOLUME_NOT_FOUND', message: 'Volume not found' },
        });
      }
      if (error.message === 'NO_ACCESS') {
        return reply.status(403).send({
          success: false,
          error: { code: 'NO_ACCESS', message: 'No access to this volume' },
        });
      }
      if (error.message === 'WAIT_ALREADY_ACTIVE') {
        return reply.status(409).send({
          success: false,
          error: { code: 'WAIT_ALREADY_ACTIVE', message: 'A wait is already active for this chapter' },
        });
      }
      throw error;
    }
  }

  async getWaitStatus(
    request: FastifyRequest<{ Querystring: GetWaitStatusInput }>,
    reply: FastifyReply
  ) {
    const result = await service.getWaitStatus(request.user!.id, request.query);
    return reply.send({ success: true, data: result });
  }

  async listActiveWaits(request: FastifyRequest, reply: FastifyReply) {
    const waits = await service.listActiveWaits(request.user!.id);
    return reply.send({ success: true, data: waits });
  }

  async listCompletedWaits(request: FastifyRequest, reply: FastifyReply) {
    const waits = await service.listCompletedWaits(request.user!.id);
    return reply.send({ success: true, data: waits });
  }

  async listAllWaits(request: FastifyRequest, reply: FastifyReply) {
    const waits = await service.listAllWaits(request.user!.id);
    return reply.send({ success: true, data: waits });
  }
}
