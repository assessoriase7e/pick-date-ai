"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getPrompt(userId: string, type: string) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const prompt = await prisma.prompt.findFirst({
      where: {
        userId,
        type,
      },
    });

    return {
      success: true,
      data: {
        prompt,
      },
    };
  } catch (error) {
    console.error("[PROMPT_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar prompt",
    };
  }
}
