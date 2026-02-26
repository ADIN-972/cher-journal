import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.schemas";
import { config } from "@cher-journal/config";
import { UserRole, UserStatus } from "@prisma/client";
import { sendPasswordResetEmail } from "../../lib/email";

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

  async forgotPassword(data: ForgotPasswordInput) {
    // Find user by email (but don't reveal if email exists or not for security)
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return { success: true };
    }

    // Generate secure 32-byte token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(resetToken, 10);

    // Store token hash + expiry (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: expiresAt,
      },
    });

    // Send password reset email with plain token (token is never stored in plaintext)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return { success: true };
  }

  async resetPassword(data: ResetPasswordInput) {
    // For security, we can't directly match tokens. Need to:
    // 1. Get user by valid reset token
    // 2. Check expiry
    // 3. But since token is hashed, we need to iterate users (or accept plaintext temporarily)

    // NOTE: In a real system, you might store reset tokens in a separate table
    // For now, we'll use a simpler approach: find users with non-null tokens, check expiry, compare hash

    // Find user with an active password reset token
    const users = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpiry: { gt: new Date() },
      },
    });

    let validUser = null;
    for (const user of users) {
      if (user.passwordResetToken && await bcrypt.compare(data.token, user.passwordResetToken)) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: validUser.id },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { success: true };
  }
}
