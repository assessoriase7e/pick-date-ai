"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const evolutionApiUrl = process.env.EVOLUTION_API_URL as string;
const evolutionApiKey = process.env.EVOLUTION_API_KEY as string;

export async function getInstances() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const instances = await prisma.evolutionInstance.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": evolutionApiKey,
      },
    });

    if (!response.ok) {
      return { success: true, data: instances };
    }

    const apiInstances = await response.json();

    const updatedInstances = await Promise.all(
      instances.map(async (instance) => {
        const apiInstance = apiInstances.find(
          (i: any) => i.name === instance.name
        );

        const status = apiInstance?.connectionStatus || "disconnected";

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
