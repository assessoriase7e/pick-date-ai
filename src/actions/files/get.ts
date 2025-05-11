"use server";

import { prisma } from "@/lib/db";

export async function getFile(id: string) {
  try {
    const file = await prisma.fileRecord.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!file) {
      return { success: false, error: "Arquivo não encontrado" };
    }

    return { success: true, data: file };
  } catch (error) {
    console.error("Erro ao buscar arquivo:", error);
    return { success: false, error: "Falha ao buscar arquivo" };
  }
}
