"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createQuestionTextSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

export async function createQuestionText(data: z.infer<typeof createQuestionTextSchema>) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const validatedData = createQuestionTextSchema.parse(data);

    const questionText = await prisma.questionText.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        userId: user.id,
      },
    });

    revalidatePath("/question-texts");
    return { success: true, data: questionText };
  } catch (error) {
    console.error("Error creating question text:", error);
    return { success: false, error: "Erro ao criar texto" };
  }
}
