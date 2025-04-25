"use server";

import { RagFile } from "@prisma/client";

export const callRagWebhook = async ({
  webhookUrl,
  ragFiles,
}: {
  webhookUrl: string;
  ragFiles: RagFile[];
  metadataKey: string;
}) => {
  try {
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao chamar webhook: ${response.statusText}`);
    }
  } catch (webhookError) {
    console.error("Erro ao chamar webhook:", webhookError);
  }
};
