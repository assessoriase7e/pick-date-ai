"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type ListFilesSuccess = {
  success: true;
  data: {
    files: any[];
    totalPages: number;
    currentPage: number;
  };
};

type ListFilesError = {
  success: false;
  error: string;
};

export async function listFiles(
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortField: string = "createdAt",
  sortDirection: "asc" | "desc" = "desc"
): Promise<ListFilesSuccess | ListFilesError> {
  try {
    const skip = (page - 1) * limit;
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const whereClause: Prisma.FileRecordWhereInput = {
      userId: user.id,
      ...(search
        ? {
            OR: [
              {
                fileName: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                fileType: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
    };

    // Configurar ordenação dinâmica
    const orderBy: any = {};
    orderBy[sortField] = sortDirection;

    const [files, total] = await Promise.all([
      prisma.fileRecord.findMany({
        skip,
        take: limit,
        orderBy,
        where: whereClause,
      }),
      prisma.fileRecord.count({
        where: whereClause,
      }),
    ]);

    return {
      success: true,
      data: {
        files,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return { success: false, error: "Falha ao listar arquivos" };
  }
}
