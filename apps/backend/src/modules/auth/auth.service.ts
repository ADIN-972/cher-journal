import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { RegisterInput, LoginInput } from "./auth.schemas";
import { config } from "@cher-journal/config";
import { UserRole, UserStatus } from "@prisma/client";

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        status: UserStatus.ACTIVE,
        role: UserRole.USER,
      },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginInput, ipHash?: string, userAgentHash?: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new Error("ACCOUNT_SUSPENDED");
    }

    // Verify password
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + config.sessionMaxAge);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        ipHash,
        userAgentHash,
      },
    });

    return {
      user: {
        id: user.id,
        publicId: user.publicId,
        email: user.email,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
      },
      sessionToken: session.sessionToken,
    };
  }

  async logout(sessionToken: string) {
    await prisma.session.delete({
      where: { sessionToken },
    });
  }

  async getMe(sessionToken: string) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new Error("SESSION_EXPIRED");
    }

    return {
      id: session.user.id,
      publicId: session.user.publicId,
      email: session.user.email,
      status: session.user.status,
      role: session.user.role,
      createdAt: session.user.createdAt,
    };
  }
}
