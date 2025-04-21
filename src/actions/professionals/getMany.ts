"use server";

import { prisma } from "@/lib/db";
import { Professional } from "@prisma/client";

type ProfessionalWithRelations = Professional & {
  _count: {
    audios: number;
    images: number;
  };
};

type ListProfessionalsSuccess = {
  success: true;
  data: {
    professionals: ProfessionalWithRelations[];
    totalPages: number;
  };
};

type ListProfessionalsError = {
  success: false;
  error: string;
};

export async function listProfessionals(
  page: number = 1,
  limit: number = 10
): Promise<ListProfessionalsSuccess | ListProfessionalsError> {
  try {
    const skip = (page - 1) * limit;

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              audios: true,
              images: true,
            },
          },
        },
      }),
      prisma.professional.count(),
    ]);

    return {
      success: true,
      data: {
        professionals,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar profissionais:", error);
    return { success: false, error: "Falha ao listar profissionais" };
  }
}
