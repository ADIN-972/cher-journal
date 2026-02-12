import type { FastifyRequest, FastifyReply } from "fastify";
import { bundlesService } from "./bundles.service.js";
import {
  createBundleSchema,
  updateBundleSchema,
  listBundlesSchema,
} from "./bundles.schemas.js";

export const bundlesController = {
  /**
   * Create a new bundle
   * POST /admin/bundles
   */
  async createBundle(req: FastifyRequest, reply: FastifyReply) {
    try {
      const validatedData = createBundleSchema.parse(req.body);

      // Convert date strings to Date objects
      const input = {
        ...validatedData,
        validFrom: validatedData.validFrom
          ? new Date(validatedData.validFrom)
          : undefined,
        validUntil: validatedData.validUntil
          ? new Date(validatedData.validUntil)
          : undefined,
        createdBy: (req as any).user?.id, // From auth middleware
      };

      const bundle = await bundlesService.createBundle(input);

      return reply.status(201).send({ success: true, data: bundle });
    } catch (error: any) {
      console.error("Error creating bundle:", error);

      if (error.name === "ZodError") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation error",
            details: error.errors,
          },
        });
      }

      return reply.status(400).send({
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: error.message || "Failed to create bundle",
        },
      });
    }
  },

  /**
   * Update a bundle
   * PATCH /admin/bundles/:id
   */
  async updateBundle(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const validatedData = updateBundleSchema.parse(req.body);

      // Convert date strings to Date objects
      const input = {
        ...validatedData,
        validFrom: validatedData.validFrom
          ? new Date(validatedData.validFrom)
          : undefined,
        validUntil: validatedData.validUntil
          ? new Date(validatedData.validUntil)
          : undefined,
      };

      const bundle = await bundlesService.updateBundle(id, input);

      return reply.send({ success: true, data: bundle });
    } catch (error: any) {
      console.error("Error updating bundle:", error);

      if (error.name === "ZodError") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation error",
            details: error.errors,
          },
        });
      }

      if (error.message.includes("not found")) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
      }

      return reply.status(400).send({
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error.message || "Failed to update bundle",
        },
      });
    }
  },

  /**
   * List bundles with pagination
   * GET /admin/bundles
   */
  async listBundles(req: FastifyRequest, reply: FastifyReply) {
    try {
      const query = listBundlesSchema.parse(req.query);
      const result = await bundlesService.listBundles(query);

      return reply.send({ success: true, data: result });
    } catch (error: any) {
      console.error("Error listing bundles:", error);

      if (error.name === "ZodError") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation error",
            details: error.errors,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to list bundles",
        },
      });
    }
  },

  /**
   * Get a bundle by ID
   * GET /admin/bundles/:id
   */
  async getBundleById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const bundle = await bundlesService.getBundleById(id);

      return reply.send({ success: true, data: bundle });
    } catch (error: any) {
      console.error("Error getting bundle:", error);

      if (error.message.includes("not found")) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get bundle",
        },
      });
    }
  },

  /**
   * Get a bundle by slug
   * GET /admin/bundles/slug/:slug
   */
  async getBundleBySlug(
    req: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { slug } = req.params;
      const bundle = await bundlesService.getBundleBySlug(slug);

      return reply.send({ success: true, data: bundle });
    } catch (error: any) {
      console.error("Error getting bundle by slug:", error);

      if (error.message.includes("not found")) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get bundle",
        },
      });
    }
  },

  /**
   * Delete a bundle
   * DELETE /admin/bundles/:id
   */
  async deleteBundle(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      await bundlesService.deleteBundle(id);

      return reply.send({
        success: true,
        message: "Bundle deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting bundle:", error);

      if (error.message.includes("not found")) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        });
      }

      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete bundle",
        },
      });
    }
  },

  /**
   * Check if a bundle is available
   * GET /admin/bundles/:id/available
   */
  async checkAvailability(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = req.params;
      const isAvailable = await bundlesService.isBundleAvailable(id);

      return reply.send({ success: true, data: { isAvailable } });
    } catch (error: any) {
      console.error("Error checking bundle availability:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to check bundle availability",
        },
      });
    }
  },

  /**
   * Generate a slug from a name
   * POST /admin/bundles/generate-slug
   */
  async generateSlug(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { name } = req.body as { name: string };

      if (!name) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Name is required",
          },
        });
      }

      const slug = bundlesService.generateSlug(name);

      return reply.send({ success: true, data: { slug } });
    } catch (error: any) {
      console.error("Error generating slug:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate slug",
        },
      });
    }
  },

  /**
   * Calculate original price based on bundle items
   * POST /admin/bundles/calculate-price
   */
  async calculatePrice(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { items } = req.body as { items: any[] };

      if (!items || items.length === 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Items are required",
          },
        });
      }

      const originalPrice = await bundlesService.calculateOriginalPrice(items);

      return reply.send({
        success: true,
        data: { originalAmountCents: originalPrice },
      });
    } catch (error: any) {
      console.error("Error calculating price:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to calculate price",
        },
      });
    }
  },
};
