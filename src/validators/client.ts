import { z } from "zod";
import { 
  invalidPhonePatterns, 
  hasAllSameDigits, 
  hasSequentialPattern, 
  hasValidDDD 
} from "@/mocked/invalidPhonePatterns";

// Função para verificar se o número é válido
const isValidPhone = (phone: string) => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");
  
  // Verifica se o número está na lista de padrões inválidos
  if (invalidPhonePatterns.includes(cleaned)) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (hasAllSameDigits(cleaned)) {
    return false;
  }
  
  // Verifica se o número tem um formato sequencial simples
  if (hasSequentialPattern(cleaned)) {
    return false;
  }
  
  // Verifica DDD válido
  if (!hasValidDDD(cleaned)) {
    return false;
  }
  
  return true;
};

export const clientSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  phone: z.string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .refine(isValidPhone, {
      message: "Número de telefone inválido ou em formato não aceito"
    }),
  birthDate: z.date().optional().nullable(),
  observations: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
