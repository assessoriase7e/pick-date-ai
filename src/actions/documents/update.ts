"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { DocumentRecord } from "@prisma/client";

export async function updateDocument(
  id: string,
  data: Partial<DocumentRecord>
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
