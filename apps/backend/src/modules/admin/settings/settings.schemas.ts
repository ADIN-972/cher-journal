import { z } from 'zod';

export const upsertSettingSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
