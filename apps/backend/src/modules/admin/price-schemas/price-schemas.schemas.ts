import { z } from "zod";

export const createPriceSchemaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceFreeToRead: z.number().int().min(0).optional(),
  pricePaywall: z.number().int().min(0).optional(),
  priceEpilogue: z.number().int().min(0).optional(),
});

export const updatePriceSchemaSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priceFreeToRead: z.number().int().min(0).optional(),
  pricePaywall: z.number().int().min(0).optional(),
  priceEpilogue: z.number().int().min(0).optional(),
  appliedFrom: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const createChapterOverrideSchema = z.object({
  schemaId: z.string(),
  priceFreeToRead: z.number().int().min(0).nullable().optional(),
  pricePaywall: z.number().int().min(0).nullable().optional(),
  priceEpilogue: z.number().int().min(0).nullable().optional(),
  reason: z.string().optional(),
});

export const updateChapterOverrideSchema = z.object({
  priceFreeToRead: z.number().int().min(0).nullable().optional(),
  pricePaywall: z.number().int().min(0).nullable().optional(),
  priceEpilogue: z.number().int().min(0).nullable().optional(),
  reason: z.string().optional(),
});

export type CreatePriceSchemaInput = z.infer<typeof createPriceSchemaSchema>;
export type UpdatePriceSchemaInput = z.infer<typeof updatePriceSchemaSchema>;
export type CreateChapterOverrideInput = z.infer<
  typeof createChapterOverrideSchema
>;
export type UpdateChapterOverrideInput = z.infer<
  typeof updateChapterOverrideSchema
>;
