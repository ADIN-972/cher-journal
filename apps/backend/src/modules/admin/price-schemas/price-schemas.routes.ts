import { FastifyInstance } from "fastify";
import { requireAuth } from "../../../lib/middleware";
import { priceSchemaController } from "./price-schemas.controller";

export async function priceSchemaRoutes(app: FastifyInstance) {
  // ============= PRICE SCHEMAS =============

  app.get("/admin/price-schemas", { preHandler: requireAuth }, (req, reply) =>
    priceSchemaController.listSchemas(req, reply)
  );

  app.post("/admin/price-schemas", { preHandler: requireAuth }, (req, reply) =>
    priceSchemaController.createSchema(req, reply)
  );

  app.get(
    "/admin/price-schemas/:id",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.getSchema(req, reply)
  );

  app.patch(
    "/admin/price-schemas/:id",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.updateSchema(req, reply)
  );

  app.post(
    "/admin/price-schemas/:id/deactivate",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.deactivateSchema(req, reply)
  );

  app.post(
    "/admin/price-schemas/:id/activate",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.activateSchema(req, reply)
  );

  // ============= CHAPTER PRICE OVERRIDES =============

  app.get(
    "/admin/chapter-overrides",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.listChapterOverrides(req, reply)
  );

  app.post(
    "/admin/chapters/:chapterId/price-override",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.createChapterOverride(req, reply)
  );

  app.get(
    "/admin/chapters/:chapterId/price-override",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.getChapterOverride(req, reply)
  );

  app.patch(
    "/admin/chapters/:chapterId/price-override",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.updateChapterOverride(req, reply)
  );

  app.delete(
    "/admin/chapters/:chapterId/price-override",
    { preHandler: requireAuth },
    (req, reply) => priceSchemaController.deleteChapterOverride(req, reply)
  );
}
