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
