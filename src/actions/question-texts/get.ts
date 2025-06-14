"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getQuestionTexts() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado", data: [] };
    }

    const questionTexts = await prisma.questionText.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: questionTexts };
  } catch (error) {
    console.error("Error fetching question texts:", error);
    return { success: false, error: "Erro ao buscar textos", data: [] };
  }
}
