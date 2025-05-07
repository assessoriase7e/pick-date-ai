import { z } from "zod";

export const evolutionFormSchema = z.object({
  id: z.string().optional(),

  number: z.string().min(1, "Número é obrigatório"),
  qrCode: z.boolean(),
  type: z.enum(["attendant", "sdr", "followup"]),
});

export const createInstanceSchema = z.object({
  number: z.string().min(1, "Número é obrigatório"),
  qrCode: z.boolean().default(true),
  type: z.enum(["attendant", "sdr", "followup"]),
});
