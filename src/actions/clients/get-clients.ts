"use server";

import { prisma } from "@/lib/db";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        fullName: "asc",
      },
    });

    return {
      success: true,
      data: { clients },
    };
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return {
      success: false,
      error: "Falha ao buscar clientes",
    };
  }
}
