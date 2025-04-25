"use server";

import { prisma } from "@/lib/db";

export async function getRagFiles(userId: string) {
  try {
    const files = await prisma.ragFile.findMany({
      where: { userId },
    });

    return {
      success: true,
      data: files,
    };
  } catch (error) {
    console.error("Erro ao buscar arquivos RAG:", error);
    return { success: false, error: "Falha ao buscar arquivos RAG" };
  }
}
