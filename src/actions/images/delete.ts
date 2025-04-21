import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteImage(id: string) {
  try {
    await prisma.imageRecord.delete({
      where: { id },
    });

    revalidatePath("/images");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
    return { success: false, error: "Falha ao excluir imagem" };
  }
}
