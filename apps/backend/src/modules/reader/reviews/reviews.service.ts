import prisma from '../../../lib/prisma';
import { ReviewStatus } from '@prisma/client';

export class ReviewsService {
  /**
   * Create or update a chapter review
   */
  async createOrUpdateReview(
    userId: string,
    chapterId: string,
    rating: number,
    reviewText: string
  ) {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate review text
    if (!reviewText || reviewText.trim().length < 10) {
      throw new Error('Review text must be at least 10 characters');
    }

    // Check if user has access to this chapter
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        chapterId,
      },
    });

    if (!entitlement) {
      throw new Error('You must have access to this chapter to review it');
    }

    // Check if review already exists
    const existingReview = await prisma.chapterReview.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    if (existingReview) {
      // Update existing review
      const updated = await prisma.chapterReview.update({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
        data: {
          rating,
          reviewText,
          status: ReviewStatus.PENDING, // Reset to pending on update
          reviewedBy: null,
          reviewedAt: null,
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

    // Create new review
    const review = await prisma.chapterReview.create({
      data: {
        userId,
        chapterId,
        rating,
        reviewText,
        status: ReviewStatus.PENDING,
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

    return review;
  }

  /**
   * Get user's review for a specific chapter
   */
  async getUserReview(userId: string, chapterId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Get all reviews for a chapter (approved only for public view)
   */
  async getChapterReviews(chapterId: string, includeAll: boolean = false) {
    const where = includeAll
      ? { chapterId }
      : { chapterId, status: ReviewStatus.APPROVED };

    const reviews = await prisma.chapterReview.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  /**
   * Get chapter review statistics
   */
  async getChapterReviewStats(chapterId: string) {
    const reviews = await prisma.chapterReview.findMany({
      where: {
        chapterId,
        status: ReviewStatus.APPROVED,
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    };

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution,
    };
  }

  /**
   * Delete a user's review
   */
  async deleteReview(userId: string, chapterId: string) {
    const review = await prisma.chapterReview.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    await prisma.chapterReview.delete({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return { success: true };
  }
}
