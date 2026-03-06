import { PrismaClient } from '@prisma/client';
import { CreateStoryDto, UpdateStoryDto } from './dto/create-story.dto';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class CustomStoriesService {
  /**
   * Hash IP address with salt for security
   */
  private hashIp(ip: string): string {
    const salt = process.env.IP_HASH_SALT || 'default-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
  }

  /**
   * Get geolocation from IP (simplified)
   */
  private getLocationFromIp(ip: string): string | null {
    // In production, use a proper geolocation service
    // For now, return null or a placeholder
    return null;
  }

  /**
   * Create a new custom story request
   */
  async createStory(
    userId: string,
    dto: CreateStoryDto,
    userIp: string,
    userAgent: string,
    userMacAddress?: string,
  ) {
    const hashedIp = this.hashIp(userIp);
    const location = this.getLocationFromIp(userIp);

    return prisma.customStoryRequest.create({
      data: {
        userId,
        protagonistName: dto.protagonistName,
        description: dto.description,
        selectedGenres: dto.selectedGenres,
        explicitLevel: dto.explicitLevel,
        niveauIntensitee: dto.niveauIntensitee,
        niveauDouceur: dto.niveauDouceur,
        niveauDanger: dto.niveauDanger,
        niveauTransformation: dto.niveauTransformation,
        storyEnding: dto.storyEnding,
        storyEndingCustom: dto.storyEndingCustom,
        email: dto.email,
        rgpdConsent: dto.rgpdConsent,
        ccpaConsent: dto.ccpaConsent,
        photoAssetIds: dto.photoAssetIds,
        userIp: hashedIp,
        userMacAddress,
        userLocation: location,
        userAgent,
        volumeProposals: {
          create: dto.volumeProposals.map((vol) => ({
            volumeNumber: vol.volumeNumber,
            proposedLocation: vol.proposedLocation,
            proposedOrientation: vol.proposedOrientation,
            proposedTwist: vol.proposedTwist,
          })),
        },
      },
      include: { volumeProposals: true },
    });
  }

  /**
   * Update draft story
   */
  async updateStory(
    storyId: string,
    userId: string,
    dto: UpdateStoryDto,
  ) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: {
        ...(dto.protagonistName && { protagonistName: dto.protagonistName }),
        ...(dto.description && { description: dto.description }),
        ...(dto.selectedGenres && { selectedGenres: dto.selectedGenres }),
        ...(dto.explicitLevel && { explicitLevel: dto.explicitLevel }),
        ...(dto.niveauIntensitee !== undefined && { niveauIntensitee: dto.niveauIntensitee }),
        ...(dto.niveauDouceur !== undefined && { niveauDouceur: dto.niveauDouceur }),
        ...(dto.niveauDanger !== undefined && { niveauDanger: dto.niveauDanger }),
        ...(dto.niveauTransformation !== undefined && { niveauTransformation: dto.niveauTransformation }),
        ...(dto.storyEnding && { storyEnding: dto.storyEnding }),
        ...(dto.storyEndingCustom !== undefined && { storyEndingCustom: dto.storyEndingCustom }),
        ...(dto.email && { email: dto.email }),
        ...(dto.photoAssetIds && { photoAssetIds: dto.photoAssetIds }),
      },
      include: { volumeProposals: true },
    });
  }

  /**
   * Get story by ID
   */
  async getStory(storyId: string, userId?: string) {
    return prisma.customStoryRequest.findUnique({
      where: { id: storyId },
      include: { volumeProposals: true, user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } } },
    });
  }

  /**
   * List user's stories
   */
  async listUserStories(userId: string) {
    return prisma.customStoryRequest.findMany({
      where: { userId },
      include: { volumeProposals: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Submit story for review
   */
  async submitStory(storyId: string, userId: string) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'PENDING' },
      include: { volumeProposals: true },
    });
  }

  /**
   * Cancel story
   */
  async cancelStory(storyId: string, userId: string) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * List stories for moderation (with filter)
   */
  async listForModeration(status?: string) {
    return prisma.customStoryRequest.findMany({
      where: status ? { status } : {},
      include: { volumeProposals: true, user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  }

  /**
   * List stories with pagination (admin)
   */
  async listForModerationPaginated(status?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      prisma.customStoryRequest.findMany({
        where: status ? { status } : {},
        include: { volumeProposals: true, user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } } },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customStoryRequest.count({
        where: status ? { status } : {},
      }),
    ]);

    return {
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve story
   */
  async approveStory(storyId: string, adminId: string) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: { volumeProposals: true },
    });
  }

  /**
   * Reject story
   */
  async rejectStory(
    storyId: string,
    adminId: string,
    reason: string,
    notes?: string,
  ) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectionNotes: notes,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: { volumeProposals: true },
    });
  }

  /**
   * Mark as under review
   */
  async markUnderReview(storyId: string) {
    return prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'UNDER_REVIEW' },
      include: { volumeProposals: true },
    });
  }

  /**
   * Get statistics
   */
  async getStoryStats() {
    const [total, pending, underReview, approved, rejected] = await Promise.all([
      prisma.customStoryRequest.count(),
      prisma.customStoryRequest.count({ where: { status: 'PENDING' } }),
      prisma.customStoryRequest.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.customStoryRequest.count({ where: { status: 'APPROVED' } }),
      prisma.customStoryRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
    };
  }

  /**
   * Delete old data per retention policy (3 months)
   */
  async deleteExpiredData() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return prisma.customStoryRequest.deleteMany({
      where: {
        dataRetentionDeletedAt: {
          lte: threeMonthsAgo,
        },
      },
    });
  }
}
