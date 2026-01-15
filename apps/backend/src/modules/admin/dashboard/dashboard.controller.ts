import { FastifyRequest, FastifyReply } from 'fastify';
import { DashboardService } from './dashboard.service';

const service = new DashboardService();

export class DashboardController {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await service.getStats();
    return reply.send({
      success: true,
      data: stats,
    });
  }
}
