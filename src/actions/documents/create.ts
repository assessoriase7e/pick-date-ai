"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { DocumentRecord } from "@prisma/client";

export async function createDocument(data: Omit<DocumentRecord, "id" | "createdAt" | "updatedAt">) {
  try {
    const document = await prisma.documentRecord.create({
      data: {
        documentBase64: data.documentBase64,
        fileName: data.fileName,
        fileType: data.fileType,
        description: data.description,
        professionalId: data.professionalId,
      },
    });

    revalidatePath("/documents");
    return { success: true, data: document };
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    return { success: false, error: "Falha ao criar documento" };
  }
}