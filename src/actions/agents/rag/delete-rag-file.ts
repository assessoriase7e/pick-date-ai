"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function deleteRagFile(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    const file = await prisma.ragFile.findUnique({
      where: {
        id,
      },
    });

    if (!file || file.userId !== userId) {
      return {
        success: false,
        error: "Arquivo não encontrado ou não autorizado",
      };
    }

    await prisma.ragFile.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("[RAG_FILE_DELETE]", error);
    return {
      success: false,
      error: "Falha ao excluir arquivo",
    };
  }
}
