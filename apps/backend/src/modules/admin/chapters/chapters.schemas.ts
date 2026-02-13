import { z } from "zod";
import { ChapterStatus, ChapterGenre, Perspective } from "@prisma/client";

export const createChapterSchema = z.object({
  title: z.string().min(1),
  protagonistName: z.string().min(1),
  description: z.string().optional().nullable(),
  accroche_classic: z.string().optional().nullable(),
  accroche_dark: z.string().optional().nullable(),
  accroche_love: z.string().optional().nullable(),
  accroche_marketing: z.string().optional().nullable(),
  accroche_dark_collection: z.string().optional().nullable(),
  niveau_intensite: z.number().int().min(1).max(5).optional().nullable(),
  niveau_douceur: z.number().int().min(1).max(5).optional().nullable(),
  niveau_danger: z.number().int().min(1).max(5).optional().nullable(),
  niveau_transformation: z.number().int().min(1).max(5).optional().nullable(),
  status: z.nativeEnum(ChapterStatus).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  coverAssetId: z.string().nullable().optional(),
  genres: z.array(z.nativeEnum(ChapterGenre)).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  protagonistName: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  accroche_classic: z.string().optional().nullable(),
  accroche_dark: z.string().optional().nullable(),
  accroche_love: z.string().optional().nullable(),
  accroche_marketing: z.string().optional().nullable(),
  accroche_dark_collection: z.string().optional().nullable(),
  niveau_intensite: z.number().int().min(1).max(5).optional().nullable(),
  niveau_douceur: z.number().int().min(1).max(5).optional().nullable(),
  niveau_danger: z.number().int().min(1).max(5).optional().nullable(),
  niveau_transformation: z.number().int().min(1).max(5).optional().nullable(),
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
