import { z } from "zod";

export const fileSchema = z.object({
  fileName: z.string().min(1, "O nome do arquivo é obrigatório."),
  description: z.string().default(""),
  fileUrl: z.string().min(1, "O upload do arquivo é obrigatório."),
  fileType: z.string(),
  userId: z.string().optional(),
});

export type FileFormValues = z.infer<typeof fileSchema>;
