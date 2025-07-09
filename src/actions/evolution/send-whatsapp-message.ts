"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { evolution } from "@/utils/evolution";

type SendWhatsAppMessageParams = {
  to: string;
  message: string;
};

export async function sendWhatsAppMessage(params: SendWhatsAppMessageParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    // Buscar uma instância conectada do usuário
    const connectedInstance = await prisma.evolutionInstance.findFirst({
      where: {
        userId,
        status: "open", // Status que indica instância conectada
      },
    });

    if (!connectedInstance) {
      return {
        success: false,
        error: "Nenhuma instância de WhatsApp conectada",
      };
    }

    // Formatar o número de telefone (remover caracteres não numéricos)
    const formattedPhone = params.to.replace(/\D/g, "");

    // Enviar mensagem usando a função do utils/evolution.ts
    const evo = evolution();
    await evo.sendMessage({
      instance: connectedInstance.name,
      text: params.message,
      number: formattedPhone,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: "Erro ao enviar mensagem",
    };
  }
}