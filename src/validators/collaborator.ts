import { z } from "zod";

export const collaboratorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  workingHours: z.string().min(1, "Horários de atendimento são obrigatórios"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  profession: z.string().min(1, "Profissão é obrigatória"),
  description: z.string().optional(),
});

export type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;
