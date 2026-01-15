import { FastifyRequest, FastifyReply } from "fastify";
import { VolumesService } from "./volumes.service";
import {
  CreateVolumeInput,
  UpdateVolumeInput,
  UpdateVolumeVersionInput,
  BulkUpdateVolumesInput,
  BulkImportVolumeInput,
  createVolumeSchema,
  updateVolumeSchema,
  updateVolumeVersionSchema,
  bulkUpdateVolumesSchema,
  bulkImportVolumeSchema,
} from "./volumes.schemas";

const service = new VolumesService();

export class VolumesController {
  async listByChapter(
    request: FastifyRequest<{ Params: { chapterId: string } }>,
    reply: FastifyReply
  ) {
    const volumes = await service.listByChapter(request.params.chapterId);
    return reply.send({
      success: true,
      data: volumes,
    });
  }

  async create(
    request: FastifyRequest<{
      Params: { chapterId: string };
      Body: CreateVolumeInput;
    }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = createVolumeSchema.safeParse(request.body);
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

    const volume = await service.create(
      request.params.chapterId,
      validationResult.data
    );
    return reply.status(201).send({
      success: true,
      data: volume,
    });
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const volume = await service.getById(request.params.id);
      return reply.send({
        success: true,
        data: volume,
      });
    } catch (error: any) {
      if (error.message === "VOLUME_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VOLUME_NOT_FOUND", message: "Volume not found" },
        });
      }
      throw error;
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateVolumeInput;
    }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = updateVolumeSchema.safeParse(request.body);
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

    const volume = await service.update(
      request.params.id,
      validationResult.data
    );
    return reply.send({
      success: true,
      data: volume,
    });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.delete(request.params.id);
      return reply.send({
        success: true,
        data: { message: "Volume deleted successfully" },
      });
    } catch (error: any) {
      if (error.message === "VOLUME_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VOLUME_NOT_FOUND", message: "Volume not found" },
        });
      }
      throw error;
    }
  }

  async createVersion(
    request: FastifyRequest<{
      Params: { volumeId: string };
      Body: { perspective: "NARRATOR" | "PROTAGONIST"; title?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const version = await service.createVersion(
        request.params.volumeId,
        request.body
      );
      return reply.status(201).send({
        success: true,
        data: version,
      });
    } catch (error: any) {
      if (error.message === "VOLUME_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VOLUME_NOT_FOUND", message: "Volume not found" },
        });
      }
      if (error.message === "VERSION_ALREADY_EXISTS") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "VERSION_ALREADY_EXISTS",
            message: "This perspective already exists for this volume",
          },
        });
      }
      throw error;
    }
  }

  async updateVersion(
    request: FastifyRequest<{
      Params: { versionId: string };
      Body: UpdateVolumeVersionInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = updateVolumeVersionSchema.safeParse(
        request.body
      );
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

      const version = await service.updateVersion(
        request.params.versionId,
        validationResult.data
      );
      return reply.send({
        success: true,
        data: version,
      });
    } catch (error: any) {
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      throw error;
    }
  }

  async deleteVersion(
    request: FastifyRequest<{ Params: { versionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.deleteVersion(request.params.versionId);
      return reply.send({
        success: true,
        data: { message: "Version deleted successfully" },
      });
    } catch (error: any) {
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      throw error;
    }
  }

  async bulkUpdate(
    request: FastifyRequest<{ Body: BulkUpdateVolumesInput }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = bulkUpdateVolumesSchema.safeParse(request.body);
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

    const volumes = await service.bulkUpdate(validationResult.data);
    return reply.send({
      success: true,
      data: volumes,
    });
  }

  async getVersionText(
    request: FastifyRequest<{ Params: { versionId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const text = await service.getVersionText(request.params.versionId);
      return reply.send({
        success: true,
        data: { text },
      });
    } catch (error: any) {
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      if (error.message === "NO_TEXT_BLOB") {
        return reply.status(404).send({
          success: false,
          error: { code: "NO_TEXT_BLOB", message: "This version has no text" },
        });
      }
      throw error;
    }
  }

  async updateVersionText(
    request: FastifyRequest<{
      Params: { versionId: string };
      Body: { text: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const version = await service.updateVersionText(
        request.params.versionId,
        request.body
      );
      return reply.send({
        success: true,
        data: version,
      });
    } catch (error: any) {
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      throw error;
    }
  }

  async bulkImportVolume(
    request: FastifyRequest<{
      Params: { chapterId: string };
      Body: BulkImportVolumeInput;
    }>,
    reply: FastifyReply
  ) {
    // Validate request body
    const validationResult = bulkImportVolumeSchema.safeParse(request.body);
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

    const result = await service.bulkImportVolume(
      request.params.chapterId,
      validationResult.data
    );

    if (!result.success) {
      return reply.status(500).send({
        success: false,
        error: {
          code: "IMPORT_ERROR",
          message: result.error,
        },
      });
    }

    return reply.send({
      success: true,
      data: result.volume,
    });
  }
}
