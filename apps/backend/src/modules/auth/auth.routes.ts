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

  // Profile update
  app.patch("/me/profile", {
    preHandler: requireAuth,
    handler: controller.updateProfile.bind(controller),
  });

  // Change password
  app.post("/me/change-password", {
    preHandler: requireAuth,
    handler: controller.changePassword.bind(controller),
  });

  // Delete account
  app.post("/me/delete-account", {
    preHandler: requireAuth,
    handler: controller.deleteAccount.bind(controller),
  });

  // Email verification
  app.post("/auth/send-verification", {
    preHandler: requireAuth,
    handler: controller.sendVerification.bind(controller),
  });

  app.post("/auth/verify-email", {
    preHandler: requireAuth,
    handler: controller.verifyEmail.bind(controller),
  });

  // Password reset routes
  app.post("/auth/forgot-password", {
    handler: controller.forgotPassword.bind(controller),
  });

  app.post("/auth/reset-password", {
    handler: controller.resetPassword.bind(controller),
  });
}
