"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateLink(linkId: number, userId: string, data: any) {
  try {
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data,
    });

    revalidatePath("/links");
    return { success: true, data: updatedLink };
  } catch (error) {
    console.error("Erro ao atualizar link:", error);
    return { success: false, error: "Falha ao atualizar link" };
  }
}
