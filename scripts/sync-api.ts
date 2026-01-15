import { glob } from "glob";
import { readFile } from "fs/promises";
import * as path from "path";

interface ApiCall {
  method: string;
  path: string;
  file: string;
  line: number;
  params?: Record<string, string>;
  hasBody?: boolean;
  bodyFields?: string[];
}

interface BackendRoute {
  method: string;
  path: string;
  file: string;
  handler?: string;
  middleware?: string[];
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

interface MissingRoute {
  method: string;
  path: string;
  usedBy: string[];
  suggestedModule: string;
}

// Helper to normalize template literals in paths
function normalizeTemplatePath(rawPath: string): string {
  // Replace ${variable} or ${object.prop} with :param
  return rawPath.replace(/\$\{[^}]+\}/g, ":__PARAM__");
}

async function scanFrontendCalls(
  appPath: string,
  appName: string
): Promise<ApiCall[]> {
  try {
    const files = await glob(`${appPath}/src/**/*.{ts,tsx}`, {
      ignore: "**/node_modules/**",
    });
    const calls: ApiCall[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        // Pattern: api.get('/path'), api.post('/path', data), etc.
        const apiMatches = [
          ...line.matchAll(
            /api\.(get|post|patch|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
          ),
        ];
        for (const match of apiMatches) {
          let rawPath = match[2].replace(/^\/api/, ""); // Remove /api prefix if present
          let normalizedPath = normalizeTemplatePath(rawPath);

          calls.push({
            method: match[1].toUpperCase(),
            path: normalizedPath,
            file: `${appName}/${path.relative(process.cwd(), file)}`,
            line: index + 1,
          });
        }

        // Pattern: fetch('/api/path') or fetch('http://localhost:3000/api/path')
        const fetchMatches = [
          ...line.matchAll(/fetch\s*\(\s*['"`][^'"`]*?\/api\/([^'"`]+)['"`]/g),
        ];
        for (const match of fetchMatches) {
          let normalizedPath = normalizeTemplatePath(`/${match[1]}`);

          // Try to detect HTTP method from surrounding context
          let method = "GET";
          const nextLines = lines
            .slice(index, Math.min(index + 5, lines.length))
            .join(" ");
          const methodMatch = nextLines.match(
            /method:\s*['"`](GET|POST|PATCH|PUT|DELETE)['"`]/i
          );
          if (methodMatch) {
            method = methodMatch[1].toUpperCase();
          }

          calls.push({
            method,
            path: normalizedPath,
            file: `${appName}/${path.relative(process.cwd(), file)}`,
            line: index + 1,
          });
        }
      });
    }

    return calls;
  } catch (error) {
    console.warn(`⚠️  Could not scan ${appName}: ${error}`);
    return [];
  }
}

async function scanBackendRoutes(): Promise<BackendRoute[]> {
  try {
    const files = await glob("apps/backend/src/modules/**/*.routes.ts", {
      ignore: "**/node_modules/**",
    });
    const routes: BackendRoute[] = [];

    for (const file of files) {
      const content = await readFile(file, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line) => {
        const matches = [
          ...line.matchAll(
            /app\.(get|post|patch|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
          ),
        ];
        for (const match of matches) {
          // Extract handler if present
          const handlerMatch = line.match(/handler:\s*([a-zA-Z.]+)/);
          routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            file: path.relative(process.cwd(), file),
            handler: handlerMatch?.[1],
          });
        }
      });
    }

    return routes;
  } catch (error) {
    console.warn(`⚠️  Could not scan backend routes: ${error}`);
    return [];
  }
}

function normalizePath(p: string): string {
  // Replace all :param with :__PARAM__ for comparison
  return p.replace(/:[a-zA-Z_]+/g, ":__PARAM__");
}

function findMissingRoutes(
  calls: ApiCall[],
  routes: BackendRoute[]
): MissingRoute[] {
  const missingMap = new Map<string, MissingRoute>();

  for (const call of calls) {
    const normalizedCall = normalizePath(call.path);
    const found = routes.some(
      (route) =>
        route.method === call.method &&
        normalizePath(route.path) === normalizedCall
    );

    if (!found) {
      const key = `${call.method} ${call.path}`;
      if (!missingMap.has(key)) {
        missingMap.set(key, {
          method: call.method,
          path: call.path,
          usedBy: [],
          suggestedModule: suggestModule(call.path),
        });
      }
      missingMap.get(key)!.usedBy.push(`${call.file}:${call.line}`);
    }
  }

  return Array.from(missingMap.values());
}

