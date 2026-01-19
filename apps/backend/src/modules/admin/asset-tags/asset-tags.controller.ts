import { FastifyRequest, FastifyReply } from "fastify";
import { assetTagsService } from "./asset-tags.service";
import {
  CreateTagInput,
  UpdateTagInput,
  TagAssetInput,
  BulkTagInput,
} from "./asset-tags.schemas";

export class AssetTagsController {
  /**
   * GET /admin/asset-tags
   */
  async listTags(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const tags = await assetTagsService.listTags();
      return reply.send(tags);
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * POST /admin/asset-tags
   */
  async createTag(
    request: FastifyRequest<{ Body: CreateTagInput }>,
    reply: FastifyReply
  ) {
    try {
      const tag = await assetTagsService.createTag(request.body);
      return reply.status(201).send(tag);
    } catch (error: any) {
      if (error.message === "TAG_ALREADY_EXISTS") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "TAG_ALREADY_EXISTS",
            message: "A tag with this name already exists",
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * PATCH /admin/asset-tags/:id
   */
  async updateTag(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTagInput }>,
    reply: FastifyReply
  ) {
    try {
      // Filter out undefined values
      const updates: {
        name?: string;
        description?: string;
        color?: string;
      } = {};

      if (request.body.name !== undefined) {
        updates.name = request.body.name;
      }
      if (request.body.description !== undefined) {
        updates.description = request.body.description;
      }
      if (request.body.color !== undefined) {
        updates.color = request.body.color;
      }

      const tag = await assetTagsService.updateTag(
        request.params.id,
        updates
      );
      return reply.send(tag);
    } catch (error: any) {
      if (error.message === "TAG_ALREADY_EXISTS") {
        return reply.status(409).send({
          success: false,
          error: {
            code: "TAG_ALREADY_EXISTS",
            message: "A tag with this name already exists",
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * DELETE /admin/asset-tags/:id
   */
  async deleteTag(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await assetTagsService.deleteTag(request.params.id);
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * POST /admin/assets/:assetId/tags
   */
  async tagAsset(
    request: FastifyRequest<{
      Params: { assetId: string };
      Body: TagAssetInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const tagging = await assetTagsService.tagAsset(
        request.params.assetId,
        request.body.tagId
      );
      return reply.status(201).send(tagging);
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * DELETE /admin/assets/:assetId/tags/:tagId
   */
  async untagAsset(
    request: FastifyRequest<{ Params: { assetId: string; tagId: string } }>,
    reply: FastifyReply
  ) {
    try {
      await assetTagsService.untagAsset(
        request.params.assetId,
        request.params.tagId
      );
      return reply.status(204).send();
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * GET /admin/assets/:assetId/tags
   */
  async getAssetTags(
    request: FastifyRequest<{ Params: { assetId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const tags = await assetTagsService.getAssetTags(request.params.assetId);
      return reply.send(tags);
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * POST /admin/assets/tags/bulk-tag
   */
  async bulkTag(
    request: FastifyRequest<{ Body: BulkTagInput }>,
    reply: FastifyReply
  ) {
    try {
      await assetTagsService.bulkTagAssets(
        request.body.assetIds,
        request.body.tagIds
      );
      return reply.status(200).send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }

  /**
   * POST /admin/assets/tags/bulk-untag
   */
  async bulkUntag(
    request: FastifyRequest<{ Body: BulkTagInput }>,
    reply: FastifyReply
  ) {
    try {
      await assetTagsService.bulkUntagAssets(
        request.body.assetIds,
        request.body.tagIds
      );
      return reply.status(200).send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: error.message },
      });
    }
  }
}

export const assetTagsController = new AssetTagsController();
