import { z } from "zod";

export const audioSchema = z.object({
  description: z.string().min(1, {
    message: "A descrição é obrigatória.",
  }),
  audioFile: z
    .instanceof(File, { message: "O arquivo de áudio é obrigatório." })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "O arquivo deve ter no máximo 10MB.",
    })
    .refine(
      (file) =>
        file.type === "audio/mpeg" ||
        file.type === "audio/wav" ||
        file.type === "audio/ogg",
      {
        message: "O arquivo deve ser um áudio (MP3, WAV ou OGG).",
      }
    )
    .optional(),
});
