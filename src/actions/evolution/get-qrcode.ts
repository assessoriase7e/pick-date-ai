"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const evolutionApiUrl =
  process.env.EVOLUTION_API_URL || "https://api.evolution-api.com";
const evolutionApiKey = process.env.EVOLUTION_API_KEY || "";

export async function getQRCode(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Verificar se a instância existe e pertence ao usuário
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

    // Obter QR Code da Evolution API
    const response = await fetch(
      `${evolutionApiUrl}/instance/qrcode/${instance.name}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": evolutionApiKey,
        },
      }
    );

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        error: result.message || "Erro ao obter QR Code",
      };
    }

    const result = await response.json();

    return {
      success: true,
      data: result.qrcode,
    };
  } catch (error) {
    console.error("Erro ao obter QR Code:", error);
    return {
      success: false,
      error: "Falha ao obter QR Code",
    };
  }
}
