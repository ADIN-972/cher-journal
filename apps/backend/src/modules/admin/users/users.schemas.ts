import { z } from "zod";
import {
  UserRole,
  UserStatus,
  EntitlementVersionScope,
  EntitlementSource,
} from "@prisma/client";

export const updateUserSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createEntitlementSchema = z.object({
  chapterId: z.string().uuid(),
  volumeFrom: z.number().int().min(1),
  volumeTo: z.number().int().min(1),
  versionScope: z.nativeEnum(EntitlementVersionScope),
  source: z.nativeEnum(EntitlementSource),
});

export type CreateEntitlementInput = z.infer<typeof createEntitlementSchema>;
