"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function listPrompts(page = 1, limit = 10) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const skip = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.prompt.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        prompts,
        totalPages,
      },
    };
  } catch (error) {
    console.error("[PROMPTS_GET_MANY]", error);
    return {
      success: false,
      error: "Falha ao buscar prompts",
    };
  }
}
