"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator, Service } from "@prisma/client";

// Tipos de resposta para os serviços
type GetServicesResponse =
  | {
      success: true;
      data: ServiceWithCollaborator[];
      pagination: { totalPages: number; currentPage: number };
    }
  | { success: false; error: string };

type ServiceWithCollaborator = Service & {
  collaborator: Collaborator | null;
};

export async function getServices(
  page = 1,
  limit = 20
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

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          collaborator: true,
        },
      }),
      prisma.service.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: services,
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
