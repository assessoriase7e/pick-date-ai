"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator, Prisma, Service } from "@prisma/client";
import { ServiceFullData } from "@/types/service";

type GetServicesResponse =
  | {
      success: true;
      data: ServiceFullData[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type ServiceWithCollaborators = Service & {
  collaborator: Collaborator | null;
  serviceCollaborators: {
    collaborator: Collaborator;
  }[];
};

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type GetServicesProps = {
  where?: Prisma.ServiceWhereInput;
  page?: number;
  limit?: number;
  sort?: SortOptions;
  collaboratorId?: string;
};

export async function getServices({
  page = 1,
  limit = 10,
  sort,
  where,
  collaboratorId,
}: GetServicesProps): Promise<GetServicesResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    } as const;
  }

  try {
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };

    if (sort?.field) {
      orderBy = {
        [sort.field]: sort.direction || "asc",
      };
    }

    // Construir a query where
    const finalWhere: Prisma.ServiceWhereInput = { ...where, userId };

    // Se tiver query de nome com contains
    if (where?.name && typeof where.name === "string") {
      finalWhere.name = {
        contains: where.name,
        mode: "insensitive",
      };
    }

    let whereCondition: Prisma.ServiceWhereInput = finalWhere;

    // Se tiver um collaboratorId, buscar tanto na relação direta quanto em ServiceCollaborator
    if (collaboratorId) {
      whereCondition = {
        ...finalWhere,
        OR: [
          {
            serviceCollaborators: {
              some: {
                collaboratorId,
              },
            },
          },
        ],
      };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereCondition,
        orderBy,
        skip,
        take: limit,
        include: {
          serviceCollaborators: {
            include: {
              collaborator: true,
            },
          },
        },
      }),
      prisma.service.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: services as ServiceFullData[],
      pagination: {
        totalPages,
        currentPage: page,
      },
    } as const;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return {
      success: false,
      error: "Falha ao buscar serviços",
    } as const;
  }
}
