import { z } from "zod";

export const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string().optional(),
  isActive: z.boolean(),
  presentation: z.string().optional(),
  speechStyle: z.string().optional(),
  expressionInterpretation: z.string().optional(),
  schedulingScript: z.string().optional(),
  rules: z.string().optional(),
});
