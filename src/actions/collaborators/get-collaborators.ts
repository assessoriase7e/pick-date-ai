"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { GetCollaboratorsResponse } from "@/types/collaborator";
import { Prisma } from "@prisma/client";

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type GetCollaboratorsProps = {
  page?: number;
  limit?: number;
  where?: Prisma.CollaboratorWhereInput;
  sort?: SortOptions;
  serviceId?: number;
};

export async function getCollaborators({
  page = 1,
  limit = 10,
  where,
  sort,
  serviceId,
}: GetCollaboratorsProps): Promise<GetCollaboratorsResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Não autorizado",
    };
  }

  try {
    const skip = (page - 1) * limit;

    let orderBy: Prisma.CollaboratorOrderByWithAggregationInput = {
      createdAt: "desc",
    };

    if (sort?.field) {
      orderBy = {
        [sort.field]: sort.direction || "asc",
      };
    }

    // Construir a query where
    const finalWhere: Prisma.CollaboratorWhereInput = { ...where, userId };

    // Se tiver query de nome com contains
    if (where?.name && typeof where.name === "string") {
      finalWhere.name = {
        contains: where.name,
        mode: "insensitive",
      };
    }

    let whereCondition: Prisma.CollaboratorWhereInput = finalWhere;

    // Se tiver um serviceId, buscar em serviceCollaborators
    if (serviceId) {
      whereCondition = {
        ...finalWhere,
        serviceCollaborators: {
          some: {
            serviceId,
          },
        },
      };
    }

    const [collaborators, total] = await Promise.all([
      prisma.collaborator.findMany({
        where: whereCondition,
        include: {
          workHours: true,
          ...(serviceId ? { serviceCollaborators: true } : {})
        },
        skip,
        take: limit,
        orderBy,
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
      error: "Erro ao buscar profissionais",
    };
  }
}
