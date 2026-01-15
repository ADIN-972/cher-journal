import { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware";
import { VolumesController } from "./volumes.controller";
import {
  updateVolumeSchema,
  updateVolumeVersionSchema,
  bulkUpdateVolumesSchema,
} from "./volumes.schemas";

const controller = new VolumesController();

export async function adminVolumesRoutes(app: FastifyInstance) {
  app.get("/admin/chapters/:chapterId/volumes", {
    preHandler: requireAdmin,
    handler: controller.listByChapter.bind(controller),
  });

  app.post("/admin/chapters/:chapterId/volumes", {
    preHandler: requireAdmin,
    handler: controller.create.bind(controller),
  });

  app.get("/admin/volumes/:id", {
    preHandler: requireAdmin,
    handler: controller.getById.bind(controller),
  });

  app.patch("/admin/volumes/:id", {
    preHandler: requireAdmin,
    // schema: {
    //   body: updateVolumeSchema,
    // },
    handler: controller.update.bind(controller),
  });

  app.delete("/admin/volumes/:id", {
    preHandler: requireAdmin,
    handler: controller.delete.bind(controller),
  });

  app.post("/admin/volumes/:volumeId/versions", {
    preHandler: requireAdmin,
    handler: controller.createVersion.bind(controller),
  });

  app.patch("/admin/volume-versions/:versionId", {
    preHandler: requireAdmin,
    // schema: {
    //   body: updateVolumeVersionSchema,
    // },
    handler: controller.updateVersion.bind(controller),
  });

  app.delete("/admin/volume-versions/:versionId", {
    preHandler: requireAdmin,
    handler: controller.deleteVersion.bind(controller),
  });

  app.post("/admin/volumes/bulk-update", {
    preHandler: requireAdmin,
    // schema: {
    //   body: bulkUpdateVolumesSchema,
    // },
    handler: controller.bulkUpdate.bind(controller),
  });

  app.get("/admin/volume-versions/:versionId/text", {
    preHandler: requireAdmin,
    handler: controller.getVersionText.bind(controller),
  });

  app.patch("/admin/volume-versions/:versionId/text", {
    preHandler: requireAdmin,
    handler: controller.updateVersionText.bind(controller),
  });

  app.post("/admin/chapters/:chapterId/bulk-import-volume", {
    preHandler: requireAdmin,
    handler: controller.bulkImportVolume.bind(controller),
  });
}
