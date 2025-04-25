import { z } from "zod";

export const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  presentation: z.string().nullable(),
  speechStyle: z.string().nullable(),
  expressionInterpretation: z.string().nullable(),
  schedulingScript: z.string().nullable(),
  rules: z.string().nullable(),
});
