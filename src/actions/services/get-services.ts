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

type FilterOptions = {
  name?: string;
  collaboratorId?: string;
};

type GetServicesProps = {
  where?: Prisma.ServiceWhereInput;
  page?: number;
  limit?: number;
  sort?: SortOptions;
};

export async function getServices({
  page = 1,
  limit = 20,
  sort,
  where,
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

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          collaborator: true,
          serviceCollaborators: {
            include: {
              collaborator: true,
            },
          },
        },
      }),
      prisma.service.count({
        where,
      }),
    ]);

    let filteredServices = services;
    if (where?.collaboratorId) {
      filteredServices = services.filter((service) => {
        return service.serviceCollaborators.some(
          (sc) => sc.collaborator.id === where.collaboratorId
        );
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: filteredServices as ServiceFullData[],
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
