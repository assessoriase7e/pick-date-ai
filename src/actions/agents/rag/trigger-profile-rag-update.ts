"use server";

import { prisma } from "@/lib/db";
import { callProfileWebhook } from "./call-profile-webhook";
import { ragConfig } from "@/config/rag";

export const triggerProfileRagUpdate = async (userId: string) => {
  try {
    // Verificar se a URL do webhook está configurada
    if (!ragConfig.webhookUrl) {
      return { success: true, message: "Webhook não configurado" };
    }

    // Buscar o perfil para obter o nome da empresa
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.companyName) {
      return { success: false, error: "Perfil ou nome da empresa não encontrado" };
    }

    // Formatar o nome da empresa como metadataKey (minúsculo e com underscores)
    const metadataKey = profile.companyName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    // Chamar o webhook com os dados do perfil
    return await callProfileWebhook({
      userId,
      webhookUrl: ragConfig.webhookUrl,
      metadataKey,
    });
  } catch (error) {
    console.error("Erro ao acionar atualização RAG do perfil:", error);
    return { success: false, error: "Falha ao acionar atualização RAG" };
  }
};
