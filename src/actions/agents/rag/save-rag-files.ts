"use server";

import { prisma } from "@/lib/db";
import { RagFile } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveRagFiles({
  userId,
  ragFiles,
}: {
  userId: string;
  ragFiles: RagFile[];
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
        })),
      });
    }

    revalidatePath("/agents");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar arquivos RAG:", error);
    return { success: false, error: "Falha ao salvar arquivos RAG" };
  }
}
