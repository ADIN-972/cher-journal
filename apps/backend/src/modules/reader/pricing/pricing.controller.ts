import type { FastifyRequest, FastifyReply } from "fastify";
import { pricingService } from "./pricing.service.js";
import { getVolumePriceSchema } from "./pricing.schemas.js";

export const pricingController = {
  async getVolumePrice(
    req: FastifyRequest<{
      Params: { chapterId: string; volumeNumber: string };
      Querystring: { userId?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { chapterId, volumeNumber } = req.params;
      const { userId } = req.query;

      const volNum = parseInt(volumeNumber, 10);
      if (isNaN(volNum) || volNum < 1) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "INVALID_VOLUME_NUMBER",
            message: "Invalid volume number",
          },
        });
      }

      const priceInfo = await pricingService.getVolumePrice({
        chapterId,
        volumeNumber: volNum,
        userId,
      });

      return reply.send({ success: true, data: priceInfo });
    } catch (err: any) {
      if (err.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "CHAPTER_NOT_FOUND", message: "Chapter not found" },
        });
      }
      if (err.message === "VOLUME_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VOLUME_NOT_FOUND", message: "Volume not found" },
        });
      }

      console.error("[getVolumePrice] Error:", err);
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      });
    }
  },

  async isVolumePublished(
    req: FastifyRequest<{
      Params: { chapterId: string; volumeNumber: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { chapterId, volumeNumber } = req.params;
      const volNum = parseInt(volumeNumber, 10);

      if (isNaN(volNum) || volNum < 1) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "INVALID_VOLUME_NUMBER",
            message: "Invalid volume number",
          },
        });
      }

      const isPublished = await pricingService.isVolumePublished(
        chapterId,
        volNum
      );

      return reply.send({ success: true, data: { isPublished } });
    } catch (err) {
      console.error("[isVolumePublished] Error:", err);
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      });
    }
  },
};
