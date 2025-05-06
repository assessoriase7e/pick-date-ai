"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface SaveSdrPromptParams {
  userId: string;
  content: string;
  isActive: boolean;
}

export async function saveSdrPrompt(params: SaveSdrPromptParams) {
  try {
    const { userId, content, isActive } = params;

    const existingPrompt = await prisma.sdrPrompt.findFirst({
      where: { userId },
    });

    if (existingPrompt) {
      await prisma.sdrPrompt.update({
        where: { id: existingPrompt.id },
        data: {
          content,
          isActive,
        },
      });
    } else {
      await prisma.sdrPrompt.create({
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
    console.error("Erro ao salvar prompt do SDR:", error);
    return { success: false, error: "Falha ao salvar prompt do SDR" };
  }
}
