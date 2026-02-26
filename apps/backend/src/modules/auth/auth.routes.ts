import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import { requireAuth } from "../../lib/middleware";

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", {
    handler: controller.register.bind(controller),
  });

  app.post("/auth/login", {
    handler: controller.login.bind(controller),
  });

  app.post("/auth/logout", {
    preHandler: requireAuth,
    handler: controller.logout.bind(controller),
  });

  app.get("/auth/me", {
    preHandler: requireAuth,
    handler: controller.me.bind(controller),
  });

  // Alias /me
  app.get("/me", {
    preHandler: requireAuth,
    handler: controller.me.bind(controller),
  });

  // Password reset routes
  app.post("/auth/forgot-password", {
    handler: controller.forgotPassword.bind(controller),
  });

  app.post("/auth/reset-password", {
    handler: controller.resetPassword.bind(controller),
  });
}
