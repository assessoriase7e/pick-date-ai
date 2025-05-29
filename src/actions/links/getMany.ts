"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function listLinks(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    const skip = (page - 1) * limit;

    // Condição de busca
    const whereCondition = {
      userId: user.id,
      ...(search
        ? {
            OR: [
              {
                title: { contains: search, mode: Prisma.QueryMode.insensitive },
              },
              { url: { contains: search, mode: Prisma.QueryMode.insensitive } },
              {
                description: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: whereCondition,
      }),
      prisma.link.count({
        where: whereCondition,
      }),
    ]);

    return {
      success: true,
      data: {
        links,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Erro ao listar links:", error);
    return { success: false, error: "Falha ao listar links" };
  }
}
