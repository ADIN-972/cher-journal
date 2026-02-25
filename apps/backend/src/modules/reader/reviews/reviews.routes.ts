import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../lib/middleware';
import { ReviewsController } from './reviews.controller';

const controller = new ReviewsController();

export async function reviewsRoutes(app: FastifyInstance) {
  // Create or update a review
  app.post('/reviews', {
    preHandler: requireAuth,
    handler: controller.createOrUpdateReview.bind(controller),
  });

  // Get all user's reviews
  app.get('/reviews/my-reviews', {
    preHandler: requireAuth,
    handler: controller.getUserReviews.bind(controller),
  });

  // Get user's review for a chapter
  app.get('/reviews/my-review/:chapterId', {
    preHandler: requireAuth,
    handler: controller.getUserReview.bind(controller),
  });

  // Get all approved reviews for a chapter
  app.get('/reviews/chapter/:chapterId', {
    handler: controller.getChapterReviews.bind(controller),
  });

  // Get chapter review statistics
  app.get('/reviews/chapter/:chapterId/stats', {
    handler: controller.getChapterReviewStats.bind(controller),
  });

  // Delete user's review
  app.delete('/reviews/:chapterId', {
    preHandler: requireAuth,
    handler: controller.deleteReview.bind(controller),
  });
}
