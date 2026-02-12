import { z } from "zod";
import { ChapterStatus, ChapterGenre, Perspective } from "@prisma/client";

export const createChapterSchema = z.object({
  title: z.string().min(1),
  protagonistName: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(ChapterStatus).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  coverAssetId: z.string().nullable().optional(),
  genres: z.array(z.nativeEnum(ChapterGenre)).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  protagonistName: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(ChapterStatus).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  coverAssetId: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
  genres: z.array(z.nativeEnum(ChapterGenre)).optional(),
});

export const bootstrapVolumesSchema = z.object({
  count: z.number().int().min(1).max(20),
  extraVolumes: z.number().int().min(0).max(10).optional(),
});

export const bulkUpdateChaptersSchema = z.object({
  chapterIds: z.array(z.string()).min(1),
  updates: z.object({
    status: z.nativeEnum(ChapterStatus).optional(),
    publishedAt: z.string().datetime().optional().nullable(),
  }),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type BootstrapVolumesInput = z.infer<typeof bootstrapVolumesSchema>;
export type BulkUpdateChaptersInput = z.infer<typeof bulkUpdateChaptersSchema>;
