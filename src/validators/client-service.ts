import { z } from "zod";

export const clientServiceSchema = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  serviceId: z.string({
    required_error: "Serviço é obrigatório",
  }),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
});

export type ClientServiceFormValues = z.infer<typeof clientServiceSchema>;
