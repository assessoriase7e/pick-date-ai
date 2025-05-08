"use server";

import { RagFile } from "@prisma/client";

export const callRagWebhook = async ({
  webhookUrl,
  ragFiles,
  metadataKey,
}: {
  webhookUrl: string;
  ragFiles: RagFile[];
  metadataKey: string;
}) => {
  try {
    if (!webhookUrl || !metadataKey) {
      return {
        success: true,
        message: "Sem configuração de webhook para chamar",
      };
    }

    const formattedContent = ragFiles
      .map((file) => `\n\n${file.content}\n\n`)
      .join("\n\n");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ragFiles: formattedContent,
        metadataKey: metadataKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao chamar webhook: ${response.statusText}`);
    }

    return { success: true };
  } catch (webhookError) {
    console.error("Erro ao chamar webhook:", webhookError);
    return { success: false, error: "Falha ao chamar webhook" };
  }
};
