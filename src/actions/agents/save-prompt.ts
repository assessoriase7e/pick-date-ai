"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean(),
});

export async function savePrompt(data: z.infer<typeof promptSchema>) {
  try {
    const { userId } = await auth();

    if (!userId || userId !== data.userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Verificar se já existe um prompt deste tipo para o usuário
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        userId: data.userId,
        type: data.type,
      },
    });

    let prompt;

    if (existingPrompt) {
      // Atualizar o prompt existente
      prompt = await prisma.prompt.update({
        where: {
          id: existingPrompt.id,
        },
        data: {
          content: data.content,
          isActive: data.isActive,
        },
      });
    } else {
      // Criar um novo prompt
      prompt = await prisma.prompt.create({
        data: {
          userId: data.userId,
          type: data.type,
          content: data.content,
          isActive: data.isActive,
        },
      });
    }

    return {
      success: true,
      data: prompt,
    };
  } catch (error) {
    console.error("[PROMPT_SAVE]", error);
    return {
      success: false,
      error: "Falha ao salvar prompt",
    };
  }
}
