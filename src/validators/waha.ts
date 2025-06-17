import { z } from "zod";

export const wahaFormSchema = z.object({
  name: z.string().optional(),
  number: z.string().min(1, "Número é obrigatório"),
});

export const createSessionSchema = z.object({
  name: z.string().optional(),
  number: z.string().min(1, "Número é obrigatório"),
});

export const updateSessionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().optional(),
  number: z.string().min(1, "Número é obrigatório"),
});
