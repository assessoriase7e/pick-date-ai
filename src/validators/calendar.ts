import { z } from "zod";

// Schema para operações de banco de dados (inclui userId)
export const calendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  userId: z.string(),
});

// Schema para validação de formulário (sem userId)
export const calendarFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});
