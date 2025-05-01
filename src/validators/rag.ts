import { z } from "zod";

export const ragConfigSchema = z
  .object({
    webhookUrl: z.string().url({ message: "URL inválida" }).optional(),
    metadataKey: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.webhookUrl) {
        return !!data.metadataKey && data.metadataKey.trim() !== "";
      }
      return true;
    },
    {
      message:
        "O campo Metadata é obrigatório quando a URL do Webhook é fornecida.",
      path: ["metadataKey"],
    }
  );
