"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function deleteDocument(id: string) {
  try {
    await prisma.documentRecord.delete({
      where: { id },
    });

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    return { success: false, error: "Falha ao excluir documento" };
  }
}