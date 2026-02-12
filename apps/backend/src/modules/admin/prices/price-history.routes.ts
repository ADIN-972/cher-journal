import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware.js";
import { priceHistoryController } from "./price-history.controller.js";

export async function priceHistoryRoutes(app: FastifyInstance) {
  // All routes require admin authentication
  app.addHook("preHandler", requireAdmin);

  // Price history endpoints
  app.get("/admin/price-history", priceHistoryController.listHistory);
  app.get(
    "/admin/price-history/price/:priceId",
    priceHistoryController.getHistoryByPriceId
  );
  app.get(
    "/admin/price-history/statistics",
    priceHistoryController.getStatistics
  );
  app.get(
    "/admin/price-history/recent",
    priceHistoryController.getRecentChanges
  );
}
