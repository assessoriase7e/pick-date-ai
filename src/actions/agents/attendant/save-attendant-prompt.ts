"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { hasAIPlan } from "@/lib/subscription-limits";

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
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== params.userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

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

    // Verificar se o usuário tem plano de IA antes de permitir ativação
    if (isActive) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: "active" },
      });

      const hasAI = await hasAIPlan(subscription);
      
      if (!hasAI) {
        return {
          success: false,
          error: "Você precisa de um plano de IA ativo para ativar o agente atendente.",
        };
      }
    }

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
