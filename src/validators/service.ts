import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  availableDays: z.array(z.string()),
  notes: z.string().nullable(),
  collaboratorIds: z.array(z.number()),
  categoryId: z.number().nullable().optional(), // Nova propriedade
  durationMinutes: z.number().min(1, "Duração deve ser maior que zero"),
  commission: z.number().nullable().optional(),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
