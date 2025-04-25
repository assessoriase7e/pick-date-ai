"use server";

import { prisma } from "@/lib/db";

export async function getWebhookUrl(userId: string) {
  try {
    const config = await prisma.webhookConfig.findUnique({
      where: { userId },
    });
    
    return {
      success: true,
      data: { url: config?.url || "" }
    };
  } catch (error) {
    console.error("Erro ao buscar URL do webhook:", error);
    return { success: false, error: "Falha ao buscar URL do webhook" };
  }
}