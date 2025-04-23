"use server";

import { prisma } from "@/lib/db";

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

    const [documents, total] = await Promise.all([
      prisma.documentRecord.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
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
