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
          ServiceCollaborator: {
            some: {
              serviceId: serviceId,
            },
          },
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
        ServiceCollaborator: {
          include: {
            service: true,
          },
        },
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
