import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

export const getReviewsQuerySchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  chapterId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const reviewIdParamSchema = z.object({
  reviewId: z.string().uuid(),
});

export const chapterIdParamSchema = z.object({
  chapterId: z.string().uuid(),
});

export const bulkReviewActionSchema = z.object({
  reviewIds: z.array(z.string().uuid()).min(1),
});

export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>;
export type ChapterIdParam = z.infer<typeof chapterIdParamSchema>;
export type BulkReviewAction = z.infer<typeof bulkReviewActionSchema>;
