"use server";
import { prisma } from "@/lib/db";
import { User } from "@prisma/client";

type UserWithRelations = User & {
  _count: {
    audios: number;
    images: number;
  };
};

type ListProfessionalsSuccess = {
  success: true;
  data: {
    professionals: UserWithRelations[];
    totalPages: number;
  };
};

type ListProfessionalsError = {
  success: false;
  error: string;
};

export async function listProfessionals(
  page: number = 1,
  limit: number = 50
): Promise<ListProfessionalsSuccess | ListProfessionalsError> {
  try {
    const skip = (page - 1) * limit;

    const professionals = await prisma.user.findMany({
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
    });
    const total = await prisma.user.count();

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
