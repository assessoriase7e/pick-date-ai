"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { ServiceFullData } from "@/types/service";

type GetServicesResponse =
  | {
      success: true;
      data: ServiceFullData[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type GetServicesProps = {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  where?: Prisma.ServiceWhereInput;
  collaboratorId?: number;
  search?: string;
  filterColumn?: string;
};

export async function getServices({
  page = 1,
  limit = 20,
  sort,
  where,
  collaboratorId,
  search,
  filterColumn = "all",
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
    let finalWhere: Prisma.ServiceWhereInput = { ...where, userId };

    // Aplicar filtro de busca baseado na coluna selecionada
    if (search) {
      if (filterColumn === "all" || !filterColumn) {
        // Busca em todos os campos
        finalWhere = {
          ...finalWhere,
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              notes: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        };
      } else {
        // Busca em um campo específico
        finalWhere = {
          ...finalWhere,
          [filterColumn]: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        };
      }
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
