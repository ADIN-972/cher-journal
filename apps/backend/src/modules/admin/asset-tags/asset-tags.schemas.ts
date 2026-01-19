import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color")
    .optional(),
});

export const tagAssetSchema = z.object({
  tagId: z.string().uuid(),
});

export const bulkTagSchema = z.object({
  assetIds: z.array(z.string().uuid()).min(1),
  tagIds: z.array(z.string().uuid()).min(1),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagAssetInput = z.infer<typeof tagAssetSchema>;
export type BulkTagInput = z.infer<typeof bulkTagSchema>;
