"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { promptSchema } from "@/validators/attendant";

export async function updatePrompt(
  id: string,
  data: z.infer<typeof promptSchema>
) {
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

    const validatedData = promptSchema.parse(data);

    const updatedPrompt = await prisma.prompt.update({
      where: {
        id,
      },
      data: validatedData,
    });

    return {
      success: true,
      data: updatedPrompt,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[PROMPT_UPDATE]", error);
    return {
      success: false,
      error: "Falha ao atualizar prompt",
    };
  }
}
