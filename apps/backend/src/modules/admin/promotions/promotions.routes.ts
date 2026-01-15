import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware.js";
import { promotionsController } from "./promotions.controller.js";

export async function promotionsRoutes(app: FastifyInstance) {
  // All routes require admin authentication
  app.addHook("preHandler", requireAdmin);

  // Promotions
  app.post("/admin/promotions", promotionsController.createPromotion);
  app.get("/admin/promotions", promotionsController.listPromotions);
  app.get("/admin/promotions/active", promotionsController.getActivePromotions);
  app.get("/admin/promotions/:id", promotionsController.getPromotion);
  app.patch("/admin/promotions/:id", promotionsController.updatePromotion);
  app.delete("/admin/promotions/:id", promotionsController.deletePromotion);

  // Prices
  app.post("/admin/prices", promotionsController.createPrice);
  app.get("/admin/prices", promotionsController.listPrices);
  app.get("/admin/prices/:id", promotionsController.getPrice);
  app.get("/admin/prices/:id/calculate", promotionsController.calculatePrice);
  app.patch("/admin/prices/:id", promotionsController.updatePrice);
  app.delete("/admin/prices/:id", promotionsController.deletePrice);
}
