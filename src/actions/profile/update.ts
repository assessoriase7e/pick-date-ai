"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { triggerProfileRagUpdate } from "../agents/rag/trigger-profile-rag-update";

export async function updateProfile(userId: string, data: any) {
  try {
    // Atualizar o perfil no banco de dados
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data,
    });

    // Acionar a atualização do RAG
    await triggerProfileRagUpdate(userId);

    revalidatePath("/profile");
    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { success: false, error: "Falha ao atualizar perfil" };
  }
}
