import type { FastifyRequest, FastifyReply } from "fastify";
import { priceHistoryService } from "./price-history.service.js";

export const priceHistoryController = {
  async listHistory(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { priceId, startDate, endDate, page, limit } = req.query as any;

      const query = {
        priceId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      };

      const result = await priceHistoryService.listHistory(query);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to fetch price history",
        },
      });
    }
  },

  async getHistoryByPriceId(
    req: FastifyRequest<{ Params: { priceId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { priceId } = req.params;
      const history = await priceHistoryService.getHistoryByPriceId(priceId);
      return reply.send({ success: true, data: history });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to fetch price history",
        },
      });
    }
  },

  async getStatistics(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { priceId } = req.query as any;
      const stats = await priceHistoryService.getStatistics(priceId);
      return reply.send({ success: true, data: stats });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to fetch statistics",
        },
      });
    }
  },

  async getRecentChanges(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit } = req.query as any;
      const changes = await priceHistoryService.getRecentChanges(
        limit ? parseInt(limit) : undefined
      );
      return reply.send({ success: true, data: changes });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to fetch recent changes",
        },
      });
    }
  },
};
