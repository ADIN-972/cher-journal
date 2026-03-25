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

  async getKPIs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const kpis = await service.getKPIs();
      return reply.send({
        success: true,
        data: kpis,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch KPIs',
        },
      });
    }
  }

  async getInsights(request: FastifyRequest, reply: FastifyReply) {
    try {
      const insights = await service.getInsights();
      return reply.send({ success: true, data: insights });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to fetch insights' },
      });
    }
  }
}
