"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateQuestionTextSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

export async function updateQuestionText(data: z.infer<typeof updateQuestionTextSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const validatedData = updateQuestionTextSchema.parse(data);

    await prisma.questionText.update({
      where: {
        id: validatedData.id,
        userId, // Garantir que o usuário só pode editar seus próprios textos
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
      },
    });

    revalidatePath("/question-texts");
    return { success: true };
  } catch (error) {
    console.error("Error updating question text:", error);
    return { success: false, error: "Erro ao atualizar texto" };
  }
}
