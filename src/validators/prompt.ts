import { z } from "zod";

export const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean().default(false),
});

export type PromptFormValues = z.infer<typeof promptSchema>;