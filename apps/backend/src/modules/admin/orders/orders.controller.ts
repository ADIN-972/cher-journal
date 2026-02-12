import { FastifyRequest, FastifyReply } from 'fastify';
import { OrdersService } from './orders.service';
import { OrderStatus, OrderType } from '@prisma/client';

const service = new OrdersService();

interface ExportQueryParams {
  status?: OrderStatus;
  type?: OrderType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export class OrdersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const orders = await service.list();
    return reply.send({ success: true, data: orders });
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const order = await service.getById(request.params.id);
      return reply.send({ success: true, data: order });
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
        });
      }
      throw error;
    }
  }

  async exportCSV(
    request: FastifyRequest<{ Querystring: ExportQueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const csvContent = await service.exportToCSV(filters);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `commandes_${timestamp}.csv`;

      // Set headers for CSV download with UTF-8 BOM for Excel compatibility
      reply.header('Content-Type', 'text/csv; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);

      // Add BOM for Excel to recognize UTF-8
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
