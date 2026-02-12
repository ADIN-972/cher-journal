import prisma from '../../../lib/prisma';
import { ReviewStatus } from '@prisma/client';

export class AdminReviewsService {
  /**
   * Get all reviews with filters
   */
  async getAllReviews(
    status?: ReviewStatus,
    chapterId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (chapterId) {
      where.chapterId = chapterId;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.chapterReview.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              publicId: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          chapter: {
            select: {
              id: true,
              title: true,
              protagonistName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.chapterReview.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific review by ID
   */
  async getReviewById(reviewId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            protagonistName: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  }

  /**
   * Approve a review
   */
  async approveReview(reviewId: string, adminUserId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updated = await prisma.chapterReview.update({
      where: { id: reviewId },
      data: {
        status: ReviewStatus.APPROVED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Reject a review
   */
  async rejectReview(reviewId: string, adminUserId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updated = await prisma.chapterReview.update({
      where: { id: reviewId },
      data: {
        status: ReviewStatus.REJECTED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Bulk approve reviews
   */
  async bulkApproveReviews(reviewIds: string[], adminUserId: string) {
    const result = await prisma.chapterReview.updateMany({
      where: {
        id: { in: reviewIds },
      },
      data: {
        status: ReviewStatus.APPROVED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * Bulk reject reviews
   */
  async bulkRejectReviews(reviewIds: string[], adminUserId: string) {
    const result = await prisma.chapterReview.updateMany({
      where: {
        id: { in: reviewIds },
      },
      data: {
        status: ReviewStatus.REJECTED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });

    return { count: result.count };
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    await prisma.chapterReview.delete({
      where: { id: reviewId },
    });

    return { success: true };
  }

  /**
   * Get review statistics
   */
  async getReviewStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.chapterReview.count(),
      prisma.chapterReview.count({ where: { status: ReviewStatus.PENDING } }),
      prisma.chapterReview.count({ where: { status: ReviewStatus.APPROVED } }),
      prisma.chapterReview.count({ where: { status: ReviewStatus.REJECTED } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }

  /**
   * Get chapter-specific review stats for admin
   */
  async getChapterStats(chapterId: string) {
    const reviews = await prisma.chapterReview.findMany({
      where: { chapterId },
      select: {
        rating: true,
        status: true,
      },
    });

    const approved = reviews.filter((r) => r.status === ReviewStatus.APPROVED);
    const pending = reviews.filter((r) => r.status === ReviewStatus.PENDING);
    const rejected = reviews.filter((r) => r.status === ReviewStatus.REJECTED);

    const averageRating =
      approved.length > 0
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
        : 0;

    const ratingDistribution = {
      1: approved.filter((r) => r.rating === 1).length,
      2: approved.filter((r) => r.rating === 2).length,
      3: approved.filter((r) => r.rating === 3).length,
      4: approved.filter((r) => r.rating === 4).length,
      5: approved.filter((r) => r.rating === 5).length,
    };

    return {
      total: reviews.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }
}
