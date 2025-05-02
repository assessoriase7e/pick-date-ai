"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function getClient(id: string) {
  return unstable_cache(
    async () => {
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
    },
    [`client-${id}`],
    {
      revalidate: 60 * 5, // 5 minutos
      tags: ["clients"]
    }
  )();
}
