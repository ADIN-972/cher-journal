import type { FastifyRequest, FastifyReply } from "fastify";
import { promotionsService } from "./promotions.service.js";
import {
  createPromotionSchema,
  updatePromotionSchema,
  listPromotionsSchema,
  createPriceSchema,
  updatePriceSchema,
} from "./promotions.schemas.js";

export const promotionsController = {
  // Promotions
  async createPromotion(req: FastifyRequest, reply: FastifyReply) {
    const data = createPromotionSchema.parse(req.body);
    const promotion = await promotionsService.createPromotion(data);
    return reply.send({ success: true, data: promotion });
  },

  async listPromotions(req: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[listPromotions controller] Request query:", req.query);
      const query = listPromotionsSchema.parse(req.query);
      console.log("[listPromotions controller] Parsed query:", query);
      const result = await promotionsService.listPromotions(query);
      console.log("[listPromotions controller] Result:", result);
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      console.error("[listPromotions controller] Error:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Internal server error",
        },
      });
    }
  },

  async getPromotion(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const promotion = await promotionsService.getPromotionById(id);

    if (!promotion) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Promotion not found" },
      });
    }

    return reply.send({ success: true, data: promotion });
  },

  async updatePromotion(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const data = updatePromotionSchema.parse(req.body);
    const promotion = await promotionsService.updatePromotion(id, data);
    return reply.send({ success: true, data: promotion });
  },

  async deletePromotion(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    await promotionsService.deletePromotion(id);
    return reply.send({ success: true, data: { deleted: true } });
  },

  async getActivePromotions(
    req: FastifyRequest<{ Querystring: { scope: string; refId?: string } }>,
    reply: FastifyReply
  ) {
    const { scope, refId } = req.query;
    const promotions = await promotionsService.getActivePromotions(
      scope as any,
      refId
    );
    return reply.send({ success: true, data: promotions });
  },

  // Prices
  async createPrice(req: FastifyRequest, reply: FastifyReply) {
    const data = createPriceSchema.parse(req.body);
    const price = await promotionsService.createPrice(data);
    return reply.send({ success: true, data: price });
  },

  async listPrices(
    req: FastifyRequest<{ Querystring: { scope?: string; refId?: string } }>,
    reply: FastifyReply
  ) {
    const { scope, refId } = req.query;
    const prices = await promotionsService.listPrices(scope as any, refId);
    return reply.send({ success: true, data: prices });
  },

  async getPrice(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const price = await promotionsService.getPriceById(id);

    if (!price) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Price not found" },
      });
    }

    return reply.send({ success: true, data: price });
  },

  async updatePrice(
    req: FastifyRequest<{
      Params: { id: string };
      Body: { amountCents?: number; currency?: string };
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const data = updatePriceSchema.parse(req.body);
    const price = await promotionsService.updatePrice(id, data);
    return reply.send({ success: true, data: price });
  },

  async deletePrice(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    await promotionsService.deletePrice(id);
    return reply.send({ success: true, data: { deleted: true } });
  },

  async calculatePrice(
    req: FastifyRequest<{
      Params: { id: string };
      Querystring: { userId?: string };
    }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;
    const { userId } = req.query;
    const finalPrice = await promotionsService.calculateFinalPrice(id, userId);
    return reply.send({ success: true, data: { finalPrice } });
  },
};
