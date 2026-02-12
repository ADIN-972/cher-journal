import { z } from "zod";

export const createVolumeSchema = z.object({
  title: z.string().min(1),
  waitDuration: z.number().int().min(0),
  isFinalPaywall: z.boolean().optional().default(false),
  isFree: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateVolumeSchema = z.object({
  title: z.string().min(1).optional(),
  waitDuration: z.number().int().min(0).optional(),
  isFinalPaywall: z.boolean().optional(),
  isFree: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  illustrationAssetId: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
});

export const updateVolumeVersionSchema = z.object({
  title: z.string().optional(),
  illustrationAssetId: z.string().nullable().optional(),
  text: z.string().optional(), // Plain text that will be encrypted
});

export const bulkUpdateVolumesSchema = z.object({
  volumeIds: z.array(z.string()).min(1),
  updates: z.object({
    title: z.string().min(1).optional(),
    waitDuration: z.number().int().min(0).optional(),
    isFinalPaywall: z.boolean().optional(),
    isFree: z.boolean().optional(),
    publishedAt: z.string().datetime().optional().nullable(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
  }),
});

export const bulkImportVolumeSchema = z.object({
  volumeNumber: z.number().int().min(1),
  title: z.string().min(1),
  narratorText: z.string(),
  protagonistText: z.string().optional(),
});

export type CreateVolumeInput = z.infer<typeof createVolumeSchema>;
export type UpdateVolumeInput = z.infer<typeof updateVolumeSchema>;
export type UpdateVolumeVersionInput = z.infer<
  typeof updateVolumeVersionSchema
>;
export type BulkUpdateVolumesInput = z.infer<typeof bulkUpdateVolumesSchema>;
export type BulkImportVolumeInput = z.infer<typeof bulkImportVolumeSchema>;
