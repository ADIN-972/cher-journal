import { FastifyInstance } from "fastify";
import { assetTagsController } from "./asset-tags.controller";
import {
  createTagSchema,
  updateTagSchema,
  tagAssetSchema,
  bulkTagSchema,
} from "./asset-tags.schemas";

export default async function assetTagsRoutes(fastify: FastifyInstance) {
  // Tag CRUD
  fastify.get("/admin/asset-tags", assetTagsController.listTags.bind(assetTagsController));

  fastify.post(
    "/admin/asset-tags",
    {
      schema: {
        body: createTagSchema,
      },
    },
    assetTagsController.createTag.bind(assetTagsController)
  );

  fastify.patch(
    "/admin/asset-tags/:id",
    {
      schema: {
        body: updateTagSchema,
      },
    },
    assetTagsController.updateTag.bind(assetTagsController)
  );

  fastify.delete(
    "/admin/asset-tags/:id",
    assetTagsController.deleteTag.bind(assetTagsController)
  );

  // Asset tagging
  fastify.get(
    "/admin/assets/:assetId/tags",
    assetTagsController.getAssetTags.bind(assetTagsController)
  );

  fastify.post(
    "/admin/assets/:assetId/tags",
    {
      schema: {
        body: tagAssetSchema,
      },
    },
    assetTagsController.tagAsset.bind(assetTagsController)
  );

  fastify.delete(
    "/admin/assets/:assetId/tags/:tagId",
    assetTagsController.untagAsset.bind(assetTagsController)
  );

  // Bulk operations
  fastify.post(
    "/admin/assets/tags/bulk-tag",
    {
      schema: {
        body: bulkTagSchema,
      },
    },
    assetTagsController.bulkTag.bind(assetTagsController)
  );

  fastify.post(
    "/admin/assets/tags/bulk-untag",
    {
      schema: {
        body: bulkTagSchema,
      },
    },
    assetTagsController.bulkUntag.bind(assetTagsController)
  );
}
