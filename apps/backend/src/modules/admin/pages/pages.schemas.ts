import { z } from 'zod';

export const createPageSchema = z.object({
  volumeVersionId: z.string(),
  assetOrder: z.number().int().min(0),
  chapterAssetId: z.string(),
});

export const updatePageOrderSchema = z.object({
  pages: z.array(z.object({
    id: z.string(),
    assetOrder: z.number().int().min(0),
  })),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageOrderInput = z.infer<typeof updatePageOrderSchema>;
