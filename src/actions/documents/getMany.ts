"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

type ListDocumentsSuccess = {
  success: true;
  data: {
    documents: any[];
    totalPages: number;
  };
};

type ListDocumentsError = {
  success: false;
  error: string;
};

export async function listDocuments(
  page: number = 1,
  limit: number = 10
): Promise<ListDocumentsSuccess | ListDocumentsError> {
  try {
    const skip = (page - 1) * limit;

    const user = await currentUser();

    const [documents, total] = await Promise.all([
      prisma.documentRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: { userId: user?.id },
      }),
      prisma.documentRecord.count(),
    ]);

    return {
      success: true,
      data: {
        documents,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    return { success: false, error: "Falha ao listar documentos" };
  }
}
