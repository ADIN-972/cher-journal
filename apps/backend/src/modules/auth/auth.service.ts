import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.schemas";
import { config } from "@cher-journal/config";
import { UserRole, UserStatus } from "@prisma/client";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../lib/email";

export class AuthService {
  // --- Email Verification ---

  async sendVerificationCode(userId: string): Promise<{ success: boolean }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.emailVerified) return { success: true };

    // Rate limit: no resend within 60s
    const recent = await prisma.emailVerificationCode.findFirst({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });
    if (recent) throw new Error("RATE_LIMITED");

    // Invalidate old codes
    await prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    await prisma.emailVerificationCode.create({
      data: {
        userId,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // Send email
    const sent = await sendVerificationEmail(user.email, code);
    if (!sent) throw new Error("EMAIL_SEND_FAILED");

    return { success: true };
  }

  async verifyEmail(userId: string, code: string): Promise<{ success: boolean }> {
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const record = await prisma.emailVerificationCode.findFirst({
      where: {
        userId,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw new Error("CODE_EXPIRED");
    if (record.attempts >= 5) throw new Error("TOO_MANY_ATTEMPTS");

    if (record.codeHash !== codeHash) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error("INVALID_CODE");
    }

    // Mark code as used + verify user
    await prisma.$transaction([
      prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
    ]);

    return { success: true };
  }

  // --- Registration ---

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

    // Auto-send verification email
    try {
      await this.sendVerificationCode(user.id);
    } catch {
      // Non-blocking: don't fail registration if email fails
    }

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
        emailVerified: user.emailVerified,
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
      emailVerified: session.user.emailVerified,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      username: session.user.username,
      status: session.user.status,
      role: session.user.role,
      createdAt: session.user.createdAt,
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; username?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.username !== undefined && { username: data.username }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new Error("INVALID_CURRENT_PASSWORD");

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
  }

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error("INVALID_PASSWORD");

    // 1. Cancel active Stripe subscription immediately
    if (user.subscription?.stripeSubscriptionId) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(config.stripe.secretKey, { apiVersion: "2023-10-16" as any });
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (err) {
        console.error("Failed to cancel Stripe subscription during account deletion:", err);
      }

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "CANCELLED",
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
        },
      });
    }

    // 2. Revoke all entitlements
    await prisma.entitlement.deleteMany({ where: { userId } });

    // 3. Delete all sessions
    await prisma.session.deleteMany({ where: { userId } });

    // 4. Soft-delete user: keep name for anti-fraud + invoice lookup
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAccountEmail: user.email,
        email: `deleted_${userId}@deleted.com`,
        passwordHash: "",
        status: "SUSPENDED" as UserStatus,
        deletedAt: new Date(),
      },
    });
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
