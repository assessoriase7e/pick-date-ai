"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateApiKey(id: string, data: { description?: string }) {
  try {
    const apiKey = await prisma.apiKey.update({
      where: { id },
      data,
    });

    revalidatePath("/api-keys");
    return { success: true, data: apiKey };
  } catch (error) {
    console.error("Erro ao atualizar chave de API:", error);
    return { success: false, error: "Falha ao atualizar chave de API" };
  }
}