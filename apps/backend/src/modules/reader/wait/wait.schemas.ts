import { z } from 'zod';

export const startWaitSchema = z.object({
  chapterId: z.string(),
  volumeNumber: z.number().int().min(1),
});

export const getWaitStatusSchema = z.object({
  chapterId: z.string(),
  volumeNumber: z.number().int().min(1),
});

export type StartWaitInput = z.infer<typeof startWaitSchema>;
export type GetWaitStatusInput = z.infer<typeof getWaitStatusSchema>;
