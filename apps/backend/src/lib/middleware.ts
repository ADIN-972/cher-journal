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

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionToken = request.cookies.sessionToken;

  console.log("[requireAuth] Cookies:", request.cookies);
  console.log("[requireAuth] sessionToken:", sessionToken);

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
