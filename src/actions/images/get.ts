"use server";

import { prisma } from "@/lib/db";

export async function getImage(id: string) {
  try {
    const image = await prisma.imageRecord.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!image) {
      return { success: false, error: "Imagem não encontrada" };
    }

    return { success: true, data: image };
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return { success: false, error: "Falha ao buscar imagem" };
  }
}
