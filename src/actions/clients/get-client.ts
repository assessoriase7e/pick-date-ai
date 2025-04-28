"use server";

import { prisma } from "@/lib/db";

export async function getClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    return {
      success: true,
      data: { client },
    };
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return {
      success: false,
      error: "Falha ao buscar cliente",
    };
  }
}
