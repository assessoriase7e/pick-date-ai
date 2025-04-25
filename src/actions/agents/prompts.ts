"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { promptSchema } from "@/validators/prompts";

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

    if (existingPrompt) {
      prompt = await prisma.prompt.update({
        where: {
          id: existingPrompt.id,
        },
        data: createPromptData(data),
      });
    } else {
      prompt = await prisma.prompt.create({
        data: {
          userId: data.userId,
          type: data.type,
          ...createPromptData(data),
        },
      });
    }

    function createPromptData(data: z.infer<typeof promptSchema>) {
      return {
        content: data.content || "",
        isActive: data.isActive,
        ...(data.presentation && { presentation: data.presentation }),
        ...(data.speechStyle && { speechStyle: data.speechStyle }),
        ...(data.expressionInterpretation && {
          expressionInterpretation: data.expressionInterpretation,
        }),
        ...(data.schedulingScript && {
          schedulingScript: data.schedulingScript,
        }),
        ...(data.rules && { rules: data.rules }),
      };
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

export async function getPrompts(userId: string) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId || authUserId !== userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const prompts = await prisma.prompt.findMany({
      where: {
        userId,
      },
    });

    return {
      success: true,
      data: {
        prompts,
      },
    };
  } catch (error) {
    console.error("[PROMPTS_GET]", error);
    return {
      success: false,
      error: "Falha ao buscar prompts",
    };
  }
}
