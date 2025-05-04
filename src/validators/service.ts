import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  availableDays: z.array(z.string()),
  notes: z.string().nullable(),
  collaboratorIds: z.array(z.string()),
  durationMinutes: z.number().min(1, "Duração deve ser maior que zero"),
  commission: z
    .number()
    .min(0, "Comissão deve ser maior ou igual a zero")
    .max(100, "Comissão deve ser menor ou igual a 100"),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