function findUnusedRoutes(
  calls: ApiCall[],
  routes: BackendRoute[]
): BackendRoute[] {
  return routes.filter((route) => {
    const normalizedRoute = normalizePath(route.path);
    return !calls.some(
      (call) =>
        call.method === route.method &&
        normalizePath(call.path) === normalizedRoute
    );
  });
}

function suggestModule(path: string): string {
  // Extract feature from path
  const parts = path.split("/").filter((p) => p && !p.startsWith(":"));

  if (parts.length >= 2) {
    const module = parts[0]; // admin, api, reader, etc.
    const feature = parts[1]; // chapters, volumes, users, etc.
    return `apps/backend/src/modules/${module}/${feature}/${feature}.routes.ts`;
  }

  return "apps/backend/src/modules/[determine-module]/[feature].routes.ts";
}

async function main() {
  console.log("🔍 API Sync Check - Cher Journal\n");
  console.log("═".repeat(60));

  // Scan frontend apps
  console.log("\n📱 Scanning frontend API calls...");
  const adminCalls = await scanFrontendCalls("apps/admin", "admin");
  const webCalls = await scanFrontendCalls("apps/web", "web");
  const mobileCalls = await scanFrontendCalls("apps/mobile", "mobile");

  const allCalls = [...adminCalls, ...webCalls, ...mobileCalls];

  // Scan backend routes
  console.log("🔌 Scanning backend routes...");
  const backendRoutes = await scanBackendRoutes();

  // Results summary
  console.log("\n📊 Scan Results:");
  console.log(`   Admin calls:    ${adminCalls.length}`);
  console.log(`   Web calls:      ${webCalls.length}`);
  console.log(`   Mobile calls:   ${mobileCalls.length}`);
  console.log(`   Backend routes: ${backendRoutes.length}`);

  // Find missing routes
  const missingRoutes = findMissingRoutes(allCalls, backendRoutes);

  if (missingRoutes.length > 0) {
    console.log("\n❌ Missing Backend Routes:", missingRoutes.length);
    console.log("═".repeat(60));

    missingRoutes.forEach((missing) => {
      console.log(`\n${missing.method} ${missing.path}`);
      console.log(`   Priority: ${getPriority(missing.usedBy.length)}`);
      console.log(`   Used in:`);
      missing.usedBy.forEach((location) => {
        console.log(`      - ${location}`);
      });
      console.log(`   Suggested: ${missing.suggestedModule}`);
    });
  } else {
    console.log(
      "\n✅ All frontend API calls have corresponding backend routes!"
    );
  }

  // Find unused routes
  const unusedRoutes = findUnusedRoutes(allCalls, backendRoutes);

  if (unusedRoutes.length > 0) {
    console.log(
      "\n⚠️  Potentially Unused Backend Routes:",
      unusedRoutes.length
    );
    console.log("═".repeat(60));

    unusedRoutes.forEach((unused) => {
      console.log(`\n${unused.method} ${unused.path}`);
      console.log(`   Defined in: ${unused.file}`);
      console.log(`   Handler: ${unused.handler || "unknown"}`);
      console.log(`   Recommendation: Verify if this route is still needed`);
    });
  } else {
    console.log("\n✅ All backend routes are being used!");
  }

  // Final summary
  console.log("\n" + "═".repeat(60));
  if (missingRoutes.length === 0 && unusedRoutes.length === 0) {
    console.log("✨ Perfect sync! Frontend and backend are aligned.");
    process.exit(0);
  } else {
    console.log(`\n⚠️  Action required:`);
    if (missingRoutes.length > 0) {
      console.log(
        `   - Create ${missingRoutes.length} missing backend route(s)`
      );
    }
    if (unusedRoutes.length > 0) {
      console.log(
        `   - Review ${unusedRoutes.length} potentially unused route(s)`
      );
    }
    process.exit(1); // Exit with error code for CI/CD
  }
}

function getPriority(usageCount: number): string {
  if (usageCount >= 5) return "🔴 Critical";
  if (usageCount >= 3) return "🟠 High";
  if (usageCount >= 2) return "🟡 Medium";
  return "🟢 Low";
}

// Export for use in generate-routes.ts
export {
  scanFrontendCalls,
  scanBackendRoutes,
  findMissingRoutes,
  normalizePath,
  normalizeTemplatePath,
};
export type { ApiCall, BackendRoute, MissingRoute };

// Only run main if this file is executed directly
// Check if we're being run directly (not imported)
const isMainModule =
  process.argv[1]?.endsWith("sync-api.ts") ||
  process.argv[1]?.endsWith("sync-api.js");
if (isMainModule) {
  main().catch((error) => {
    console.error("❌ Error running API sync check:", error);
    process.exit(1);
  });
}
