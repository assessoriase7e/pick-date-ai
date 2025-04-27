"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const evolutionApiUrl = process.env.EVOLUTION_API_URL;
const evolutionApiKey = process.env.EVOLUTION_API_KEY;

export async function getConnectionStatus(instanceName: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const instance = await prisma.evolutionInstance.findFirst({
      where: {
        name: instanceName,
        userId,
      },
    });

    if (!instance) {
      return {
        success: false,
        error: "Instância não encontrada",
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (evolutionApiKey) {
      headers.apikey = evolutionApiKey;
    }

    const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Falha ao buscar status da instância",
      };
    }

    const apiInstances = await response.json();

    const apiInstance = apiInstances.find((i: any) => i.name === instanceName);

    if (!apiInstance) {
      return {
        success: false,
        error: "Instância não encontrada na API",
      };
    }

    return {
      success: true,
      data: {
        status: apiInstance.connectionStatus || "disconnected",
      },
    };
  } catch (error) {
    console.error("Erro ao buscar status da instância:", error);
    return {
      success: false,
      error: "Falha ao buscar status da instância",
    };
  }
}
