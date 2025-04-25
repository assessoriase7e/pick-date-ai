"use server";

import { prisma } from "@/lib/db";

export const saveRagWebhook = async ({
  userId,
  webhookUrl,
  metadataKey,
}: {
  userId: string;
  webhookUrl: string;
  metadataKey?: string;
}) => {
  try {
    await prisma.ragConfig.upsert({
      where: { userId },
      update: { webhookUrl },
      create: { webhookUrl, userId, metadataKey },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar URL do webhook:", error);
    return { success: false, error: "Falha ao salvar URL do webhook" };
  }
};
