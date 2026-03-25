import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

/**
 * Extract session token from request.
 * Supports app-specific cookies (sessionToken_admin, sessionToken_web)
 * plus the legacy sessionToken cookie, and Bearer token auth.
 */
function extractSessionToken(request: FastifyRequest): string | null {
  // 1. Bearer token (mobile + web)
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 2. App-specific cookie based on X-App header
  const appId = request.headers['x-app'] as string | undefined;
  if (appId) {
    const appCookie = request.cookies[`sessionToken_${appId}`];
    if (appCookie) return appCookie;
  }

  // 3. Try app-specific cookies directly (admin first, then web)
  if (request.cookies.sessionToken_admin) return request.cookies.sessionToken_admin;
  if (request.cookies.sessionToken_web) return request.cookies.sessionToken_web;

  // 4. Legacy fallback
  return request.cookies.sessionToken || null;
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionToken = extractSessionToken(request);

  if (!sessionToken) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  console.log("[requireAuth] Session found:", session ? "Yes" : "No");

  if (!session || session.expiresAt < new Date()) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "SESSION_EXPIRED",
        message: "Session expired",
      },
    });
  }

  request.user = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };

  // Update session activity tracking (fire-and-forget, don't block the request)
  const appId = request.headers['x-app'] as string | undefined;
  prisma.session.update({
    where: { id: session.id },
    data: {
      lastActiveAt: new Date(),
      deviceType: appId || session.deviceType || null,
      userAgent: session.userAgent || (request.headers['user-agent'] || null),
      origin: session.origin || (request.headers.origin as string || null),
    },
  }).catch(() => {}); // Silently ignore errors
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  await requireAuth(request, reply);

  // If reply was already sent by requireAuth, return early
  if (reply.sent) {
    return;
  }

  if (
    request.user?.role !== UserRole.ADMIN &&
    request.user?.role !== UserRole.SUPERADMIN
  ) {
    return reply.status(403).send({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required",
      },
    });
  }
}
