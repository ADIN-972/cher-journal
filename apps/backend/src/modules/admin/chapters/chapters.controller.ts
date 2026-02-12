import { FastifyRequest, FastifyReply } from "fastify";
import { ChaptersService } from "./chapters.service";
import {
  CreateChapterInput,
  UpdateChapterInput,
  BootstrapVolumesInput,
  BulkUpdateChaptersInput,
  createChapterSchema,
  updateChapterSchema,
  bootstrapVolumesSchema,
  bulkUpdateChaptersSchema,
} from "./chapters.schemas";

const service = new ChaptersService();

export class ChaptersController {
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await service.getStats();
    return reply.send({
      success: true,
      data: stats,
    });
  }

  async list(
    request: FastifyRequest<{ Querystring: { includeArchived?: string } }>,
    reply: FastifyReply
  ) {
    const includeArchived = request.query.includeArchived === "true";
    const chapters = await service.list(includeArchived);
    return reply.send({
      success: true,
      data: chapters,
    });
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const chapter = await service.getById(request.params.id);
      return reply.send({
        success: true,
        data: chapter,
      });
    } catch (error: any) {
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "CHAPTER_NOT_FOUND",
            message: "Chapter not found",
          },
        });
      }
      throw error;
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateChapterInput }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = createChapterSchema.safeParse(request.body);
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

    const chapter = await service.create(validationResult.data);
    return reply.status(201).send({
      success: true,
      data: chapter,
    });
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateChapterInput;
    }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = updateChapterSchema.safeParse(request.body);
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

    const chapter = await service.update(
      request.params.id,
      validationResult.data
    );
    return reply.send({
      success: true,
      data: chapter,
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.delete(request.params.id);
      const isArchived = !!result?.isArchived;

      return reply.send({
        success: true,
        data: {
          message: isArchived
            ? "Chapter archived (has payment history)"
            : "Chapter permanently deleted",
          isArchived,
        },
      });
    } catch (error: any) {
      console.error("Error deleting chapter:", error);
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "CHAPTER_NOT_FOUND",
            message: "Chapter not found",
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: {
          code: "DELETE_FAILED",
          message: error.message || "Failed to delete chapter",
        },
      });
    }
  }

  async bootstrapVolumes(
    request: FastifyRequest<{
      Params: { id: string };
      Body: BootstrapVolumesInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = bootstrapVolumesSchema.safeParse(request.body);
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

      const volumes = await service.bootstrapVolumes(
        request.params.id,
        validationResult.data
      );
      return reply.send({
        success: true,
        data: volumes,
      });
    } catch (error: any) {
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "CHAPTER_NOT_FOUND",
            message: "Chapter not found",
          },
        });
      }
      throw error;
    }
  }

  async bulkUpdate(
    request: FastifyRequest<{ Body: BulkUpdateChaptersInput }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = bulkUpdateChaptersSchema.safeParse(request.body);
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

    const chapters = await service.bulkUpdate(validationResult.data);
    return reply.send({
      success: true,
      data: chapters,
    });
  }

  async duplicate(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const duplicatedChapter = await service.duplicate(request.params.id);
      return reply.send({
        success: true,
        data: duplicatedChapter,
      });
    } catch (error: any) {
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "CHAPTER_NOT_FOUND",
            message: "Chapter not found",
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: {
          code: "DUPLICATE_FAILED",
          message: error.message || "Failed to duplicate chapter",
        },
      });
    }
  }
}
