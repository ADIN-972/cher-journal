import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware.js";
import { bundlesController } from "./bundles.controller.js";

export async function bundlesRoutes(app: FastifyInstance) {
  // All routes require admin authentication
  app.addHook("preHandler", requireAdmin);

  // Generate slug helper
  app.post("/admin/bundles/generate-slug", bundlesController.generateSlug);

  // Calculate price helper
  app.post("/admin/bundles/calculate-price", bundlesController.calculatePrice);

  // Get bundle by slug (must be before /:id to avoid conflict)
  app.get("/admin/bundles/slug/:slug", bundlesController.getBundleBySlug);

  // CRUD operations
  app.post("/admin/bundles", bundlesController.createBundle);
  app.get("/admin/bundles", bundlesController.listBundles);
  app.get("/admin/bundles/:id", bundlesController.getBundleById);
  app.patch("/admin/bundles/:id", bundlesController.updateBundle);
  app.delete("/admin/bundles/:id", bundlesController.deleteBundle);

  // Additional operations
  app.get("/admin/bundles/:id/available", bundlesController.checkAvailability);
}
