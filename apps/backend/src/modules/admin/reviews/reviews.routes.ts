import { FastifyInstance } from 'fastify';
import { requireAdmin } from '../../../lib/middleware';
import { AdminReviewsController } from './reviews.controller';

const controller = new AdminReviewsController();

export async function adminReviewsRoutes(app: FastifyInstance) {
  // Get all reviews with filters
  app.get('/admin/reviews', {
    preHandler: requireAdmin,
    handler: controller.getAllReviews.bind(controller),
  });

  // Get review statistics
  app.get('/admin/reviews/stats', {
    preHandler: requireAdmin,
    handler: controller.getReviewStats.bind(controller),
  });

  // Get chapter-specific review stats
  app.get('/admin/reviews/chapter/:chapterId/stats', {
    preHandler: requireAdmin,
    handler: controller.getChapterStats.bind(controller),
  });

  // Get a specific review by ID
  app.get('/admin/reviews/:reviewId', {
    preHandler: requireAdmin,
    handler: controller.getReviewById.bind(controller),
  });

  // Approve a review
  app.post('/admin/reviews/:reviewId/approve', {
    preHandler: requireAdmin,
    handler: controller.approveReview.bind(controller),
  });

  // Reject a review
  app.post('/admin/reviews/:reviewId/reject', {
    preHandler: requireAdmin,
    handler: controller.rejectReview.bind(controller),
  });

  // Bulk approve reviews
  app.post('/admin/reviews/bulk/approve', {
    preHandler: requireAdmin,
    handler: controller.bulkApproveReviews.bind(controller),
  });

  // Bulk reject reviews
  app.post('/admin/reviews/bulk/reject', {
    preHandler: requireAdmin,
    handler: controller.bulkRejectReviews.bind(controller),
  });

  // Delete a review
  app.delete('/admin/reviews/:reviewId', {
    preHandler: requireAdmin,
    handler: controller.deleteReview.bind(controller),
  });
}
