import { FastifyRequest, FastifyReply } from "fastify";
import { UsersService } from "./users.service";
import {
  updateUserSchema,
  UpdateUserInput,
  createEntitlementSchema,
  CreateEntitlementInput,
} from "./users.schemas";

const service = new UsersService();

export class UsersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const users = await service.list();
    return reply.send({ success: true, data: users });
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = await service.getById(request.params.id);
      return reply.send({ success: true, data: user });
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }
      throw error;
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserInput }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = updateUserSchema.safeParse(request.body);
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

      const user = await service.update(
        request.params.id,
        validationResult.data
      );
      return reply.send({ success: true, data: user });
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }
      if (error.message === "UPDATE_FAILED") {
        return reply.status(500).send({
          success: false,
          error: { code: "UPDATE_FAILED", message: "Failed to update user" },
        });
      }
      throw error;
    }
  }

  async addEntitlement(
    request: FastifyRequest<{
      Params: { id: string };
      Body: CreateEntitlementInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const validationResult = createEntitlementSchema.safeParse(request.body);
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

      const entitlement = await service.addEntitlement(
        request.params.id,
        validationResult.data
      );
      return reply.send({ success: true, data: entitlement });
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "CHAPTER_NOT_FOUND", message: "Chapter not found" },
        });
      }
      if (error.message === "INVALID_VOLUME_RANGE") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "INVALID_VOLUME_RANGE",
            message: "volumeTo must be >= volumeFrom",
          },
        });
      }
      throw error;
    }
  }

  async removeEntitlement(
    request: FastifyRequest<{ Params: { id: string; entitlementId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.removeEntitlement(
        request.params.id,
        request.params.entitlementId
      );
      return reply.send({ success: true });
    } catch (error: any) {
      if (error.message === "ENTITLEMENT_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "ENTITLEMENT_NOT_FOUND",
            message: "Entitlement not found",
          },
        });
      }
      if (error.message === "ENTITLEMENT_MISMATCH") {
        return reply.status(403).send({
          success: false,
          error: {
            code: "ENTITLEMENT_MISMATCH",
            message: "Entitlement does not belong to this user",
          },
        });
      }
      throw error;
    }
  }

  async revokeSession(
    request: FastifyRequest<{ Params: { id: string; sessionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.revokeSession(request.params.id, request.params.sessionId);
      return reply.send({ success: true });
    } catch (error: any) {
      if (error.message === "SESSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
        });
      }
      if (error.message === "SESSION_MISMATCH") {
        return reply.status(403).send({
          success: false,
          error: {
            code: "SESSION_MISMATCH",
            message: "Session does not belong to this user",
          },
        });
      }
      throw error;
    }
  }
}
