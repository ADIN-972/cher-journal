import { FastifyRequest, FastifyReply } from "fastify";
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

      // Set session cookie
      reply.setCookie("sessionToken", result.sessionToken, {
        httpOnly: true,
        secure: !config.isDev,
        sameSite: "lax",
        path: "/",
        maxAge: config.sessionMaxAge / 1000, // seconds
      });

      return reply.send({
        success: true,
        data: { user: result.user },
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
    const sessionToken = request.cookies.sessionToken;

    if (sessionToken) {
      await authService.logout(sessionToken);
    }

    reply.clearCookie("sessionToken", { path: "/" });

    return reply.send({
      success: true,
      data: { message: "Logged out successfully" },
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const sessionToken = request.cookies.sessionToken;

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
