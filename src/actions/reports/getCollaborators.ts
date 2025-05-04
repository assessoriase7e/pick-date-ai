"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Collaborator } from "@prisma/client";

type CollaboratorsSuccess = {
  success: true;
  data: Collaborator[];
};

type CollaboratorsError = {
  success: false;
  error: string;
};

export const getCollaborators = async (
  serviceId?: string
): Promise<CollaboratorsSuccess | CollaboratorsError> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Usuário não autenticado" };
  }

  try {
    const whereCondition: any = {
      userId,
    };

    if (serviceId) {
      whereCondition.services = {
        some: {
          serviceId: serviceId,
        },
      };
    }

    const collaborators = await prisma.collaborator.findMany({
      where: whereCondition,
      include: {
        services: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: collaborators,
    };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: "Falha ao buscar colaboradores" };
  }
};
