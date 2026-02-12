import { FastifyRequest, FastifyReply } from 'fastify';
import { ReviewsService } from './reviews.service';
import { createReviewSchema, getChapterReviewsSchema } from './reviews.schemas';

const service = new ReviewsService();

export class ReviewsController {
  /**
   * Create or update a review
   */
  async createOrUpdateReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = createReviewSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { chapterId, rating, reviewText } = validation.data;
      const userId = request.user!.id;

      const review = await service.createOrUpdateReview(
        userId,
        chapterId,
        rating,
        reviewText
      );

      return reply.send({
        success: true,
        data: review,
      });
    } catch (err: any) {
      console.error('[ReviewsController] Error creating/updating review:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'REVIEW_ERROR',
          message: err.message || 'Failed to submit review',
        },
      });
    }
  }

  /**
   * Get user's review for a chapter
   */
  async getUserReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const userId = request.user!.id;

      const review = await service.getUserReview(userId, chapterId);

      return reply.send({
        success: true,
        data: review,
      });
    } catch (err: any) {
      console.error('[ReviewsController] Error fetching user review:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to fetch review',
        },
      });
    }
  }

  /**
   * Get all approved reviews for a chapter
   */
  async getChapterReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };

      const reviews = await service.getChapterReviews(chapterId, false);

      return reply.send({
        success: true,
        data: reviews,
      });
    } catch (err: any) {
      console.error('[ReviewsController] Error fetching chapter reviews:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to fetch reviews',
        },
      });
    }
  }

  /**
   * Get chapter review statistics
   */
  async getChapterReviewStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };

      const stats = await service.getChapterReviewStats(chapterId);

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      console.error('[ReviewsController] Error fetching review stats:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to fetch review statistics',
        },
      });
    }
  }

  /**
   * Delete user's review
   */
  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { chapterId } = request.params as { chapterId: string };
      const userId = request.user!.id;

      const result = await service.deleteReview(userId, chapterId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[ReviewsController] Error deleting review:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: err.message || 'Failed to delete review',
        },
      });
    }
  }
}
