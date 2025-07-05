"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteApiKey(id: number) {
  try {
    await prisma.apiKey.delete({
      where: { id },
    });

    revalidatePath("/api-keys");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir chave de API:", error);
    return { success: false, error: "Falha ao excluir chave de API" };
  }
}
