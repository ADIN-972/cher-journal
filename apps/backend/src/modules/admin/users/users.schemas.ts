import { z } from "zod";
import {
  UserRole,
  UserStatus,
  EntitlementSource,
} from "@prisma/client";

export const updateUserSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createEntitlementSchema = z.object({
  chapterId: z.string().uuid().optional(),
  chapterIds: z.array(z.string().uuid()).optional(),
  volumeFrom: z.number().int().min(1),
  volumeTo: z.number().int().min(1),
  scopes: z.array(z.string()).default(["BASE"]),
  source: z.nativeEnum(EntitlementSource),
}).refine(
  (data) => data.chapterId || (data.chapterIds && data.chapterIds.length > 0),
  { message: "Either chapterId or chapterIds must be provided" }
);

export type CreateEntitlementInput = z.infer<typeof createEntitlementSchema>;
