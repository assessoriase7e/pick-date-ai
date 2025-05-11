"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteFile(id: string) {
  try {
    await prisma.fileRecord.delete({
      where: { id },
    });

    revalidatePath("/files");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);
    return { success: false, error: "Falha ao excluir arquivo" };
  }
}
