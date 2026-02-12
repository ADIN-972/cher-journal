import { FastifyInstance } from "fastify";
import { requireAdmin } from "../../../lib/middleware";
import { UsersController } from "./users.controller";

const controller = new UsersController();

export async function adminUsersRoutes(app: FastifyInstance) {
  app.get("/admin/users", {
    preHandler: requireAdmin,
    handler: controller.list.bind(controller),
  });

  app.get("/admin/users/:id", {
    preHandler: requireAdmin,
    handler: controller.getById.bind(controller),
  });

  app.patch("/admin/users/:id", {
    preHandler: requireAdmin,
    handler: controller.update.bind(controller),
  });

  app.post("/admin/users/:id/entitlements", {
    preHandler: requireAdmin,
    handler: controller.addEntitlement.bind(controller),
  });

  app.delete("/admin/users/:id/entitlements/:entitlementId", {
    preHandler: requireAdmin,
    handler: controller.removeEntitlement.bind(controller),
  });

  app.delete("/admin/users/:id/sessions/:sessionId", {
    preHandler: requireAdmin,
    handler: controller.revokeSession.bind(controller),
  });

  // Bulk actions
  app.post("/admin/users/bulk/suspend", {
    preHandler: requireAdmin,
    handler: controller.bulkSuspend.bind(controller),
  });

  app.post("/admin/users/bulk/activate", {
    preHandler: requireAdmin,
    handler: controller.bulkActivate.bind(controller),
  });

  app.post("/admin/users/bulk/promote", {
    preHandler: requireAdmin,
    handler: controller.bulkPromote.bind(controller),
  });

  app.post("/admin/users/bulk/demote", {
    preHandler: requireAdmin,
    handler: controller.bulkDemote.bind(controller),
  });
}
