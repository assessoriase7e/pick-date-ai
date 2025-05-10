"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { promptSchema } from "@/validators/attendant";

export async function createPrompt(data: z.infer<typeof promptSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const validatedData = promptSchema.parse(data);

    const prompt = await prisma.prompt.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return {
      success: true,
      data: prompt,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Dados inválidos",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    console.error("[PROMPT_CREATE]", error);
    return {
      success: false,
      error: "Falha ao criar prompt",
    };
  }
}
