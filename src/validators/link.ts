import { z } from "zod";

export const linkSchema = z.object({
  url: z.string().url({
    message: "Por favor, insira uma URL válida.",
  }),
  title: z.string().min(1, {
    message: "O título é obrigatório.",
  }),
  description: z.string().min(1, {
    message: "A descrição é obrigatória.",
  }),
});
