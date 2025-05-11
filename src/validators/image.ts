import * as z from "zod";

export const imageSchema = z.object({
  imageFile: z
    .custom<File>()
    .refine((file) => file instanceof File, "Arquivo é obrigatório")
    .refine(
      (file) => file?.type?.startsWith("image/"),
      "Por favor, selecione um arquivo de imagem"
    ),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(500, "A descrição deve ter no máximo 500 caracteres"),
});

export type ImageFormValues = z.infer<typeof imageSchema>;