import { glob } from "glob";
import { readFile, writeFile, mkdir } from "fs/promises";
import * as path from "path";
import { existsSync } from "fs";

interface MissingRoute {
  method: string;
  path: string;
  usedBy: string[];
  suggestedModule: string;
}

function parseRoutePath(routePath: string): {
  module: string;
  feature: string;
  params: string[];
  action?: string;
} {
  const parts = routePath.split("/").filter((p) => p);
  const params = parts
    .filter((p) => p.startsWith(":"))
    .map((p) => p.substring(1));

  // Extract module and feature
  const module = parts[0] || "api";
  const feature = parts[1] || "resource";

  // Check if it's an action route (like /admin/chapters/:id/duplicate)
  const lastPart = parts[parts.length - 1];
  const action = lastPart && !lastPart.startsWith(":") ? lastPart : undefined;

  return { module, feature, params, action };
}

function generateRouteName(
  method: string,
  action?: string,
  hasParams: boolean = false
): string {
  if (action) {
    return action.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  switch (method) {
    case "GET":
      return hasParams ? "getById" : "list";
    case "POST":
      return "create";
    case "PATCH":
    case "PUT":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "handle";
  }
}

function generateRouteCode(missing: MissingRoute): {
  route: string;
  controller: string;
  service: string;
} {
  const { module, feature, params, action } = parseRoutePath(missing.path);
  const methodName = generateRouteName(
    missing.method,
    action,
    params.length > 0
  );
  const httpMethod = missing.method.toLowerCase();

  // Determine params type
  let paramsType = "{}";
  if (params.length > 0) {
    paramsType = `{ ${params.map((p) => `${p}: string`).join("; ")} }`;
  }

  const hasBody = ["POST", "PATCH", "PUT"].includes(missing.method);
  const bodyType = hasBody ? "any" : "never";

  // Generate route code
  const route = `
  // ${missing.method} ${missing.path}
  app.${httpMethod}('${missing.path}', {
    preHandler: requireAdmin, // Adjust based on your needs (requireAuth, requireAdmin, etc.)
    handler: controller.${methodName}.bind(controller),
  });`;

  // Generate controller code
  const controller = `
  async ${methodName}(
    request: FastifyRequest<{ 
      Params: ${paramsType};
      ${hasBody ? `Body: ${bodyType};` : ""}
    }>,
    reply: FastifyReply
  ) {
    try {
      const result = await service.${methodName}(
        ${params.map((p) => `request.params.${p}`).join(", ")}${params.length > 0 && hasBody ? ", " : ""}${hasBody ? "request.body" : ""}
      );
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '${feature.charAt(0).toUpperCase() + feature.slice(1)} not found',
          },
        });
      }
      return reply.status(500).send({
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: error.message || 'Operation failed',
        },
      });
    }
  }`;

  // Generate service code
  const serviceParams = params.map((p) => `${p}: string`).join(", ");
  const allParams =
    serviceParams +
    (serviceParams && hasBody ? ", " : "") +
    (hasBody ? "data: any" : "");

  const service = `
  async ${methodName}(${allParams}) {
    // TODO: Implement ${methodName} logic
    // Access database with prisma.${feature}.findUnique/findMany/create/update/delete
    
    throw new Error('NOT_IMPLEMENTED');
  }`;

  return { route, controller, service };
}

async function generateMissingRoutes(missingRoutes: MissingRoute[]) {
  console.log("\n🔧 Generating code for missing routes...\n");

  for (const missing of missingRoutes) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`${missing.method} ${missing.path}`);
    console.log(`${"=".repeat(60)}`);

    const { route, controller, service } = generateRouteCode(missing);

    console.log("\n📝 Route Code (add to .routes.ts):");
    console.log(route);

    console.log("\n📝 Controller Method (add to .controller.ts):");
    console.log(controller);

    console.log("\n📝 Service Method (add to .service.ts):");
    console.log(service);

    console.log(`\n📍 Suggested location: ${missing.suggestedModule}`);
    console.log(`\n📊 Usage count: ${missing.usedBy.length} file(s)`);
    missing.usedBy.forEach((location) => {
      console.log(`   - ${location}`);
    });
  }
}

async function main() {
  // Import the scan logic from sync-api.ts
  const { scanFrontendCalls, scanBackendRoutes, findMissingRoutes } =
    await import("./sync-api");

  console.log("🔍 Scanning for missing routes...\n");

  // Scan
  const adminCalls = await scanFrontendCalls("apps/admin", "admin");
  const webCalls = await scanFrontendCalls("apps/web", "web");
  const mobileCalls = await scanFrontendCalls("apps/mobile", "mobile");
  const allCalls = [...adminCalls, ...webCalls, ...mobileCalls];

  const backendRoutes = await scanBackendRoutes();

  const missingRoutes = findMissingRoutes(allCalls, backendRoutes);

  if (missingRoutes.length === 0) {
    console.log("✅ No missing routes! Everything is in sync.");
    return;
  }

  console.log(`Found ${missingRoutes.length} missing route(s)\n`);

  // Generate code
  await generateMissingRoutes(missingRoutes);

  console.log("\n\n" + "=".repeat(60));
  console.log("✨ Code generation complete!");
  console.log(
    "📋 Copy the generated code snippets above and paste them into the suggested files."
  );
  console.log(
    "⚠️  Don't forget to implement the actual logic in the service methods!"
  );
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
