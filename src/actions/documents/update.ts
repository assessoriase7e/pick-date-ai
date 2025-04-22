"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateDocument(
  id: string,
  data: {
    description?: string;
    professionalId?: string;
    documentBase64?: string;
    fileName?: string;
    fileType?: string;
  }
) {
  try {
    const document = await prisma.documentRecord.update({
      where: { id },
      data,
    });

    revalidatePath("/documents");
    return { success: true, data: document };
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    return { success: false, error: "Falha ao atualizar documento" };
  }
}