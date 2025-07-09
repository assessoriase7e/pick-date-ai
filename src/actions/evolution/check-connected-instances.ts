"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function checkConnectedInstances() {
  try {
    const { id: userId } = await currentUser();

    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const connectedInstance = await prisma.evolutionInstance.findFirst({
      where: {
        userId,
        status: "open", // Status que indica instância conectada
      },
    });

    return {
      success: true,
      hasConnectedInstance: !!connectedInstance,
      instance: connectedInstance,
    };
  } catch (error) {
    console.error("Erro ao verificar instâncias conectadas:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
      hasConnectedInstance: false,
    };
  }
}
