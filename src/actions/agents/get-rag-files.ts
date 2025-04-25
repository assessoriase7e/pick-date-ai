"use server";

import { prisma } from "@/lib/db";

export async function getRagFiles(userId: string) {
  try {
    const files = await prisma.ragFile.findMany({
      where: { userId },
      select: {
        id: true,
        name: true, // Certifique-se de que o campo no banco é 'name' e não 'fileName'
        content: true,
        createdAt: true,
      },
    });

    console.log("Arquivos RAG encontrados:", files.length);
    
    return {
      success: true,
      data: { files }, // Certifique-se de que a chave é 'files'
    };
  } catch (error) {
    console.error("Erro ao buscar arquivos RAG:", error);
    return { success: false, error: "Falha ao buscar arquivos RAG" };
  }
}
