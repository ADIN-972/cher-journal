import { FastifyRequest, FastifyReply } from "fastify";
import { priceSchemaService } from "./price-schemas.service";
import {
  createPriceSchemaSchema,
  updatePriceSchemaSchema,
  createChapterOverrideSchema,
  updateChapterOverrideSchema,
} from "./price-schemas.schemas";

export const priceSchemaController = {
  // ============= PRICE SCHEMAS =============

  async listSchemas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const schemas = await priceSchemaService.listSchemas();
      return reply.send(schemas);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch schemas" });
    }
  },

  async createSchema(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = createPriceSchemaSchema.parse(request.body);
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const schema = await priceSchemaService.createSchema({
        ...body,
        createdBy: userId,
      });

      return reply.status(201).send(schema);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Failed to create schema" });
    }
  },

  async getSchema(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const schema = await priceSchemaService.getSchemaById(id);

      if (!schema) {
        return reply.status(404).send({ error: "Schema not found" });
      }

      return reply.send(schema);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch schema" });
    }
  },

  async updateSchema(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = updatePriceSchemaSchema.parse(request.body);
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const schema = await priceSchemaService.updateSchema(id, body, userId);
      return reply.send(schema);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ error: error.errors });
      }
      if (error.message === "SCHEMA_NOT_FOUND") {
        return reply.status(404).send({ error: "Schema not found" });
      }
      return reply.status(500).send({ error: "Failed to update schema" });
    }
  },

  async deactivateSchema(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const schema = await priceSchemaService.deactivateSchema(id);
      return reply.send(schema);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to deactivate schema" });
    }
  },

  async activateSchema(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const schema = await priceSchemaService.activateSchema(id);
      return reply.send(schema);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to activate schema" });
    }
  },

  // ============= CHAPTER PRICE OVERRIDES =============

  async listChapterOverrides(request: FastifyRequest, reply: FastifyReply) {
    try {
      const overrides = await priceSchemaService.listChapterOverrides();
      return reply.send(overrides);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch overrides" });
    }
  },

  async createChapterOverride(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const body = createChapterOverrideSchema.parse(request.body);
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const override = await priceSchemaService.createChapterOverride(
        chapterId,
        body,
        userId
      );

      return reply.status(201).send(override);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ error: error.errors });
      }
      return reply.status(500).send({ error: "Failed to create override" });
    }
  },

  async updateChapterOverride(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const body = updateChapterOverrideSchema.parse(request.body);
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const override = await priceSchemaService.updateChapterOverride(
        chapterId,
        body,
        userId
      );

      return reply.send(override);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ error: error.errors });
      }
      if (error.message === "OVERRIDE_NOT_FOUND") {
        return reply.status(404).send({ error: "Override not found" });
      }
      return reply.status(500).send({ error: "Failed to update override" });
    }
  },

  async deleteChapterOverride(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      await priceSchemaService.deleteChapterOverride(chapterId, userId);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === "OVERRIDE_NOT_FOUND") {
        return reply.status(404).send({ error: "Override not found" });
      }
      return reply.status(500).send({ error: "Failed to delete override" });
    }
  },

  async getChapterOverride(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const override = await priceSchemaService.getChapterOverride(chapterId);

      if (!override) {
        return reply.status(404).send({ error: "Override not found" });
      }

      return reply.send(override);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch override" });
    }
  },

  // ============= PRICE HISTORY / AUDIT =============

  async getPriceHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.query as { chapterId?: string };
      const history = await priceSchemaService.getPriceHistory(chapterId);
      return reply.send(history);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch history" });
    }
  },

  async getPriceHistoryDetail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityId } = request.params as { entityId: string };
      const history = await priceSchemaService.getPriceHistoryDetail(entityId);
      return reply.send(history);
    } catch (error) {
      return reply.status(500).send({ error: "Failed to fetch history" });
    }
  },
};
