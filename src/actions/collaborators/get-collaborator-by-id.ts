"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Collaborator } from "@prisma/client";

interface GetCollaboratorByIdResponse {
  success: boolean;
  data?: Collaborator;
  error?: string;
}

export async function getCollaboratorById(
  collaboratorId: number
): Promise<GetCollaboratorByIdResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Não autorizado",
    };
  }

  try {
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        id: collaboratorId,
        userId,
      },
      include: {
        serviceCollaborators: {
          include: {
            service: true,
          },
        },
        workHours: true, // Incluir os horários de trabalho
      },
    });

    if (!collaborator) {
      return {
        success: false,
        error: "Profissional não encontrado",
      };
    }

    return {
      success: true,
      data: collaborator,
    };
  } catch (error) {
    console.error("[GET_COLLABORATOR_BY_ID_ERROR]", error);
    return {
      success: false,
      error: "Erro ao buscar profissional",
    };
  }
}
