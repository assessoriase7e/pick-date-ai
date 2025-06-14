"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteQuestionText(id: number) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await prisma.questionText.delete({
      where: {
        id,
        userId, // Garantir que o usuário só pode deletar seus próprios textos
      },
    });

    revalidatePath("/question-texts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting question text:", error);
    return { success: false, error: "Erro ao deletar texto" };
  }
}
