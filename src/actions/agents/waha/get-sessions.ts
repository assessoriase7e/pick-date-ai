"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getSessions() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Usuário não autenticado",
        data: null,
      };
    }

    const sessions = await prisma.wahaInstance.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: sessions,
      error: null,
    };
  } catch (error) {
    console.error("[GET_WAHA_SESSIONS]", error);
    return {
      success: false,
      error: "Erro interno do servidor",
      data: null,
    };
  }
}
