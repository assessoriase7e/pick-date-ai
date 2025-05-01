"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerProfileRagUpdate } from "../agents/rag/trigger-profile-rag-update";

// Função para atualizar um link
export async function updateLink(linkId: string, userId: string, data: any) {
  try {
    // Atualizar o link no banco de dados
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data,
    });

    // Acionar a atualização do RAG
    await triggerProfileRagUpdate(userId);

    revalidatePath("/links");
    return { success: true, data: updatedLink };
  } catch (error) {
    console.error("Erro ao atualizar link:", error);
    return { success: false, error: "Falha ao atualizar link" };
  }
}