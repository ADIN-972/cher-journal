import { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware";
import { ChaptersController } from "./chapters.controller";
import {
  createChapterSchema,
  updateChapterSchema,
  bootstrapVolumesSchema,
  bulkUpdateChaptersSchema,
} from "./chapters.schemas";

const controller = new ChaptersController();

export async function adminChaptersRoutes(app: FastifyInstance) {
  app.get("/admin/chapters", {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.get("/admin/chapters/:id", {
    preHandler: requireAdmin,
    handler: controller.getById.bind(controller),
  });

  app.post("/admin/chapters", {
    preHandler: requireAdmin,
    // schema: {
    //   body: createChapterSchema,
    // },
    handler: controller.create.bind(controller),
  });

  app.patch("/admin/chapters/:id", {
    preHandler: requireAdmin,
    // schema: {
    //   body: updateChapterSchema,
    // },
    handler: controller.update.bind(controller),
  });

  app.delete("/admin/chapters/:id", {
    preHandler: requireAdmin,
    handler: controller.delete.bind(controller),
  });

  app.post("/admin/chapters/:id/bootstrap-volumes", {
    preHandler: requireAdmin,
    // schema: {
    //   body: bootstrapVolumesSchema,
    // },
    handler: controller.bootstrapVolumes.bind(controller),
  });

  app.post("/admin/chapters/bulk-update", {
    preHandler: requireAdmin,
    // schema: {
    //   body: bulkUpdateChaptersSchema,
    // },
    handler: controller.bulkUpdate.bind(controller),
  });

  app.post("/admin/chapters/:id/duplicate", {
    preHandler: requireAdmin,
    handler: controller.duplicate.bind(controller),
  });
}
