"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

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

    return {
      success: true,
      data: instance.qrCode,
    };
  } catch (error) {
    console.error("Erro ao obter QR Code:", error);
    return {
      success: false,
      error: "Falha ao obter QR Code",
    };
  }
}
