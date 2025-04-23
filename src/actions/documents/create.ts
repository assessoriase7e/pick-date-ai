"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { DocumentRecord } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

export async function createDocument(
  data: Pick<
    DocumentRecord,
    "documentBase64" | "fileName" | "fileType" | "description" | "userId"
  >
) {
  try {
    const user = await currentUser();
    data.userId = user!.id;

    const document = await prisma.documentRecord.create({ data });

    revalidatePath("/documents");
    return { success: true, data: document };
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    return { success: false, error: "Falha ao criar documento" };
  }
}
