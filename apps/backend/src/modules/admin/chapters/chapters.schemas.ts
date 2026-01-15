import { z } from "zod";
import { ChapterStatus, Perspective } from "@prisma/client";

export const createChapterSchema = z.object({
  title: z.string().min(1),
  protagonistName: z.string().min(1),
  status: z.nativeEnum(ChapterStatus).optional(),
  priceFreeToRead: z.number().int().min(0).optional().default(0),
  pricePaywall: z.number().int().min(0).optional().default(0),
  priceEpilogue: z.number().int().min(0).optional().default(0),
  publishedAt: z.string().datetime().optional().nullable(),
  coverAssetId: z.string().nullable().optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  protagonistName: z.string().min(1).optional(),
  status: z.nativeEnum(ChapterStatus).optional(),
  priceFreeToRead: z.number().int().min(0).optional(),
  pricePaywall: z.number().int().min(0).optional(),
  priceEpilogue: z.number().int().min(0).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  coverAssetId: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
});

export const bootstrapVolumesSchema = z.object({
  count: z.number().int().min(1).max(20),
  extraVolumes: z.number().int().min(0).max(10).optional(),
});

export const bulkUpdateChaptersSchema = z.object({
  chapterIds: z.array(z.string()).min(1),
  updates: z.object({
    status: z.nativeEnum(ChapterStatus).optional(),
    priceFreeToRead: z.number().int().min(0).optional(),
    pricePaywall: z.number().int().min(0).optional(),
    priceEpilogue: z.number().int().min(0).optional(),
    publishedAt: z.string().datetime().optional().nullable(),
  }),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type BootstrapVolumesInput = z.infer<typeof bootstrapVolumesSchema>;
export type BulkUpdateChaptersInput = z.infer<typeof bulkUpdateChaptersSchema>;
