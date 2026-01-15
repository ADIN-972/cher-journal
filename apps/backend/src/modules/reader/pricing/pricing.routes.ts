import type { FastifyInstance } from "fastify";
import { pricingController } from "./pricing.controller.js";

export async function pricingRoutes(app: FastifyInstance) {
  // Public routes - no auth required
  app.get(
    "/volumes/:chapterId/:volumeNumber/price",
    pricingController.getVolumePrice
  );
  app.get(
    "/volumes/:chapterId/:volumeNumber/published",
    pricingController.isVolumePublished
  );
}
