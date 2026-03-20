import { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware";
import { ChapterMuseController } from "./chapter-muse.controller";

const controller = new ChapterMuseController();

export async function adminChapterMuseRoutes(app: FastifyInstance) {
  app.post("/admin/chapter-muse", {
    preHandler: requireAdmin,
    handler: controller.assignMuse.bind(controller),
  });

  app.get("/admin/chapter-muse/:chapterId", {
    preHandler: requireAdmin,
    handler: controller.getMuseByChapter.bind(controller),
  });

  app.patch("/admin/chapter-muse/:chapterId", {
    preHandler: requireAdmin,
    handler: controller.updateMuse.bind(controller),
  });

  app.delete("/admin/chapter-muse/:chapterId", {
    preHandler: requireAdmin,
    handler: controller.removeMuse.bind(controller),
  });
}
