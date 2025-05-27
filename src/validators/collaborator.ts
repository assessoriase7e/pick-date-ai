import { z } from "zod";

export const collaboratorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  workHours: z.array(
    z.object({
      day: z.string().min(1, "Dia da semana é obrigatório"),
      startTime: z.string().min(1, "Horário de início é obrigatório"),
      endTime: z.string().min(1, "Horário de término é obrigatório"),
      breakStart: z.string().optional(),
      breakEnd: z.string().optional(),
    })
  ),
  phone: z.string().min(1, "Telefone é obrigatório"),
  profession: z.string().min(1, "Profissão é obrigatória"),
  description: z.string().optional(),
});

export type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;
