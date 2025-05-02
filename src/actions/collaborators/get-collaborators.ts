"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getCollaborators(page = 1, limit = 10) {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Não autorizado",
    };
  }

  try {
    const skip = (page - 1) * limit;

    const [collaborators, total] = await Promise.all([
      prisma.collaborator.findMany({
        where: {
          userId,
        },
        include: {
          services: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.collaborator.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: collaborators,
      pagination: {
        totalPages,
        currentPage: page,
        total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro ao buscar colaboradores",
    };
  }
}
