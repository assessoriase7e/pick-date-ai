import { z } from "zod";

const expressionSchema = z.object({
  expression: z.string(),
  translation: z.string()
});

const schedulingStepSchema = z.object({
  step: z.string()
});

const ruleSchema = z.object({
  rule: z.string()
});

export const attendantSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  presentation: z.string().min(1, "A apresentação é obrigatória"),
  speechStyle: z.string().min(1, "O estilo de fala é obrigatório"),
  expressionInterpretation: z.array(expressionSchema).nullable(),
  schedulingScript: z.array(schedulingStepSchema).min(3, "Adicione pelo menos 3 passos no script de agendamento"),
  rules: z.array(ruleSchema).nullable(),
  formattedContent: z.string(),
});

export const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  presentation: z.string().nullable(),
  speechStyle: z.string().nullable(),
  expressionInterpretation: z.string().nullable(),
  schedulingScript: z.string().nullable(),
  rules: z.string().nullable(),
  formattedContent: z.string().optional(),
});
