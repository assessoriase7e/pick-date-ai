"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const promptSchema = z.object({
  userId: z.string(),
  type: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  presentation: z.string().optional(),
  speechStyle: z.string().optional(),
  expressionInterpretation: z.string().optional(),
  schedulingScript: z.string().optional(),
  rules: z.string().optional(),
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

    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        userId: data.userId,
        type: data.type,
      },
    });

    let prompt;

    const promptData = {
      content: data.content,
      isActive: data.isActive,
      presentation: data.presentation,
      speechStyle: data.speechStyle,
      expressionInterpretation: data.expressionInterpretation,
      schedulingScript: data.schedulingScript,
      rules: data.rules,
    };

    if (existingPrompt) {
      prompt = await prisma.prompt.update({
        where: {
          id: existingPrompt.id,
        },
        data: promptData,
      });
    } else {
      prompt = await prisma.prompt.create({
        data: {
          userId: data.userId,
          type: data.type,
          ...promptData,
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
