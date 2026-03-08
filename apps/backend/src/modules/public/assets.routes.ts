import { FastifyInstance } from "fastify";
import fs from "fs/promises";
import pathModule from "path";
import { config } from "@cher-journal/config";

export async function publicAssetsRoutes(app: FastifyInstance) {
  // Serve files from uploads directory (public, no auth required)
  // Supports multi-segment paths like /uploads/custom-stories/temp/userId/filename.jpg
  app.get<{ Params: { path: string } }>(
    "/uploads/*",
    async (request, reply) => {
      try {
        // Capture full remaining path after /uploads/
        const fullPath = (request.params as any)['*'] || request.url.slice('/uploads/'.length);
        const filePath = pathModule.join(config.uploadDir, fullPath);

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
