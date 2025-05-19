import { z } from "zod";

export const phoneSchema = z.object({
    number: z.string().min(10).max(11),
    name: z.string().optional(),
});

export const blackListPhoneSchema = z.object({
    id: z.string().optional(),
    number: z.string(),
    name: z.string().optional(),
});

export const blackListSchema = z.object({
    id: z.string().optional(),
    phones: z.array(blackListPhoneSchema),
});

export type BlackListFormValues = z.infer<typeof blackListSchema>;
