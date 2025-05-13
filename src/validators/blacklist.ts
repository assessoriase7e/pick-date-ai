import { z } from "zod";

export const phoneSchema = z.string().min(10).max(11);

export const blackListSchema = z.object({
  id: z.string().optional(),
  phones: z.array(phoneSchema),
});

export type BlackListFormValues = z.infer<typeof blackListSchema>;