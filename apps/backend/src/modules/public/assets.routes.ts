import { FastifyInstance } from "fastify";
import fs from "fs/promises";
import pathModule from "path";
import { config } from "@cher-journal/config";

export async function publicAssetsRoutes(app: FastifyInstance) {
  // Serve thumbnail images (public, no auth required)
  app.get<{ Params: { path: string } }>(
    "/uploads/:path",
    async (request, reply) => {
      try {
        const { path: objectKey } = request.params;
        const filePath = pathModule.join(config.uploadDir, objectKey);

        // Prevent directory traversal
        const realPath = await fs.realpath(filePath);
        const uploadDir = await fs.realpath(config.uploadDir);

        if (!realPath.startsWith(uploadDir)) {
          return reply.status(403).send({ error: "Access denied" });
        }

        // Check if file exists
        await fs.access(filePath);

        // Send file with appropriate cache headers
        reply.header("Cache-Control", "public, max-age=31536000, immutable");
        reply.header("Content-Type", "image/png");

        const fileStream = await fs.readFile(filePath);
        return reply.send(fileStream);
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return reply.status(404).send({ error: "Not found" });
        }
        return reply.status(500).send({ error: "Internal server error" });
      }
    }
  );
}
