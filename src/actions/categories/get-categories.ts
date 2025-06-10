"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

type GetCategoriesResponse =
  | {
      success: true;
      data: any[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type GetCategoriesProps = {
  where?: Prisma.CategoryWhereInput;
  page?: number;
  limit?: number;
};

export async function getCategories({
  page = 1,
  limit = 20,
  where,
}: GetCategoriesProps): Promise<GetCategoriesResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    } as const;
  }

  try {
    const skip = (page - 1) * limit;

    const whereClause = {
      userId,
      ...where,
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              services: true,
            },
          },
        },
      }),
      prisma.category.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: categories,
      pagination: {
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}
