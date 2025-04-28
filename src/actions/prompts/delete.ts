"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function deletePrompt(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const prompt = await prisma.prompt.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!prompt) {
      return {
        success: false,
        error: "Prompt não encontrado",
      };
    }

    await prisma.prompt.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[PROMPT_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir prompt",
    };
  }
}
