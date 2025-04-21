import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { AudioRecord } from "@prisma/client";

export async function createAudio(data: AudioRecord) {
  try {
    const audio = await prisma.audioRecord.create({
      data: {
        audioBase64: data.audioBase64,
        description: data.description,
        professionalId: data.professionalId,
      },
    });

    revalidatePath("/audios");
    return { success: true, data: audio };
  } catch (error) {
    console.error("Erro ao criar áudio:", error);
    return { success: false, error: "Falha ao criar áudio" };
  }
}