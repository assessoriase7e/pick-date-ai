"use server";

import { prisma } from "@/lib/db";

export async function getRagConfig(userId: string) {
  try {
    const data = await prisma.ragConfig.findUnique({
      where: { userId },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro ao buscar URL do webhook:", error);
    return {
      success: false,
      error: "Falha ao buscar URL do webhook",
      data: null,
    };
  }
}
