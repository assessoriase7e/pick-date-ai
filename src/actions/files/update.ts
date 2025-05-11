"use server";

import { prisma } from "@/lib/db";
import { FileRecord } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateFile(id: string, data: Partial<FileRecord>) {
  try {
    const file = await prisma.fileRecord.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    revalidatePath("/files");
    return { success: true, data: file };
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error);
    return { success: false, error: "Falha ao atualizar arquivo" };
  }
}
