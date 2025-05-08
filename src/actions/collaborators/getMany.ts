"use server";

import { prisma } from "@/lib/db";
import { getClerkUser } from "../auth/getClerkUser";

export async function listCollaborators(serviceId?: string) {
  const user = await getClerkUser();

  if (!user) {
    return {
      success: false,
      error: "Usuário não autenticado",
    };
  }

  try {
    if (serviceId) {
      const collaborators = await prisma.collaborator.findMany({
        where: {
          userId: user.id,
          services: {
            some: {
              id: serviceId,
            },
          },
        },
        include: {
          services: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        data: collaborators,
      };
    }

    const collaborators = await prisma.collaborator.findMany({
      where: {
        userId: user.id,
      },
      include: {
        services: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: collaborators,
    };
  } catch (error) {
    console.error("[LIST_COLLABORATORS_ERROR]", error);
    return {
      success: false,
      error: "Erro ao buscar profissionais",
    };
  }
}
