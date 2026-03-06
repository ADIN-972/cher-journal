import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStoryDto, UpdateStoryDto } from './dto/create-story.dto';
import crypto from 'crypto';

@Injectable()
export class CustomStoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Hash IP address with salt for security
   */
  private hashIp(ip: string): string {
    const salt = process.env.IP_HASH_SALT || 'default-salt';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
  }

  /**
   * Create a new custom story request (draft)
   */
  async createStory(
    userId: string,
    dto: CreateStoryDto,
    userIp: string,
    userAgent: string,
    userMacAddress?: string,
  ) {
    const hashedIp = this.hashIp(userIp);

    return this.prisma.customStoryRequest.create({
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
        userLocation: 'UNKNOWN', // TODO: Add geolocation
        userAgent,
        volumeProposals: {
          create: dto.volumeProposals.map(vol => ({
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
    return this.prisma.customStoryRequest.update({
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
  async getStory(storyId: string, userId: string) {
    return this.prisma.customStoryRequest.findUnique({
      where: { id: storyId },
      include: { volumeProposals: true },
    });
  }

  /**
   * List user's stories
   */
  async listUserStories(userId: string) {
    return this.prisma.customStoryRequest.findMany({
      where: { userId },
      include: { volumeProposals: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Submit story for review
   */
  async submitStory(storyId: string, userId: string) {
    return this.prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'PENDING' },
      include: { volumeProposals: true },
    });
  }

  /**
   * Cancel story (only if PENDING or UNDER_REVIEW)
   */
  async cancelStory(storyId: string, userId: string) {
    return this.prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Admin: List stories for moderation
   */
  async listForModeration(status?: string) {
    return this.prisma.customStoryRequest.findMany({
      where: status ? { status } : {},
      include: {
        volumeProposals: true,
        user: { select: { id: true, email: true, username: true } }
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  /**
   * Admin: Approve story
   */
  async approveStory(storyId: string, adminId: string) {
    return this.prisma.customStoryRequest.update({
      where: { id: storyId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });
  }

  /**
   * Admin: Reject story
   */
  async rejectStory(
    storyId: string,
    adminId: string,
    reason: string,
    notes?: string,
  ) {
    return this.prisma.customStoryRequest.update({
      where: { id: storyId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        rejectionNotes: notes,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });
  }

  /**
   * Admin: Mark as under review
   */
  async markUnderReview(storyId: string) {
    return this.prisma.customStoryRequest.update({
      where: { id: storyId },
      data: { status: 'UNDER_REVIEW' },
    });
  }

  /**
   * Delete old data per retention policy (3 months)
   */
  async deleteExpiredData() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return this.prisma.customStoryRequest.deleteMany({
      where: {
        dataRetentionDeletedAt: {
          lte: threeMonthsAgo,
        },
      },
    });
  }
}
