"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function getClients() {
  return unstable_cache(
    async () => {
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
    },
    ["clients-list"],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["clients"]
    }
  )();
}
