import { prisma } from "@/lib/db";
import { AudioRecord } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateAudio(id: string, data: Partial<AudioRecord>) {
  try {
    const audio = await prisma.audioRecord.update({
      where: { id },
      data: {
        ...(data.audioBase64 && { audioBase64: data.audioBase64 }),
        ...(data.description && { description: data.description }),
        ...(data.professionalId && { professionalId: data.professionalId }),
      },
      include: {
        professional: true,
      },
    });

    revalidatePath("/audios");
    return { success: true, data: audio };
  } catch (error) {
    console.error("Erro ao atualizar áudio:", error);
    return { success: false, error: "Falha ao atualizar áudio" };
  }
}