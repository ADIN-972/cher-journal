// apps/backend/src/modules/public/chapters.routes.ts
import { FastifyInstance } from "fastify";
import { CatalogService } from "../reader/catalog/catalog.service.js";

const catalogService = new CatalogService();

export async function registerPublicChaptersRoutes(app: FastifyInstance) {
  // GET /api/chapters/:id/preview - Public endpoint, no auth required
  app.get<{ Params: { id: string } }>(
    "/api/chapters/:id/preview",
    async (request, reply) => {
      try {
        const { id } = request.params;
        const preview = await catalogService.getChapterPreview(id);

        if (!preview) {
          return reply.status(404).send({ error: "Chapter not found" });
        }

        // Cache for 24 hours
        reply.header("Cache-Control", "public, max-age=86400");
        return preview;
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
