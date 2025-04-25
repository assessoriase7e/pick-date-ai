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
  formattedContent: string;
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
      formattedContent,
    } = params;

    // Verificar se já existe um prompt para este usuário
    const existingPrompt = await prisma.attendantPrompt.findFirst({
      where: { userId },
    });

    if (existingPrompt) {
      // Atualizar o prompt existente
      await prisma.attendantPrompt.update({
        where: { id: existingPrompt.id },
        data: {
          content,
          isActive,
          presentation,
          speechStyle,
          expressionInterpretation,
          schedulingScript,
          rules,
          formattedContent,
        },
      });
    } else {
      // Criar um novo prompt
      await prisma.attendantPrompt.create({
        data: {
          userId,
          content,
          isActive,
          presentation,
          speechStyle,
          expressionInterpretation,
          schedulingScript,
          rules,
          formattedContent,
        },
      });
    }

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar prompt do atendente:", error);
    return { success: false, error: "Falha ao salvar prompt do atendente" };
  }
}
