"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getPrompt(id: string) {
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

    return {
      success: true,
      data: prompt,
    };
  } catch (error) {
    console.error("[PROMPT_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar prompt",
    };
  }
}
