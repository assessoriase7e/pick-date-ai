"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SaveFollowUpPromptParams {
  userId: string;
  content: string;
  isActive: boolean;
}

export async function saveFollowUpPrompt(params: SaveFollowUpPromptParams) {
  try {
    const { userId, content, isActive } = params;

    // Verificar se já existe um prompt para este usuário
    const existingPrompt = await prisma.followUpPrompt.findFirst({
      where: { userId },
    });

    if (existingPrompt) {
      // Atualizar o prompt existente
      await prisma.followUpPrompt.update({
        where: { id: existingPrompt.id },
        data: {
          content,
          isActive,
        },
      });
    } else {
      // Criar um novo prompt
      await prisma.followUpPrompt.create({
        data: {
          userId,
          content,
          isActive,
        },
      });
    }

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar prompt do Follow Up:", error);
    return { success: false, error: "Falha ao salvar prompt do Follow Up" };
  }
}
