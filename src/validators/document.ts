import { z } from "zod";

export const documentSchema = z.object({
  description: z.string().min(1, {
    message: "A descrição é obrigatória.",
  }),
  documentFile: z
    .instanceof(File, { message: "O arquivo é obrigatório." })
    .refine(
      (file) => {
        // Limit file size to 1MB for PDFs
        if (file.type === "application/pdf") {
          return file.size <= 1 * 1024 * 1024; // 1MB
        }
        // Keep the original 10MB limit for other file types
        return file.size <= 10 * 1024 * 1024;
      },
      {
        message:
          "Arquivos PDF devem ter no máximo 1MB. Outros tipos de arquivo podem ter até 10MB.",
      }
    )
    .refine(
      (file) => {
        const type = file.type;
        return (
          type === "application/pdf" ||
          type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      },
      {
        message: "O arquivo deve ser um PDF ou DOCX.",
      }
    )
    .optional(),
});
