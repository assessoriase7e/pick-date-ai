"use server";
import { prisma } from "@/lib/db";
import { updateRagContent } from "./update-rag-content";

export const triggerProfileRagUpdate = async (userId: string) => {
  try {
    if (!process.env.RAG_WEBHOOK_URL) {
      return { success: true, message: "Webhook não configurado" };
    }

    try {
      const response = await fetch(process.env.RAG_WEBHOOK_URL, {
        method: "OPTIONS",
      });

      if (!response.ok) {
        return {
          success: true,
          message: "Webhook indisponível, fluxo ignorado",
        };
      }
    } catch (error) {
      return {
        success: true,
        message: "Erro de conexão com webhook, fluxo ignorado",
      };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.companyName) {
      return {
        success: false,
        error: "Perfil ou nome da empresa não encontrado",
      };
    }
    await updateRagContent();

    return;
  } catch (error) {
    console.error("Erro ao acionar atualização RAG do perfil:", error);
    return { success: false, error: "Falha ao acionar atualização RAG" };
  }
};
