"use server";

import { prisma } from "@/lib/db";

export async function getAudio(id: string) {
  try {
    const audio = await prisma.audioRecord.findUnique({
      where: { id },
      include: {
        professional: true,
      },
    });

    if (!audio) {
      return { success: false, error: "Áudio não encontrado" };
    }

    return { success: true, data: audio };
  } catch (error) {
    console.error("Erro ao buscar áudio:", error);
    return { success: false, error: "Falha ao buscar áudio" };
  }
}
