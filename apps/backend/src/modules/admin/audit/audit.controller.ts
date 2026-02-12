import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService, AuditFilters } from './audit.service';

const service = new AuditService();

interface QueryParams extends AuditFilters {}

export class AuditController {
  async list(
    request: FastifyRequest<{ Querystring: QueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const result = await service.list(filters);
      return reply.send({ success: true, data: result.logs, total: result.total });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'AUDIT_LIST_FAILED', message: error.message },
      });
    }
  }

  async exportCSV(
    request: FastifyRequest<{ Querystring: QueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const csvContent = await service.exportToCSV(filters);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit_logs_${timestamp}.csv`;

      reply.header('Content-Type', 'text/csv; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      const bom = '\uFEFF';
      return reply.send(bom + csvContent);
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'EXPORT_FAILED', message: error.message },
      });
    }
  }
}
