import { glob } from "glob";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";

interface ApiEndpoint {
  method: string;
  path: string;
  module: string;
  feature: string;
  handler?: string;
  middleware: string[];
  requiresAuth: boolean;
  requiresAdmin: boolean;
  params: ParamInfo[];
  bodySchema?: string;
  usedBy: UsageInfo[];
  securityNotes?: string[];
}

interface ParamInfo {
  name: string;
  location: "path" | "query" | "body";
  type?: string;
  required: boolean;
}

interface UsageInfo {
  app: string;
  file: string;
  line: number;
  passedParams: Record<string, string>;
  hasBody: boolean;
}

interface SecurityIssue {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  endpoint: string;
  description: string;
  recommendation: string;
  file: string;
}

async function scanBackendEndpoints(): Promise<ApiEndpoint[]> {
  const endpoints: ApiEndpoint[] = [];

  // Scan route files
  const routeFiles = await glob("apps/backend/src/modules/**/*.routes.ts", {
    ignore: "**/node_modules/**",
  });

  for (const file of routeFiles) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    // Extract module and feature from path
    const pathParts = file.split(path.sep);
    const modulesIdx = pathParts.indexOf("modules");
    const module = pathParts[modulesIdx + 1] || "unknown";
    const feature = pathParts[modulesIdx + 2] || "unknown";

    lines.forEach((line, idx) => {
      const routeMatch = line.match(
        /app\.(get|post|patch|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/
      );
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const routePath = routeMatch[2];

        // Get context (lines around current line)
        const contextStart = Math.max(0, idx - 5);
        const contextEnd = Math.min(lines.length, idx + 10);
        const context = lines.slice(contextStart, contextEnd).join("\n");

        // Extract middleware
        const middleware: string[] = [];
        const preHandlerMatch = context.match(
          /preHandler:\s*(\[([^\]]+)\]|[a-zA-Z]+)/
        );
        if (preHandlerMatch) {
          if (preHandlerMatch[2]) {
            // Array of middleware
            middleware.push(
              ...preHandlerMatch[2].split(",").map((m) => m.trim())
            );
          } else {
            // Single middleware
            middleware.push(preHandlerMatch[1].trim());
          }
        }

        const requiresAuth = middleware.some((m) => m.includes("requireAuth"));
        const requiresAdmin = middleware.some((m) =>
          m.includes("requireAdmin")
        );

        // Extract handler
        const handlerMatch = context.match(/handler:\s*([a-zA-Z.]+)/);
        const handler = handlerMatch?.[1];

        // Extract path parameters
        const params: ParamInfo[] = [];
        const paramMatches = [...routePath.matchAll(/:([a-zA-Z_]+)/g)];
        paramMatches.forEach((pm) => {
          params.push({
            name: pm[1],
            location: "path",
            required: true,
          });
        });

        // Find schema validation
        let bodySchema: string | undefined;
        const schemaMatch = context.match(
          /schema:\s*\{[^}]*body:\s*([a-zA-Z]+)/
        );
        if (schemaMatch) {
          bodySchema = schemaMatch[1];
        }

        endpoints.push({
          method,
          path: routePath,
          module,
          feature,
          handler,
          middleware,
          requiresAuth,
          requiresAdmin,
          params,
          bodySchema,
          usedBy: [],
        });
      }
    });
  }

  return endpoints;
}

