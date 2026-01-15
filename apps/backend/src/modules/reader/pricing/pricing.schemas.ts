import { z } from "zod";

export const getVolumePriceSchema = z.object({
  chapterId: z.string().uuid(),
  volumeNumber: z.number().int().positive(),
  userId: z.string().uuid().optional(),
});

export const createCheckoutSchema = z.object({
  chapterId: z.string().uuid(),
  volumeNumber: z.number().int().positive(),
  versionScope: z.enum(["BASE", "ALL"]).default("BASE"),
});
