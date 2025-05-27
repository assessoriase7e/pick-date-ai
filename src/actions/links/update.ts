"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerProfileRagUpdate } from "../agents/rag/trigger-profile-rag-update";

export async function updateLink(linkId: number, userId: string, data: any) {
  try {
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data,
    });

    await triggerProfileRagUpdate(userId);

    revalidatePath("/links");
    return { success: true, data: updatedLink };
  } catch (error) {
    console.error("Erro ao atualizar link:", error);
    return { success: false, error: "Falha ao atualizar link" };
  }
}
