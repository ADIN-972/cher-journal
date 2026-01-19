import { z } from "zod";

export const assignAssetToVersionSchema = z.object({}).strict();

export const listAssetsQuerySchema = z.object({
  kind: z.enum(["IMAGE", "COLORING_PAGE"]).optional(),
  search: z.string().optional(),
  tagIds: z.string().optional(), // Comma-separated tag IDs
  showDuplicates: z.string().optional(), // "true" or "false"
});

export type AssignAssetToVersionInput = z.infer<
  typeof assignAssetToVersionSchema
>;
export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>;
