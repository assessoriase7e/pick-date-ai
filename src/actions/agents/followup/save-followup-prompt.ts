"use server";

import { prisma } from "@/lib/db";
import { hasAIPlan } from "@/lib/subscription-limits";
import { revalidatePath } from "next/cache";

interface SaveFollowUpPromptParams {
  userId: string;
  content: string;
  isActive: boolean;
}

export async function saveFollowUpPrompt(params: SaveFollowUpPromptParams) {
  try {
    const { userId, content, isActive } = params;

    // Verificar se o usuário tem plano de IA antes de permitir ativação
    if (isActive) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: "active" },
      });

      const hasAI = await hasAIPlan(subscription);

      if (!hasAI) {
        return {
          success: false,
          error: "Você precisa de um plano de IA ativo para ativar o agente de Follow Up.",
        };
      }
    }

    await prisma.followUpPrompt.upsert({
      where: { userId },
      update: {
        content,
        isActive,
      },
      create: {
        userId,
        content,
        isActive,
      },
    });

    revalidatePath("/agentes");

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar prompt do Follow Up:", error);
    return { success: false, error: "Falha ao salvar prompt do Follow Up" };
  }
}
