"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SaveAttendantPromptParams {
  userId: string;
  content: string;
  isActive: boolean;
  presentation: string;
  speechStyle: string;
  expressionInterpretation: string;
  schedulingScript: string;
  rules: string;
  suportPhone?: string;
}

export async function saveAttendantPrompt(params: SaveAttendantPromptParams) {
  try {
    const {
      userId,
      content,
      isActive,
      presentation,
      speechStyle,
      expressionInterpretation,
      schedulingScript,
      rules,
      suportPhone,
    } = params;

    const formattedContent = `Apresentação: ${presentation}\n\nEstilo da Fala: ${speechStyle}\n\nInterpretação de Expressões: ${expressionInterpretation}\n\nScript de Agendamento: ${schedulingScript}\n\nRegras: ${rules}`;

    await prisma.attendantPrompt.upsert({
      where: { userId },
      update: {
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
        formattedContent,
        suportPhone,
      },
      create: {
        userId,
        content,
        isActive,
        presentation,
        speechStyle,
        expressionInterpretation,
        schedulingScript,
        rules,
        formattedContent,
        suportPhone,
      },
    });

    revalidatePath("/agentes");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar prompt do atendente:", error);
    return { success: false, error: "Falha ao salvar prompt do atendente" };
  }
}
