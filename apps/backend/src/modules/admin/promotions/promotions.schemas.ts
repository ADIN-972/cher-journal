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

export const createPromotionSchema = z.object({
  scope: PriceScopeEnum,
  refId: z.string().uuid().optional(),
  type: PromotionTypeEnum,
  value: z.number().int().optional(), // percent or cents
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  maxUses: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  priceId: z.string().uuid().optional(),
});

export const updatePromotionSchema = z.object({
  type: PromotionTypeEnum.optional(),
  value: z.number().int().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  maxUses: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
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
