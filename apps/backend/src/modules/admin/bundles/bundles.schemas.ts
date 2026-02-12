import { z } from "zod";

export const bundleItemSchema = z.object({
  type: z.enum(["CHAPTER", "VOLUME"]),
  chapterId: z.string().uuid().optional(),
  volumeFrom: z.number().int().positive().optional(),
  volumeTo: z.number().int().positive().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

export const createBundleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1).max(100),
  amountCents: z.number().int().nonnegative(),
  originalAmountCents: z.number().int().nonnegative(),
  currency: z.string().length(3).optional().default("EUR"),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().nonnegative().optional(),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional().transform((val) => val === "" ? undefined : val),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  maxPurchases: z.number().int().positive().optional(),
  items: z.array(bundleItemSchema).min(1),
});

export const updateBundleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1).max(100).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  originalAmountCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional().transform((val) => val === "" ? undefined : val),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  maxPurchases: z.number().int().positive().optional(),
  items: z.array(bundleItemSchema).min(1).optional(),
});

export const listBundlesSchema = z.object({
  isActive: z.string().transform((val) => val === "true").optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  search: z.string().optional(),
});

export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>;
export type ListBundlesQuery = z.infer<typeof listBundlesSchema>;
export type BundleItemInput = z.infer<typeof bundleItemSchema>;
