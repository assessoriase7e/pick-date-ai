"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator, Service } from "@prisma/client";

// Tipos de resposta para os serviços
type GetServicesResponse =
  | {
      success: true;
      data: ServiceWithCollaborators[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type ServiceWithCollaborators = Service & {
  serviceCollaborators: {
    collaborator: Collaborator;
  }[];
};

type SortOptions = {
  field?: string;
  direction?: "asc" | "desc";
};

type FilterOptions = {
  name?: string;
  collaboratorId?: string;
};

export async function getServices(
  page = 1,
  limit = 20,
  sort?: SortOptions,
  filter?: FilterOptions
): Promise<GetServicesResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Usuário não autenticado",
    } as const;
  }

  try {
    const skip = (page - 1) * limit;

    // Construir a condição where com base nos filtros
    let whereCondition: any = { userId };

    if (filter?.name) {
      whereCondition.name = {
        contains: filter.name,
        mode: "insensitive",
      };
    }

    // Construir a ordenação
    let orderBy: any = { createdAt: "desc" };

    if (sort?.field) {
      orderBy = {
        [sort.field]: sort.direction || "asc",
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

    // Se houver filtro por collaboratorId, filtramos após a consulta
    let filteredServices = services;
    if (filter?.collaboratorId) {
      filteredServices = services.filter((service) => {
        // Verificar colaboradores
        return service.serviceCollaborators.some(
          (sc) => sc.collaborator.id === filter.collaboratorId
        );
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: filteredServices,
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
