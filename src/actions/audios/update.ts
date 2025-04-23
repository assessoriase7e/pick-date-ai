"use server";

import { prisma } from "@/lib/db";
import { AudioRecord } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateAudio(id: string, data: Partial<AudioRecord>) {
  try {
    const audio = await prisma.audioRecord.update({
      where: { id },
      data,
    });

    revalidatePath("/audios");
    return { success: true, data: audio };
  } catch (error) {
    console.error("Erro ao atualizar áudio:", error);
    return { success: false, error: "Falha ao atualizar áudio" };
  }
}
