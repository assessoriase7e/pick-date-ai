import { z } from "zod";

// Schemas base que serão reutilizados
export const expressionSchema = z.object({
  expression: z.string(),
  translation: z.string(),
});

export const schedulingStepSchema = z.object({
  step: z.string(),
});

export const ruleSchema = z.object({
  rule: z.string(),
});

// Schema para o formulário do componente AttendantTab
export const attendantFormSchema = z.object({
  isActive: z.boolean(),
  presentation: z.string().min(1, "A apresentação é obrigatória"),
  speechStyle: z.string().min(1, "O estilo de fala é obrigatório"),
  expressionInterpretation: z.array(expressionSchema),
  schedulingScript: z.array(schedulingStepSchema),
  rules: z.array(ruleSchema),
  suportPhone: z.string().min(1, "O número é obrigatório"),
});

// Schema para o prompt (usado nas ações de servidor)
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
  suportPhone: z.string().optional(),
});

// Tipos exportados para uso em outros arquivos
export type AttendantFormValues = z.infer<typeof attendantFormSchema>;
export type PromptSchemaValues = z.infer<typeof promptSchema>;
