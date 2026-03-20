import { FastifyRequest, FastifyReply } from "fastify";
import { ChapterMuseService } from "./chapter-muse.service";
import {
  AssignMuseInput,
  UpdateMuseInput,
  assignMuseSchema,
  updateMuseSchema,
} from "./chapter-muse.schemas";

const service = new ChapterMuseService();

export class ChapterMuseController {
  async assignMuse(
    request: FastifyRequest<{ Body: AssignMuseInput }>,
    reply: FastifyReply
  ) {
    const validationResult = assignMuseSchema.safeParse(request.body);
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

    try {
      const muse = await service.assignMuse(validationResult.data);
      return reply.status(201).send({
        success: true,
        data: muse,
      });
    } catch (error: any) {
      if (error.message === "CHAPTER_ALREADY_HAS_MUSE") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "CHAPTER_ALREADY_HAS_MUSE",
            message: "This chapter already has a muse assigned",
          },
        });
      }
      throw error;
    }
  }

  async getMuseByChapter(
    request: FastifyRequest<{ Params: { chapterId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const muse = await service.getMuseByChapter(request.params.chapterId);
      return reply.send({
        success: true,
        data: muse,
      });
    } catch (error: any) {
      if (error.message === "MUSE_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "MUSE_NOT_FOUND",
            message: "No muse found for this chapter",
          },
        });
      }
      throw error;
    }
  }

  async updateMuse(
    request: FastifyRequest<{
      Params: { chapterId: string };
      Body: UpdateMuseInput;
    }>,
    reply: FastifyReply
  ) {
    const validationResult = updateMuseSchema.safeParse(request.body);
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

    try {
      const muse = await service.updateMuse(
        request.params.chapterId,
        validationResult.data
      );
      return reply.send({
        success: true,
        data: muse,
      });
    } catch (error: any) {
      if (error.message === "MUSE_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "MUSE_NOT_FOUND",
            message: "No muse found for this chapter",
          },
        });
      }
      throw error;
    }
  }

  async removeMuse(
    request: FastifyRequest<{ Params: { chapterId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.removeMuse(request.params.chapterId);
      return reply.send({
        success: true,
        data: { message: "Muse removed from chapter" },
      });
    } catch (error: any) {
      if (error.message === "MUSE_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: {
            code: "MUSE_NOT_FOUND",
            message: "No muse found for this chapter",
          },
        });
      }
      throw error;
    }
  }
}
