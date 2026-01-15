import { FastifyRequest, FastifyReply } from "fastify";
import { AssetsService } from "./assets.service";
import { AssetKind } from "@prisma/client";

const service = new AssetsService();

export class AssetsController {
  async list(
    request: FastifyRequest<{ Params: { chapterId: string } }>,
    reply: FastifyReply
  ) {
    const assets = await service.list(request.params.chapterId);
    return reply.send({
      success: true,
      data: assets,
    });
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    try {
      let chapterId: string | undefined;
      let kind: AssetKind = AssetKind.IMAGE;
      let label: string | undefined;
      let fileData:
        | { filename: string; mimetype: string; buffer: Buffer }
        | undefined;

      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "file") {
          fileData = {
            filename: part.filename,
            mimetype: part.mimetype,
            buffer: await part.toBuffer(),
          };
        } else {
          // It's a field
          const value = (part as any).value;
          if (part.fieldname === "chapterId") {
            chapterId = value;
          } else if (part.fieldname === "kind") {
            kind = value as AssetKind;
          } else if (part.fieldname === "label") {
            label = value;
          }
        }
      }

      if (!fileData) {
        return reply.status(400).send({
          success: false,
          error: { code: "NO_FILE", message: "No file uploaded" },
        });
      }

      if (!chapterId) {
        return reply.status(400).send({
          success: false,
          error: { code: "MISSING_CHAPTER_ID", message: "Chapter ID required" },
        });
      }

      const asset = await service.upload(
        chapterId,
        {
          filename: fileData.filename,
          mimetype: fileData.mimetype,
          data: fileData.buffer,
        },
        kind,
        label || fileData.filename // Use filename as label if no label provided
      );

      // Auto-assign image to volume if it's an IMAGE kind
      if (kind === AssetKind.IMAGE) {
        await service.autoAssignImageToVolume(asset.id, chapterId).catch(() => {
          // Silently fail if auto-assign doesn't work
        });
      }

      return reply.status(201).send({
        success: true,
        data: asset,
      });
    } catch (error: any) {
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "CHAPTER_NOT_FOUND", message: "Chapter not found" },
        });
      }
      throw error;
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await service.delete(request.params.id);
      return reply.send({
        success: true,
        data: { message: "Asset deleted" },
      });
    } catch (error: any) {
      if (error.message === "ASSET_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "ASSET_NOT_FOUND", message: "Asset not found" },
        });
      }
      throw error;
    }
  }

  async update(
    request: FastifyRequest<{
      Params: { chapterId: string; id: string };
      Body: { kind?: AssetKind; label?: string | null };
    }>,
    reply: FastifyReply
  ) {
    try {
      const asset = await service.update(
        request.params.id,
        request.params.chapterId,
        request.body
      );
      return reply.send({
        success: true,
        data: asset,
      });
    } catch (error: any) {
      if (error.message === "ASSET_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "ASSET_NOT_FOUND", message: "Asset not found" },
        });
      }
      if (error.message === "CHAPTER_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "CHAPTER_NOT_FOUND", message: "Chapter not found" },
        });
      }
      throw error;
    }
  }

  async assignToVersion(
    request: FastifyRequest<{
      Params: { chapterId: string; assetId: string; versionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const versionAsset = await service.assignToVersion(
        request.params.assetId,
        request.params.versionId,
        0
      );
      return reply.status(201).send({
        success: true,
        data: versionAsset,
      });
    } catch (error: any) {
      if (error.message === "ASSET_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "ASSET_NOT_FOUND", message: "Asset not found" },
        });
      }
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      throw error;
    }
  }

  async unassignFromVersion(
    request: FastifyRequest<{
      Params: { chapterId: string; assetId: string; versionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      await service.unassignFromVersion(
        request.params.assetId,
        request.params.versionId
      );
      return reply.send({
        success: true,
        data: { message: "Asset unassigned from version" },
      });
    } catch (error: any) {
      if (error.message === "ASSET_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "ASSET_NOT_FOUND", message: "Asset not found" },
        });
      }
      if (error.message === "VERSION_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "VERSION_NOT_FOUND", message: "Version not found" },
        });
      }
      throw error;
    }
  }

  async getVersions(
    request: FastifyRequest<{ Params: { volumeId: string } }>,
    reply: FastifyReply
  ) {
    const versions = await service.getVersions(request.params.volumeId);
    return reply.send({
      success: true,
      data: versions,
    });
  }

  async autoAssignImageToVolume(
    request: FastifyRequest<{
      Params: { chapterId: string; assetId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.autoAssignImageToVolume(
        request.params.assetId,
        request.params.chapterId
      );

      if (!result) {
        return reply.send({
          success: true,
          data: null,
          message:
            "Image could not be auto-assigned (no volume number in filename or volume already has illustration)",
        });
      }

      return reply.send({
        success: true,
        data: result,
        message: `Image assigned to volume ${result.volumeNumber}`,
      });
    } catch (error: any) {
      if (error.message === "ASSET_NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "ASSET_NOT_FOUND", message: "Asset not found" },
        });
      }
      throw error;
    }
  }
}
