import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminReviewsService } from './reviews.service';
import {
  getReviewsQuerySchema,
  reviewIdParamSchema,
  chapterIdParamSchema,
  bulkReviewActionSchema,
} from './reviews.schemas';

const service = new AdminReviewsService();

export class AdminReviewsController {
  /**
   * Get all reviews with filters
   */
  async getAllReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = getReviewsQuerySchema.safeParse(request.query);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { status, chapterId, page, limit } = validation.data;

      const result = await service.getAllReviews(status, chapterId, page, limit);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error fetching reviews:', err);
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
   * Get a specific review by ID
   */
  async getReviewById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = reviewIdParamSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewId } = validation.data;

      const review = await service.getReviewById(reviewId);

      return reply.send({
        success: true,
        data: review,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error fetching review:', err);
      return reply.code(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: err.message || 'Review not found',
        },
      });
    }
  }

  /**
   * Approve a review
   */
  async approveReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = reviewIdParamSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewId } = validation.data;
      const adminUserId = request.user!.id;

      const review = await service.approveReview(reviewId, adminUserId);

      return reply.send({
        success: true,
        data: review,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error approving review:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'APPROVAL_ERROR',
          message: err.message || 'Failed to approve review',
        },
      });
    }
  }

  /**
   * Reject a review
   */
  async rejectReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = reviewIdParamSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewId } = validation.data;
      const adminUserId = request.user!.id;

      const review = await service.rejectReview(reviewId, adminUserId);

      return reply.send({
        success: true,
        data: review,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error rejecting review:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'REJECTION_ERROR',
          message: err.message || 'Failed to reject review',
        },
      });
    }
  }

  /**
   * Bulk approve reviews
   */
  async bulkApproveReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = bulkReviewActionSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewIds } = validation.data;
      const adminUserId = request.user!.id;

      const result = await service.bulkApproveReviews(reviewIds, adminUserId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error bulk approving reviews:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'BULK_APPROVAL_ERROR',
          message: err.message || 'Failed to bulk approve reviews',
        },
      });
    }
  }

  /**
   * Bulk reject reviews
   */
  async bulkRejectReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = bulkReviewActionSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewIds } = validation.data;
      const adminUserId = request.user!.id;

      const result = await service.bulkRejectReviews(reviewIds, adminUserId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error bulk rejecting reviews:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'BULK_REJECTION_ERROR',
          message: err.message || 'Failed to bulk reject reviews',
        },
      });
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = reviewIdParamSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { reviewId } = validation.data;

      const result = await service.deleteReview(reviewId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error deleting review:', err);
      return reply.code(400).send({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: err.message || 'Failed to delete review',
        },
      });
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await service.getReviewStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error fetching stats:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to fetch statistics',
        },
      });
    }
  }

  /**
   * Get chapter-specific review stats
   */
  async getChapterStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validation = chapterIdParamSchema.safeParse(request.params);

      if (!validation.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        });
      }

      const { chapterId } = validation.data;

      const stats = await service.getChapterStats(chapterId);

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      console.error('[AdminReviewsController] Error fetching chapter stats:', err);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to fetch chapter statistics',
        },
      });
    }
  }
}
