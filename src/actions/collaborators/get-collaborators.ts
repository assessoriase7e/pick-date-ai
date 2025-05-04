"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { GetCollaboratorsResponse } from "@/types/collaborator";

export async function getCollaborators(
  page = 1,
  limit = 10,
  serviceId?: string
): Promise<GetCollaboratorsResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Não autorizado",
    };
  }

  try {
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      userId,
    };

    if (serviceId) {
      whereCondition.services = {
        some: {
          id: serviceId,
        },
      };
    }

    const [collaborators, total] = await Promise.all([
      prisma.collaborator.findMany({
        where: whereCondition,
        include: {
          ServiceCollaborator: {
            include: {
              service: true
            }
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.collaborator.count({
        where: whereCondition,
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
    console.error("[GET_COLLABORATORS_ERROR]", error);
    return {
      success: false,
      error: "Erro ao buscar colaboradores",
    };
  }
}
