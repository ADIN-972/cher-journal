import { z } from "zod";

// Define enums directly for Zod validation
const PriceScopeEnum = z.enum([
  "VOLUME",
  "CHAPTER",
  "EPILOGUE",
  "POV",
  "COLORING",
  "BUNDLE",
  "SUBSCRIPTION",
]);

const PromotionTypeEnum = z.enum(["PERCENT", "FIXED", "FREE"]);

const PromotionTargetTypeEnum = z.enum([
  "ALL_USERS",
  "SPECIFIC_USERS",
  "CRITERIA_BASED",
]);

const PromotionCriteriaSchema = z.object({
  minOrders: z.number().int().nonnegative().optional(),
  maxOrders: z.number().int().nonnegative().optional(),
  minTotalSpent: z.number().int().nonnegative().optional(),
  maxTotalSpent: z.number().int().nonnegative().optional(),
  registeredAfter: z.string().datetime().optional(),
  registeredBefore: z.string().datetime().optional(),
  hasOrderType: z.array(z.string()).optional(),
  roles: z.array(z.enum(["USER", "ADMIN"])).optional(),
});

export const createPromotionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  scope: PriceScopeEnum,
  refId: z.string().uuid().optional(),
  type: PromotionTypeEnum,
  value: z.number().int().optional(), // percent or cents
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  maxUses: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  targetType: PromotionTargetTypeEnum.default("ALL_USERS"),
  targetUserIds: z.array(z.string().uuid()).optional(),
  targetCriteria: PromotionCriteriaSchema.optional(),
  priceId: z.string().uuid().optional(),
});

export const updatePromotionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: PromotionTypeEnum.optional(),
  value: z.number().int().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  maxUses: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  targetType: PromotionTargetTypeEnum.optional(),
  targetUserIds: z.array(z.string().uuid()).optional(),
  targetCriteria: PromotionCriteriaSchema.optional(),
});

export const previewTargetingSchema = z.object({
  targetType: PromotionTargetTypeEnum,
  targetUserIds: z.array(z.string().uuid()).optional(),
  targetCriteria: PromotionCriteriaSchema.optional(),
});

export const listPromotionsSchema = z.object({
  scope: PriceScopeEnum.optional(),
  refId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createPriceSchema = z.object({
  scope: PriceScopeEnum,
  refId: z.string().uuid().optional(),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("EUR"),
});

export const updatePriceSchema = z.object({
  amountCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
});

export const listPricesSchema = z.object({
  scope: PriceScopeEnum.optional(),
  refId: z.string().uuid().optional(),
});

// Type inference from schemas
export type CreatePromotionDto = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionDto = z.infer<typeof updatePromotionSchema>;
export type ListPromotionsQuery = z.infer<typeof listPromotionsSchema>;
export type CreatePriceDto = z.infer<typeof createPriceSchema>;
export type UpdatePriceDto = z.infer<typeof updatePriceSchema>;
export type ListPricesQuery = z.infer<typeof listPricesSchema>;
export type PreviewTargetingQuery = z.infer<typeof previewTargetingSchema>;
