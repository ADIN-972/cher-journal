import { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware";
import { AssetsController } from "./assets.controller";

const controller = new AssetsController();

export async function adminAssetsRoutes(app: FastifyInstance) {
  app.get("/admin/chapters/:chapterId/assets", {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.post("/admin/assets/upload", {
    preHandler: requireAdmin,
    handler: controller.upload.bind(controller),
  });

  app.delete("/admin/assets/:id", {
    preHandler: requireAdmin,
    handler: controller.delete.bind(controller),
  });

  app.patch("/admin/chapters/:chapterId/assets/:id", {
    preHandler: requireAdmin,
    handler: controller.update.bind(controller),
  });

  app.get("/admin/volumes/:volumeId/versions", {
    preHandler: requireAdmin,
    handler: controller.getVersions.bind(controller),
  });

  app.post("/admin/chapters/:chapterId/assets/:assetId/versions/:versionId", {
    preHandler: requireAdmin,
    handler: controller.assignToVersion.bind(controller),
  });

  app.delete("/admin/chapters/:chapterId/assets/:assetId/versions/:versionId", {
    preHandler: requireAdmin,
    handler: controller.unassignFromVersion.bind(controller),
  });

  app.post("/admin/chapters/:chapterId/assets/:assetId/auto-assign", {
    preHandler: requireAdmin,
    handler: controller.autoAssignImageToVolume.bind(controller),
  });
}
