import { z } from 'zod';

export const assignAssetToVersionSchema = z.object({}).strict();

export type AssignAssetToVersionInput = z.infer<typeof assignAssetToVersionSchema>;