async function scanFrontendUsage(endpoints: ApiEndpoint[]): Promise<void> {
  const apps = ["apps/admin", "apps/web", "apps/mobile"];

  for (const appPath of apps) {
    const appName = path.basename(appPath);
    try {
      const files = await glob(`${appPath}/src/**/*.{ts,tsx}`, {
        ignore: "**/node_modules/**",
      });

      for (const file of files) {
        const content = await readFile(file, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line, lineIdx) => {
          // Match api calls
          const apiMatches = [
            ...line.matchAll(
              /api\.(get|post|patch|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g
            ),
          ];

          for (const match of apiMatches) {
            const method = match[1].toUpperCase();
            let callPath = match[2].replace(/^\/api/, "");

            // Extract passed parameters
            const passedParams: Record<string, string> = {};
            const paramMatches = [...callPath.matchAll(/\$\{([^}]+)\}/g)];
            paramMatches.forEach((pm, idx) => {
              passedParams[`param${idx + 1}`] = pm[1].trim();
            });

            // Normalize path for matching
            const normalizedPath = callPath.replace(
              /\$\{[^}]+\}/g,
              ":__PARAM__"
            );

            // Check if has body
            const hasBody = /api\.(post|patch|put)\s*\([^,]+,\s*/.test(line);

            // Find matching endpoint
            const endpoint = endpoints.find((ep) => {
              const epNormalized = ep.path.replace(
                /:[a-zA-Z_]+/g,
                ":__PARAM__"
              );
              return ep.method === method && epNormalized === normalizedPath;
            });

            if (endpoint) {
              endpoint.usedBy.push({
                app: appName,
                file: path.relative(process.cwd(), file),
                line: lineIdx + 1,
                passedParams,
                hasBody,
              });
            }
          }
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan ${appName}: ${error}`);
    }
  }
}

function analyzeSecurityIssues(endpoints: ApiEndpoint[]): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  for (const endpoint of endpoints) {
    const endpointStr = `${endpoint.method} ${endpoint.path}`;

    // Check 1: Public endpoints without authentication
    if (!endpoint.requiresAuth && !endpoint.requiresAdmin) {
      // Ignore certain public endpoints
      const publicPaths = [
        "/auth/login",
        "/auth/register",
        "/stripe/webhook",
        "/chapters",
        "/chapters/:id",
      ];
      if (!publicPaths.includes(endpoint.path)) {
        issues.push({
          severity: "high",
          type: "missing_auth",
          endpoint: endpointStr,
          description: "Endpoint does not require authentication",
          recommendation: "Add requireAuth or requireAdmin middleware",
          file: `apps/backend/src/modules/${endpoint.module}/${endpoint.feature}/${endpoint.feature}.routes.ts`,
        });
      }
    }

    // Check 2: Admin endpoints without admin check
    if (endpoint.path.startsWith("/admin/") && !endpoint.requiresAdmin) {
      issues.push({
        severity: "critical",
        type: "missing_admin_check",
        endpoint: endpointStr,
        description: "Admin endpoint does not require admin role",
        recommendation: "Use requireAdmin middleware instead of requireAuth",
        file: `apps/backend/src/modules/${endpoint.module}/${endpoint.feature}/${endpoint.feature}.routes.ts`,
      });
    }

    // Check 3: Mutation endpoints without body validation
    if (
      ["POST", "PATCH", "PUT"].includes(endpoint.method) &&
      !endpoint.bodySchema
    ) {
      issues.push({
        severity: "medium",
        type: "missing_validation",
        endpoint: endpointStr,
        description: "Mutation endpoint without body schema validation",
        recommendation: "Add schema validation with Zod",
        file: `apps/backend/src/modules/${endpoint.module}/${endpoint.feature}/${endpoint.feature}.routes.ts`,
      });
    }

    // Check 4: Parameter mismatch in frontend calls
    for (const usage of endpoint.usedBy) {
      const expectedParamCount = endpoint.params.filter(
        (p) => p.location === "path"
      ).length;
      const passedParamCount = Object.keys(usage.passedParams).length;

      if (passedParamCount !== expectedParamCount) {
        issues.push({
          severity: "high",
          type: "parameter_mismatch",
          endpoint: endpointStr,
          description: `Expected ${expectedParamCount} parameters but got ${passedParamCount}`,
          recommendation: "Check parameter names and count",
          file: usage.file,
        });
      }

      // Check if mutation endpoint is called with body
      if (
        ["POST", "PATCH", "PUT"].includes(endpoint.method) &&
        !usage.hasBody
      ) {
        issues.push({
          severity: "medium",
          type: "missing_body",
          endpoint: endpointStr,
          description: "Mutation endpoint called without body",
          recommendation: "Pass data as second argument",
          file: usage.file,
        });
      }
    }

    // Check 5: Unused endpoints
    if (endpoint.usedBy.length === 0 && !endpoint.path.includes("webhook")) {
      issues.push({
        severity: "low",
        type: "unused_endpoint",
        endpoint: endpointStr,
        description: "Endpoint defined but never used in frontend",
        recommendation: "Consider removing if not needed for external APIs",
        file: `apps/backend/src/modules/${endpoint.module}/${endpoint.feature}/${endpoint.feature}.routes.ts`,
      });
    }
  }

  return issues;
}

async function generateInventoryReport(
  endpoints: ApiEndpoint[]
): Promise<string> {
  let report = "# API Inventory Report\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Total endpoints: ${endpoints.length}\n\n`;

  // Group by module
  const byModule: Record<string, ApiEndpoint[]> = {};
  endpoints.forEach((ep) => {
    if (!byModule[ep.module]) byModule[ep.module] = [];
    byModule[ep.module].push(ep);
  });

  for (const [module, eps] of Object.entries(byModule)) {
    report += `## Module: ${module}\n\n`;

    for (const ep of eps) {
      report += `### ${ep.method} ${ep.path}\n\n`;
      report += `- **Feature**: ${ep.feature}\n`;
      report += `- **Handler**: ${ep.handler || "unknown"}\n`;
      report += `- **Authentication**: ${ep.requiresAuth ? "✅ Required" : "❌ None"}\n`;
      report += `- **Admin**: ${ep.requiresAdmin ? "✅ Required" : "❌ No"}\n`;
      report += `- **Middleware**: ${ep.middleware.join(", ") || "None"}\n`;

      if (ep.params.length > 0) {
        report += `- **Parameters**:\n`;
        ep.params.forEach((p) => {
          report += `  - \`${p.name}\` (${p.location}${p.required ? ", required" : ""})\n`;
        });
      }

      if (ep.bodySchema) {
        report += `- **Body Schema**: \`${ep.bodySchema}\`\n`;
      }

      report += `- **Used by**: ${ep.usedBy.length} location(s)\n`;
      if (ep.usedBy.length > 0) {
        ep.usedBy.forEach((u) => {
          report += `  - ${u.app}: [${u.file}:${u.line}](${u.file}#L${u.line})\n`;
        });
      }

      report += "\n";
    }
  }

  return report;
}

async function generateSecurityReport(
  issues: SecurityIssue[]
): Promise<string> {
  let report = "# API Security Report\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Total issues: ${issues.length}\n\n`;

  const bySeverity: Record<string, SecurityIssue[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  issues.forEach((issue) => {
    bySeverity[issue.severity].push(issue);
  });

  const severityEmoji = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };

  for (const severity of ["critical", "high", "medium", "low"] as const) {
    const severityIssues = bySeverity[severity];
    if (severityIssues.length === 0) continue;

    report += `## ${severityEmoji[severity]} ${severity.toUpperCase()} (${severityIssues.length})\n\n`;

    severityIssues.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.type.replace(/_/g, " ").toUpperCase()}\n\n`;
      report += `- **Endpoint**: \`${issue.endpoint}\`\n`;
      report += `- **File**: [${issue.file}](${issue.file})\n`;
      report += `- **Description**: ${issue.description}\n`;
      report += `- **Recommendation**: ${issue.recommendation}\n\n`;
    });
  }

  if (issues.length === 0) {
    report += "✅ No security issues detected!\n";
  }

  return report;
}

async function main() {
  console.log("🔍 API Inventory & Security Analysis\n");
  console.log("════════════════════════════════════════════════════════════\n");

  console.log("📱 Scanning backend endpoints...");
  const endpoints = await scanBackendEndpoints();
  console.log(`   Found ${endpoints.length} endpoints\n`);

  console.log("🔌 Scanning frontend usage...");
  await scanFrontendUsage(endpoints);
  console.log(`   Analyzed usage across all apps\n`);

  console.log("🔒 Analyzing security...");
  const issues = analyzeSecurityIssues(endpoints);
  console.log(`   Found ${issues.length} potential issues\n`);

  console.log("📝 Generating reports...\n");

  // Generate inventory report
  const inventoryReport = await generateInventoryReport(endpoints);
  await writeFile("docs/api-inventory.md", inventoryReport);
  console.log("✅ Inventory report: docs/api-inventory.md");

  // Generate security report
  const securityReport = await generateSecurityReport(issues);
  await writeFile("docs/api-security.md", securityReport);
  console.log("✅ Security report: docs/api-security.md\n");

  // Console summary
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;

  console.log("════════════════════════════════════════════════════════════");
  if (criticalCount > 0 || highCount > 0) {
    console.log("⚠️  SECURITY ISSUES DETECTED:");
    if (criticalCount > 0) console.log(`   🔴 Critical: ${criticalCount}`);
    if (highCount > 0) console.log(`   🟠 High: ${highCount}`);
    console.log("\n   Review docs/api-security.md for details");
    process.exit(1);
  } else {
    console.log("✅ No critical security issues detected!");
    console.log("   Review docs/api-security.md for recommendations");
  }
}

// Only run main if this file is executed directly
const isMainModule =
  process.argv[1]?.endsWith("api-inventory.ts") ||
  process.argv[1]?.endsWith("api-inventory.js");
if (isMainModule) {
  main().catch((error) => {
    console.error("❌ Error running API inventory:", error);
    process.exit(1);
  });
}

export { scanBackendEndpoints, scanFrontendUsage, analyzeSecurityIssues };
export type { ApiEndpoint, SecurityIssue, ParamInfo, UsageInfo };
