import { z } from "zod";

export const phoneSchema = z.object({
  number: z.string().min(10).max(11),
  name: z.string().optional(),
});

export const blackListPhoneSchema = z.object({
  id: z.number().optional(),
  number: z.string(),
  name: z.string().optional(),
});

export const blackListSchema = z.object({
  id: z.number().optional(),
  phones: z.array(blackListPhoneSchema),
});

export type BlackListFormValues = z.infer<typeof blackListSchema>;
