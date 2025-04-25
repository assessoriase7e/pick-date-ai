"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type RagFile = {
  id: string;
  name: string;
  content: string;
  metadataKey?: string;
};

export async function saveRagFiles({
  userId,
  ragFiles,
  webhookUrl,
}: {
  userId: string;
  ragFiles: RagFile[];
  webhookUrl?: string;
}) {
  try {
    await prisma.ragFile.deleteMany({
      where: { userId },
    });

    if (ragFiles.length > 0) {
      await prisma.ragFile.createMany({
        data: ragFiles.map((file) => ({
          name: file.name,
          content: file.content,
          userId,
          metadataKey: file.metadataKey || null,
        })),
      });
    }

    if (webhookUrl) {
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
    }

    await prisma.webhookConfig.upsert({
      where: { userId },
      update: { url: webhookUrl || "" },
      create: { userId, url: webhookUrl || "" },
    });

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar arquivos RAG:", error);
    return { success: false, error: "Falha ao salvar arquivos RAG" };
  }
}
