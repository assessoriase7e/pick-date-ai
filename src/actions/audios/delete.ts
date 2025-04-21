import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAudio(id: string) {
  try {
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