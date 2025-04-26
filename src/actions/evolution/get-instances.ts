"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const evolutionApiUrl =
  process.env.EVOLUTION_API_URL || "https://api.evolution-api.com";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

export async function getInstances() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Buscar instâncias no banco de dados
    const instances = await prisma.evolutionInstance.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Buscar status das instâncias na Evolution API
    const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
    });

    if (!response.ok) {
      // Se não conseguir buscar status, retorna as instâncias do banco
      return { success: true, data: instances };
    }

    const apiInstances = await response.json();

    // Atualizar status das instâncias
    const updatedInstances = await Promise.all(
      instances.map(async (instance) => {
        const apiInstance = apiInstances.find(
          (i: any) => i.instanceName === instance.name
        );

        const status = apiInstance?.status || "disconnected";

        // Atualizar status no banco de dados
        if (status !== instance.status) {
          await prisma.evolutionInstance.update({
            where: { id: instance.id },
            data: { status },
          });
        }

        return {
          ...instance,
          status,
        };
      })
    );

    return { success: true, data: updatedInstances };
  } catch (error) {
    console.error("Erro ao buscar instâncias:", error);
    return {
      success: false,
      error: "Falha ao buscar instâncias",
    };
  }
}
