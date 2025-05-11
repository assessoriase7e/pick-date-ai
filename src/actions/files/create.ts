"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { FileRecord } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function createFile(
  data: Pick<
    FileRecord,
    "fileUrl" | "fileName" | "fileType" | "description"
  >
) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const file = await prisma.fileRecord.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    revalidatePath("/files");
    return { success: true, data: file };
  } catch (error) {
    console.error("Erro ao criar arquivo:", error);
    return { success: false, error: "Falha ao criar arquivo" };
  }
}
