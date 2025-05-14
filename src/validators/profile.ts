import { allowedGoogleMapsDomains } from "@/mocked/mapsLinks";
import * as z from "zod";

const businessHourSchema = z.object({
  day: z.string().min(1, "Dia é obrigatório"),
  openTime: z.string().min(1, "Horário de abertura é obrigatório"),
  closeTime: z.string().min(1, "Horário de fechamento é obrigatório"),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  businessHours: z.array(businessHourSchema),
  address: z.string().min(1, "Endereço é obrigatório"),
  locationUrl: z
    .string()
    .url("URL inválida")
    .refine(
      (url) => allowedGoogleMapsDomains.some((domain) => url.includes(domain)),
      "URL deve ser um link do Google Maps"
    ),
  documentNumber: z
    .string()
    .min(1, "CPF/CNPJ é obrigatório")
    .refine((value) => {
      const numbers = value.replace(/\D/g, "");
      return numbers.length === 11 || numbers.length === 14;
    }, "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos"),
  timezone: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
