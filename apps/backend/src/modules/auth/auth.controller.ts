import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../../lib/prisma";
import { AuthService } from "./auth.service";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas";
import { config } from "@cher-journal/config";
import crypto from "crypto";

const authService = new AuthService();

export class AuthController {
  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validationResult.error.errors,
          },
        });
      }

      const user = await authService.register(validationResult.data);
      return reply.send({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email already registered",
          },
        });
      }
      throw error;
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validationResult.error.errors,
          },
        });
      }

      const ipHash = request.ip
        ? crypto.createHash("sha256").update(request.ip).digest("hex")
        : undefined;

      const userAgentHash = request.headers["user-agent"]
        ? crypto
            .createHash("sha256")
            .update(request.headers["user-agent"])
            .digest("hex")
        : undefined;

      const result = await authService.login(
        validationResult.data,
        ipHash,
        userAgentHash
      );

      // Determine cookie name based on X-App header
      const appId = request.headers['x-app'] as string | undefined;
      const cookieName = appId ? `sessionToken_${appId}` : 'sessionToken';

      // Store device info on the session
      await prisma.session.update({
        where: { sessionToken: result.sessionToken },
        data: {
          deviceType: appId || null,
          userAgent: request.headers['user-agent'] || null,
          origin: request.headers.origin as string || null,
          lastActiveAt: new Date(),
        },
      }).catch(() => {});

      // Log LOGIN activity
      prisma.userActivityLog.create({
        data: {
          userId: result.user.id,
          eventType: 'LOGIN',
          deviceType: appId || null,
          origin: request.headers.origin as string || null,
          ipHash: ipHash || null,
        },
      }).catch(() => {});

      const cookieOptions = {
        httpOnly: true,
        secure: !config.isDev,
        sameSite: "lax" as const,
        path: "/",
        maxAge: config.sessionMaxAge / 1000, // seconds
      };

      // Set app-specific cookie
      reply.setCookie(cookieName, result.sessionToken, cookieOptions);

      // Also set legacy cookie for backward compatibility
      if (appId) {
        reply.setCookie("sessionToken", result.sessionToken, cookieOptions);
      }

      return reply.send({
        success: true,
        data: { user: result.user, sessionToken: result.sessionToken },
      });
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        return reply.status(401).send({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }
      if (error.message === "ACCOUNT_SUSPENDED") {
        return reply.status(403).send({
          success: false,
          error: {
            code: "ACCOUNT_SUSPENDED",
            message: "Account has been suspended",
          },
        });
      }
      throw error;
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // Find session token from app-specific cookie or legacy
    const appId = request.headers['x-app'] as string | undefined;
    const authHeader = request.headers.authorization;
    const sessionToken =
      (appId ? request.cookies[`sessionToken_${appId}`] : null)
      || request.cookies.sessionToken_admin
      || request.cookies.sessionToken_web
      || request.cookies.sessionToken
      || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (sessionToken) {
      await authService.logout(sessionToken);
    }

    // Clear all possible cookie variants
    reply.clearCookie("sessionToken", { path: "/" });
    if (appId) {
      reply.clearCookie(`sessionToken_${appId}`, { path: "/" });
    } else {
      // Clear both app-specific cookies if no X-App header
      reply.clearCookie("sessionToken_admin", { path: "/" });
      reply.clearCookie("sessionToken_web", { path: "/" });
    }

    return reply.send({
      success: true,
      data: { message: "Logged out successfully" },
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    // Reuse same extraction logic as middleware
    const authHeader = request.headers.authorization;
    const appId = request.headers['x-app'] as string | undefined;
    const sessionToken =
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null)
      || (appId ? request.cookies[`sessionToken_${appId}`] : null)
      || request.cookies.sessionToken_admin
      || request.cookies.sessionToken_web
      || request.cookies.sessionToken;

    if (!sessionToken) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    try {
      const user = await authService.getMe(sessionToken);
      return reply.send({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      if (error.message === "SESSION_EXPIRED") {
        reply.clearCookie("sessionToken", { path: "/" });
        return reply.status(401).send({
          success: false,
          error: {
            code: "SESSION_EXPIRED",
            message: "Session expired",
          },
        });
      }
      throw error;
    }
  }

  async updateProfile(
    request: FastifyRequest<{
      Body: { firstName?: string; lastName?: string; username?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.updateProfile(request.user!.id, request.body);
      return reply.send({ success: true, data: { user } });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({
          success: false,
          error: { code: 'USERNAME_TAKEN', message: 'Ce nom d\'utilisateur est déjà pris' },
        });
      }
      throw error;
    }
  }

  async changePassword(
    request: FastifyRequest<{
      Body: { currentPassword: string; newPassword: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { currentPassword, newPassword } = request.body;
      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        });
      }
      await authService.changePassword(request.user!.id, currentPassword, newPassword);
      return reply.send({ success: true, data: { message: 'Mot de passe modifié avec succès' } });
    } catch (error: any) {
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Le mot de passe actuel est incorrect' },
        });
      }
      throw error;
    }
  }

  async deleteAccount(
    request: FastifyRequest<{ Body: { password: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { password } = request.body;
      if (!password) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Le mot de passe est requis' },
        });
      }
      await authService.deleteAccount(request.user!.id, password);
      return reply.send({ success: true, data: { message: 'Compte supprimé avec succès' } });
    } catch (error: any) {
      if (error.message === 'INVALID_PASSWORD') {
        return reply.status(400).send({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'Mot de passe incorrect' },
        });
      }
      throw error;
    }
  }

  async sendVerification(request: FastifyRequest, reply: FastifyReply) {
    try {
      await authService.sendVerificationCode(request.user!.id);
      return reply.send({ success: true, data: { message: "Code envoye" } });
    } catch (error: any) {
      if (error.message === "RATE_LIMITED") {
        return reply.status(429).send({
          success: false,
          error: { code: "RATE_LIMITED", message: "Veuillez attendre 60 secondes avant de renvoyer un code" },
        });
      }
      if (error.message === "EMAIL_SEND_FAILED") {
        return reply.status(500).send({
          success: false,
          error: { code: "EMAIL_SEND_FAILED", message: "Echec de l'envoi de l'email" },
        });
      }
      throw error;
    }
  }

  async verifyEmail(
    request: FastifyRequest<{ Body: { code: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { code } = request.body;
      if (!code || code.length !== 6) {
        return reply.status(400).send({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Le code doit contenir 6 chiffres" },
        });
      }
      await authService.verifyEmail(request.user!.id, code);
      return reply.send({ success: true, data: { message: "Email verifie avec succes" } });
    } catch (error: any) {
      const errorMap: Record<string, { status: number; code: string; message: string }> = {
        CODE_EXPIRED: { status: 400, code: "CODE_EXPIRED", message: "Le code a expire. Demandez-en un nouveau." },
        INVALID_CODE: { status: 400, code: "INVALID_CODE", message: "Code incorrect" },
        TOO_MANY_ATTEMPTS: { status: 429, code: "TOO_MANY_ATTEMPTS", message: "Trop de tentatives. Demandez un nouveau code." },
      };
      const mapped = errorMap[error.message];
      if (mapped) {
        return reply.status(mapped.status).send({
          success: false,
          error: { code: mapped.code, message: mapped.message },
        });
      }
      throw error;
    }
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordInput }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = forgotPasswordSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validationResult.error.errors,
          },
        });
      }

      await authService.forgotPassword(validationResult.data);

      // Always return success to avoid email enumeration
      return reply.send({
        success: true,
        data: { message: "If an account with this email exists, a password reset link has been sent." },
      });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordInput }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = resetPasswordSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validationResult.error.errors,
          },
        });
      }

      await authService.resetPassword(validationResult.data);

      return reply.send({
        success: true,
        data: { message: "Password reset successful. You can now log in with your new password." },
      });
    } catch (error: any) {
      if (error.message === "INVALID_OR_EXPIRED_TOKEN") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "INVALID_OR_EXPIRED_TOKEN",
            message: "The password reset link is invalid or has expired. Please request a new one.",
          },
        });
      }
      throw error;
    }
  }
}
