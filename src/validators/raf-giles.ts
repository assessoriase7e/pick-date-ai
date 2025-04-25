import { z } from "zod";

export const ragFileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  content: z.string(),
  metadataKey: z.string(),
});
