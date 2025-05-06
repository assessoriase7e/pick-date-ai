"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const evolutionApiUrl =
  process.env.EVOLUTION_API_URL || "https://api.evolution-api.com";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

export async function deleteInstance(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const instance = await prisma.evolutionInstance.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!instance) {
      return {
        success: false,
        error: "Instância não encontrada",
      };
    }

    await fetch(`${evolutionApiUrl}/instance/delete/${instance.name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
    });

    await prisma.evolutionInstance.delete({
      where: { id },
    });

    revalidatePath("/agents");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir instância:", error);
    return {
      success: false,
      error: "Falha ao excluir instância",
    };
  }
}
