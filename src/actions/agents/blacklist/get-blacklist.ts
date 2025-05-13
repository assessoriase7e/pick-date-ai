"use server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getBlackList(userId?: string) {
  try {
    const session = await auth();
    const currentUserId = userId || session.userId;

    if (!currentUserId) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const blackList = await prisma.blackList.findUnique({
      where: { userId: currentUserId },
    });

    return {
      success: true,
      data: {
        blackList,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar lista negra:", error);
    return {
      success: false,
      error: "Falha ao buscar lista negra",
    };
  }
}