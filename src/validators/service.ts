import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  availableDays: z
    .array(z.string())
    .min(1, "Selecione pelo menos um dia disponível"),
  notes: z.string().nullable(),
  durationMinutes: z.number().min(1, "Duração deve ser maior que zero"),
  collaboratorId: z.string().nullable(),
  commission: z.number().nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
