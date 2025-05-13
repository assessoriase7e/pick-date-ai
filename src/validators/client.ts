import { z } from "zod";

export const clientSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  birthDate: z.date().optional().nullable(),
  observations: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
