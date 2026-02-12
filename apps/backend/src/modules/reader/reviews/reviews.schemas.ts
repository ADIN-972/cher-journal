import { z } from 'zod';

export const createReviewSchema = z.object({
  chapterId: z.string().uuid('Chapter ID must be a valid UUID'),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be less than 2000 characters'),
});

export const getChapterReviewsSchema = z.object({
  chapterId: z.string().uuid('Chapter ID must be a valid UUID'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetChapterReviewsInput = z.infer<typeof getChapterReviewsSchema>;
