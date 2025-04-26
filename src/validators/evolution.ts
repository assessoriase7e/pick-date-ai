import { z } from "zod";

export const evolutionFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  qrCode: z.boolean(),
  webhookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const createInstanceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  qrCode: z.boolean().default(true),
  webhookUrl: z.string().url().optional().or(z.literal("")),
});
