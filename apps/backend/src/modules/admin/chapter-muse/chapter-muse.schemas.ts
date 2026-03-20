import { z } from "zod";

export const assignMuseSchema = z.object({
  chapterId: z.string().uuid(),
  userId: z.string().uuid(),
  customStoryId: z.string().uuid().optional(),
});

export const updateMuseSchema = z.object({
  customStoryId: z.string().uuid().nullable().optional(),
  promotionId: z.string().uuid().nullable().optional(),
});

export type AssignMuseInput = z.infer<typeof assignMuseSchema>;
export type UpdateMuseInput = z.infer<typeof updateMuseSchema>;
