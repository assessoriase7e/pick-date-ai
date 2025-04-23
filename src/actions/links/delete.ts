"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function deleteLink(id: string) {
  try {
    await prisma.link.delete({
      where: { id },
    });

    revalidatePath("/links");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir link:", error);
    return { success: false, error: "Falha ao excluir link" };
  }
}