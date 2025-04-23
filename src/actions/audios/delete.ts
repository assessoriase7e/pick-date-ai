"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAudio(id: string) {
  try {
    const audio = await prisma.audioRecord.findUnique({
      where: { id },
    });

    if (!audio) {
      return { success: false, error: "Áudio não encontrado" };
    }

    await prisma.audioRecord.delete({
      where: { id },
    });

    revalidatePath("/audios");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir áudio:", error);
    return { success: false, error: "Falha ao excluir áudio" };
  }
}
