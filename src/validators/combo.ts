import { z } from "zod";

export const comboServiceSchema = z.object({
  serviceId: z.number().min(1, "Serviço é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que zero"),
});

export const comboSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"], {
    required_error: "Tipo de desconto é obrigatório",
  }),
  discountValue: z.number().min(0, "Valor do desconto deve ser maior ou igual a zero"),
  services: z.array(comboServiceSchema).min(1, "Pelo menos um serviço deve ser incluído"),
  isActive: z.boolean().default(true),
});

export const clientComboSchema = z.object({
  clientId: z.number().min(1, "Cliente é obrigatório"),
  comboId: z.number().min(1, "Pacote é obrigatório"),
  expiresAt: z.date().optional(),
  amountPaid: z.number().optional(),
});

export type ComboFormValues = z.infer<typeof comboSchema>;
export type ClientComboFormValues = z.infer<typeof clientComboSchema>;
export type ComboServiceFormValues = z.infer<typeof comboServiceSchema>;
