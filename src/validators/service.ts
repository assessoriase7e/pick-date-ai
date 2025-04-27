import { z } from "zod";

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  availableDays: z.array(z.string()).min(1, "Selecione pelo menos um dia disponível"),
  professionalName: z.string().min(1, "Nome do profissional é obrigatório"),
  notes: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;